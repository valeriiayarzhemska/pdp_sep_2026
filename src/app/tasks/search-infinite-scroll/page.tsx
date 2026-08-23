import Link from 'next/link';
import { Suspense } from 'react';
import SearchResults from './SearchResults';

export const metadata = {
  title: 'Flight & Hotel Search — PDP',
};

export default function SearchInfiniteScrollPage() {
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
          [PoC] Flight & Hotel Search Results with Infinite Scroll
        </h1>
        <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-medium text-blue-300">
          Middle · Develop
        </span>
      </div>

      <p className="mt-2 max-w-2xl text-sm text-neutral-400">
        600 mock hotel stays, server-side filtered and cursor-paginated,
        virtualized so the DOM stays flat as you scroll. Full DFA write-up:{' '}
        <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
          docs/tasks/search-infinite-scroll-dfa.md
        </code>
        .
      </p>

      <section className="mt-8 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
        <h2 className="text-sm font-semibold text-neutral-200">
          Design decisions at a glance
        </h2>
        
        <ul className="mt-3 grid gap-2 text-sm text-neutral-400">
          <li>
            <strong className="text-neutral-200">
              Filtering &amp; sorting:
            </strong>{' '}
            server-side — filters/sort are query params on{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              /api/search/offers
            </code>
            . Changing them opens a distinct{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              @tanstack/react-query
            </code>{' '}
            cache entry, so a stale in-flight response for the old filters can
            never land on top of the new result set — it has nowhere to land.
          </li>
          <li>
            <strong className="text-neutral-200">Pagination:</strong>{' '}
            cursor-based (id-anchored, not page-number), fetched via{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              useInfiniteQuery
            </code>{' '}
            and triggered by a virtualizer-driven &quot;near the end&quot;
            check.
          </li>
          <li>
            <strong className="text-neutral-200">Virtualization:</strong>{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              @tanstack/react-virtual
            </code>
            &apos;s window virtualizer — only the rows near the viewport are
            ever mounted, no matter how many pages have loaded.
          </li>
          <li>
            <strong className="text-neutral-200">Favorites:</strong> optimistic
            — the heart flips instantly, and one fixed offer is rigged to always
            fail server-side so the rollback path is real and demonstrable, not
            theoretical.
          </li>
          <li>
            <strong className="text-neutral-200">Price staleness:</strong> each
            offer carries its own &quot;priced as of&quot; timestamp; a badge
            and refresh action appear per-row once it&apos;s old enough,
            independent of the rest of the page.
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <Suspense
          fallback={<p className="text-sm text-neutral-500">Loading search…</p>}
        >
          <SearchResults />
        </Suspense>
      </section>
    </main>
  );
}
