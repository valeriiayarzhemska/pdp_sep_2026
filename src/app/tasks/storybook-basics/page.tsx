import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Storybook Basics — PDP',
};

export default function StorybookBasicsPage() {
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
          Storybook Basics
        </h1>
        <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-medium text-blue-300">
          Middle · Develop
        </span>
      </div>

      <p className="mt-2 max-w-2xl text-sm text-neutral-400">
        Storybook 10 set up against this repo&apos;s real components — the ones
        from the search task, not throwaway examples — with controls, actions,
        interaction tests, an a11y check, and one hand-written docs page.
      </p>

      <section className="mt-8 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
        <h2 className="text-sm font-semibold text-neutral-200">
          Run it yourself
        </h2>
        <p className="mt-2 text-sm text-neutral-400">
          Storybook runs as its own dev server, separate from this Next.js app —
          it can&apos;t be embedded as just another page here, so these are real
          terminal commands to try:
        </p>
        <ul className="mt-3 grid gap-2 text-sm text-neutral-400">
          <li>
            <code className="rounded bg-neutral-800 px-1.5 py-0.5 text-xs">
              npm run storybook
            </code>{' '}
            — dev server at{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              localhost:6006
            </code>
          </li>
          <li>
            <code className="rounded bg-neutral-800 px-1.5 py-0.5 text-xs">
              npm run test:storybook
            </code>{' '}
            — runs every story (including play-function interactions) as a real
            headless-browser test via the Vitest addon
          </li>
          <li>
            <code className="rounded bg-neutral-800 px-1.5 py-0.5 text-xs">
              npm run build-storybook
            </code>{' '}
            — static output to{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              storybook-static/
            </code>
            , deployable to any static host (Chromatic, Vercel, GitHub Pages)
          </li>
        </ul>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <figure className="overflow-hidden rounded-xl border border-neutral-800">
          <Image
            src="/storybook-preview/offercard-story.png"
            alt="The OfferCard component rendered in Storybook, with the Controls panel showing its args"
            width={1400}
            height={900}
            className="w-full"
          />
          <figcaption className="border-t border-neutral-800 bg-neutral-900/60 px-3 py-2 text-xs text-neutral-500">
            <code className="rounded bg-neutral-800 px-1 py-0.5">
              OfferCard
            </code>{' '}
            — Default story, Controls panel open
          </figcaption>
        </figure>
        <figure className="overflow-hidden rounded-xl border border-neutral-800">
          <Image
            src="/storybook-preview/offercard-docs.png"
            alt="The hand-written MDX documentation page for OfferCard"
            width={1400}
            height={900}
            className="w-full"
          />
          <figcaption className="border-t border-neutral-800 bg-neutral-900/60 px-3 py-2 text-xs text-neutral-500">
            Hand-written MDX docs page (not auto-generated)
          </figcaption>
        </figure>
      </section>

      <section className="mt-8 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
        <h2 className="text-sm font-semibold text-neutral-200">
          What&apos;s actually set up
        </h2>
        <ul className="mt-3 grid gap-3 text-sm text-neutral-400">
          <li>
            <strong className="text-neutral-200">
              Components with stories, not new ones:
            </strong>{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              OfferCard
            </code>
            ,{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              FiltersBar
            </code>
            , and{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              SortSelect
            </code>{' '}
            from the{' '}
            <Link
              href="/tasks/search-infinite-scroll"
              className="underline hover:text-neutral-200"
            >
              search task
            </Link>{' '}
            — real components already carrying real props, not toy examples.
          </li>
          <li>
            <strong className="text-neutral-200">
              CSF3 stories, controls &amp; actions:
            </strong>{' '}
            each story is a typed{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              args
            </code>{' '}
            object; callback props use{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              fn()
            </code>{' '}
            from{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              storybook/test
            </code>{' '}
            so every call shows up in the Actions panel automatically.
          </li>
          <li>
            <strong className="text-neutral-200">
              Play functions (real interaction tests):
            </strong>{' '}
            e.g. &quot;Clicking Save toggles favorite&quot; actually clicks the
            button via{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              userEvent
            </code>{' '}
            and asserts the callback fired with the right arguments — not just a
            rendered snapshot.
          </li>
          <li>
            <strong className="text-neutral-200">Addons:</strong> a11y (
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              @storybook/addon-a11y
            </code>
            , zero violations on every story here), backgrounds/viewport
            (Storybook essentials), and the Vitest addon — see below for why
            that one replaced storyshots.
          </li>
          <li>
            <strong className="text-neutral-200">
              Documentation, both ways:
            </strong>{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              tags: [&apos;autodocs&apos;]
            </code>{' '}
            auto-generates a docs page for{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              FiltersBar
            </code>{' '}
            and{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              SortSelect
            </code>
            ;{' '}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">
              OfferCard.mdx
            </code>{' '}
            is a hand-written docs page instead, to show that path too.
          </li>
        </ul>
      </section>
    </main>
  );
}
