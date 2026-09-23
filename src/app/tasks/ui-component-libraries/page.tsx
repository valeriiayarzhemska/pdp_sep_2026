import Link from 'next/link';

export const metadata = {
  title: 'UI Component Libraries — PDP',
};

export default function UiComponentLibrariesPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link
        href="/"
        className="text-sm text-neutral-400 hover:text-neutral-200"
      >
        ← Dashboard
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-neutral-100">
          UI Component Libraries
        </h1>

        <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-medium text-blue-300">
          Junior · Develop
        </span>
      </div>

      <p className="mt-2 max-w-2xl text-sm text-neutral-400">
        The same &quot;team members&quot; screen — select, sortable/paginated
        table, typography, a dialog-hosted form with validation, loading states,
        and a date picker — built twice: once in{' '}
        <strong className="text-neutral-200">shadcn/ui</strong> and once in{' '}
        <strong className="text-neutral-200">MUI</strong>. Same data layer (one
        TanStack Query hook, one Zod schema, one mock API route), two completely
        different rendering and theming approaches.
      </p>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/tasks/ui-component-libraries/shadcn"
          className="block rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 transition-colors hover:border-blue-500/50 hover:bg-neutral-900"
        >
          <span className="rounded-full bg-neutral-800 px-2.5 py-0.5 text-xs font-medium text-neutral-300">
            Tailwind-native · copy-paste
          </span>

          <h2 className="mt-3 text-lg font-semibold text-neutral-100">
            shadcn/ui demo →
          </h2>

          <p className="mt-1.5 text-sm text-neutral-400">
            Radix/Base UI primitives, copy-pasted into{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5">
              src/components/ui
            </code>
            , styled with Tailwind + CSS variables.
          </p>
        </Link>

        <Link
          href="/tasks/ui-component-libraries/mui"
          className="block rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 transition-colors hover:border-blue-500/50 hover:bg-neutral-900"
        >
          <span className="rounded-full bg-neutral-800 px-2.5 py-0.5 text-xs font-medium text-neutral-300">
            npm-installed · CSS-in-JS
          </span>

          <h2 className="mt-3 text-lg font-semibold text-neutral-100">
            MUI demo →
          </h2>

          <p className="mt-1.5 text-sm text-neutral-400">
            A conventional installed component library, themed via{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5">
              createTheme()
            </code>{' '}
            and rendered through Emotion.
          </p>
        </Link>
      </section>
    </main>
  );
}
