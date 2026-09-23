import Link from 'next/link';
import AutocompleteDemos from './AutocompleteDemos';

export const metadata = {
  title: '[PoC] Autocomplete Search Component — PDP',
};

export default function AutocompleteSearchPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/"
        className="text-sm text-neutral-400 hover:text-neutral-200"
      >
        ← Dashboard
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-neutral-100">
          [PoC] Autocomplete Search Component
        </h1>
        <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-medium text-blue-300">
          Develop
        </span>
      </div>

      <p className="mt-2 max-w-2xl text-sm text-neutral-400">
        One reusable{' '}
        <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
          &lt;Autocomplete&gt;
        </code>{' '}
        component, driven by three unrelated mock backends below, proving
        it&apos;s genuinely backend-agnostic and rendering-agnostic. Full DFA
        write-up:{' '}
        <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
          docs/tasks/autocomplete-search-dfa.md
        </code>
        .
      </p>

      <section className="mt-8 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
        <h2 className="text-sm font-semibold text-neutral-200">
          Design decisions at a glance
        </h2>
        <ul className="mt-3 grid gap-2 text-sm text-neutral-400">
          <li>
            <strong className="text-neutral-200">Debounce:</strong> only the
            network fetch is debounced (250ms default) — the input itself never
            lags, and a cache hit skips the debounce entirely since there&apos;s
            no request to protect.
          </li>
          <li>
            <strong className="text-neutral-200">Race safety:</strong> an{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              AbortController
            </code>{' '}
            cancels the previous request on every new one, backed by a monotonic
            request-id ref that discards any response arriving out of order —
            even one the browser had already started delivering before the abort
            landed.
          </li>
          <li>
            <strong className="text-neutral-200">Cache:</strong> an LRU{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              Map&lt;query, results&gt;
            </code>{' '}
            keyed by every distinct query seen this session (not just the
            latest), so backspacing to an earlier prefix is an instant,
            zero-network cache hit.
          </li>
          <li>
            <strong className="text-neutral-200">Rendering:</strong> the
            component owns the accessible{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              role=&quot;option&quot;
            </code>{' '}
            wrapper and keyboard/mouse wiring; callers supply a{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              renderOption
            </code>{' '}
            render prop for the content — text-only, image swatch, or avatar,
            below.
          </li>
          <li>
            <strong className="text-neutral-200">Large result sets:</strong>{' '}
            capped to the top 50 matches client-side and rendered through{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              @tanstack/react-virtual
            </code>{' '}
            regardless, so a 600-item response never mounts more DOM than
            what&apos;s actually visible.
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <AutocompleteDemos />
      </section>

      <section className="mt-10 h-42"></section>
    </main>
  );
}
