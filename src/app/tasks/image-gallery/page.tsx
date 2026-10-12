import Link from 'next/link';
import { GALLERY_PRODUCTS } from '@/lib/gallery-data';
import Gallery from './Gallery';

export const metadata = {
  title: 'Image Gallery with Lazy Loading — PDP',
};

export default function ImageGalleryPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href="/"
        className="text-sm text-neutral-400 hover:text-neutral-200"
      >
        ← Dashboard
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-neutral-100">
          [PoC] Image Gallery with Lazy Loading
        </h1>
        <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
          Junior · Develop
        </span>
      </div>

      <p className="mt-2 max-w-3xl text-sm text-neutral-400">
        200 tiles, a responsive grid, zero layout shift, and a
        keyboard-navigable lightbox — with real, crawlable product links
        underneath the JS-enhanced preview. Full DFA write-up:{' '}
        <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
          docs/tasks/image-gallery-dfa.md
        </code>
        .
      </p>

      <section className="mt-8 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
        <h2 className="text-sm font-semibold text-neutral-200">
          Design decisions at a glance
        </h2>
        <ul className="mt-3 grid gap-2 text-sm text-neutral-400">
          <li>
            <strong className="text-neutral-200">Rendering:</strong> SSR. Every
            tile is a real{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              {'<a href>'}
            </code>{' '}
            to its product page in the initial HTML — crawlable and usable with
            no JS. The lightbox is a client-side enhancement layered on top.
          </li>

          <li>
            <strong className="text-neutral-200">Lazy loading:</strong>{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              next/image
            </code>{' '}
            (native{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              loading=&quot;lazy&quot;
            </code>{' '}
            under the hood) for everything except the first 6 tiles, which load
            eagerly at{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              fetchpriority=&quot;high&quot;
            </code>{' '}
            since they&apos;re guaranteed above the fold.
          </li>

          <li>
            <strong className="text-neutral-200">CLS:</strong> every tile is a{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              aspect-square
            </code>{' '}
            box with a solid placeholder color — the box exists before the image
            does, so nothing shifts when it finishes loading.
          </li>
          <li>
            <strong className="text-neutral-200">Responsive images:</strong>{' '}
            real photos from a resizing CDN (
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              picsum.photos/seed/…/{'{w}/{w}'}.webp
            </code>
            ) via a custom{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              next/image
            </code>{' '}
            loader. Every image ships a{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              srcset
            </code>{' '}
            plus a{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              sizes
            </code>{' '}
            that mirrors the 2/3/4/6-column grid, so the browser requests only
            the width the tile needs at the current viewport and pixel density.
            The badge on each tile shows the size actually loaded — resize the
            window (or switch DevTools device mode) and reload to watch it
            change.
          </li>
          <li>
            <strong className="text-neutral-200">Lightbox:</strong>{' '}
            focus-trapped modal, Arrow keys to browse (with neighbor preloading
            via{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              {'<link rel=preload>'}
            </code>
            ), Escape to close and return focus to the tile that opened it.
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <Gallery products={GALLERY_PRODUCTS} />
      </section>
    </main>
  );
}
