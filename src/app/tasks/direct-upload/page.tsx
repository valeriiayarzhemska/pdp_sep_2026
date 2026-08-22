import Link from 'next/link';
import { getAllAttachments, getDemoRecords } from '@/app/actions/uploads';
import UploadWidget from './UploadWidget';

export const metadata = {
  title: 'Direct Attachments Upload — PDP',
};

export default async function DirectUploadPage() {
  const records = await getDemoRecords();
  const initialAttachments = await getAllAttachments();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href="/"
        className="text-sm text-neutral-400 hover:text-neutral-200"
      >
        ← Dashboard
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-neutral-100">
          Frontend Direct Attachments Upload
        </h1>
        <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-medium text-blue-300">
          Middle · Develop
        </span>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-neutral-400">
        Files never pass through the app server. The browser uploads bytes
        straight to storage using a short-lived presigned URL, and the server
        only ever sees metadata.
      </p>

      <section className="mt-8 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
        <h2 className="text-sm font-semibold text-neutral-200">
          How this implementation works
        </h2>
        <ol className="mt-3 grid gap-2 text-sm text-neutral-400">
          <li>
            <strong className="text-neutral-200">1. Request a URL</strong> — the
            client calls the{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              requestUploadUrl
            </code>{' '}
            server action with the file&apos;s name/type/size. The backend
            validates it against allowed types and a size limit, then issues a
            single-use, time-limited (60s) ticket for an exact key — it never
            receives the file itself.
          </li>
          <li>
            <strong className="text-neutral-200">
              2. Upload directly to storage
            </strong>{' '}
            — the browser sends the raw file with an{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              XMLHttpRequest PUT
            </code>{' '}
            straight to the storage endpoint (a Route Handler here, standing in
            for S3/GCS), using{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              xhr.upload.onprogress
            </code>{' '}
            for a real progress bar — something a plain <code>fetch()</code>{' '}
            can&apos;t give you. A real bucket would additionally need CORS
            rules allowing PUT from your app&apos;s origin.
          </li>
          <li>
            <strong className="text-neutral-200">
              3. Assign the attachment
            </strong>{' '}
            — once the upload succeeds, the client calls{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              assignAttachment
            </code>
            . The backend does not trust the client&apos;s claim that the file
            exists — it checks that the object was actually written to storage
            (ticket marked{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              used
            </code>
            ) before creating the attachment record.
          </li>
        </ol>
        <details className="mt-4 text-sm text-neutral-400">
          <summary className="cursor-pointer font-medium text-neutral-300">
            Why not just upload through the backend?
          </summary>
          <p className="mt-2">
            Routing large files through your API server doubles bandwidth (in
            from the client, out to storage), ties up server request
            handlers/memory for the duration of the upload, and doesn&apos;t
            scale under concurrent large uploads. Direct upload lets storage
            handle the heavy lifting the backend only ever deals with small JSON
            payloads.
          </p>
        </details>
        <details className="mt-2 text-sm text-neutral-400">
          <summary className="cursor-pointer font-medium text-neutral-300">
            Presigned URL security notes
          </summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              Short expiry (here: 60s) limits the window a leaked URL could be
              replayed in.
            </li>
            <li>
              Single-use: the ticket is marked used after one successful PUT.
            </li>
            <li>
              Scoped to one exact key, content-type and size — not a blank check
              to upload anything.
            </li>
            <li>
              The backend re-verifies the object exists in storage before
              trusting it, rather than trusting client-reported metadata.
            </li>
          </ul>
        </details>
      </section>

      <section className="mt-8">
        <UploadWidget
          records={records}
          initialAttachments={initialAttachments}
        />
      </section>
    </main>
  );
}
