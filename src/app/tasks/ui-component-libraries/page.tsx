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

      <section className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
        <h2 className="text-sm font-semibold text-neutral-200">
          Setup, integration &amp; bundle size
        </h2>

        <p className="mt-2 text-sm text-neutral-400">
          shadcn/ui isn&apos;t an npm dependency you version-bump — the CLI (
          <code className="rounded bg-neutral-800 px-1 py-0.5">
            npx shadcn add select table dialog …
          </code>
          ) copies component source straight into this repo, so it only pulls in
          the small headless primitives (Base UI, in the current default style)
          each copied file actually imports, and compiles to plain Tailwind
          utility classes at build time — no runtime style engine. MUI is a real
          npm dependency (
          <code className="rounded bg-neutral-800 px-1 py-0.5">
            @mui/material
          </code>
          ,{' '}
          <code className="rounded bg-neutral-800 px-1 py-0.5">
            @mui/x-date-pickers
          </code>
          ,{' '}
          <code className="rounded bg-neutral-800 px-1 py-0.5">@emotion/*</code>
          ) that needs a provider (
          <code className="rounded bg-neutral-800 px-1 py-0.5">
            ThemeProvider
          </code>
          ) and, specifically on Next.js App Router,{' '}
          <code className="rounded bg-neutral-800 px-1 py-0.5">
            @mui/material-nextjs
          </code>
          &apos;s{' '}
          <code className="rounded bg-neutral-800 px-1 py-0.5">
            AppRouterCacheProvider
          </code>{' '}
          to wire Emotion&apos;s style cache into streaming SSR correctly —
          without it, styles can flash unstyled or get duplicated between server
          and client.
        </p>

        <p className="mt-3 text-sm text-neutral-400">
          Pulled straight from{' '}
          <code className="rounded bg-neutral-800 px-1 py-0.5">
            .next/diagnostics/route-bundle-stats.json
          </code>{' '}
          after running{' '}
          <code className="rounded bg-neutral-800 px-1 py-0.5">next build</code>{' '}
          — uncompressed First Load JS for each demo route (same eight
          components, same data, same mock API):
        </p>

        <div className="mt-3 overflow-x-auto rounded-lg border border-neutral-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-900/60 text-neutral-400">
              <tr>
                <th className="px-3 py-2 font-medium">Route</th>
                <th className="px-3 py-2 font-medium">
                  First Load JS (uncompressed)
                </th>
              </tr>
            </thead>

            <tbody className="text-neutral-300">
              <tr className="border-t border-neutral-800">
                <td className="px-3 py-2">
                  <code className="rounded bg-neutral-800 px-1 py-0.5">
                    /tasks/ui-component-libraries/shadcn
                  </code>
                </td>
                <td className="px-3 py-2">≈1,096 KB</td>
              </tr>

              <tr className="border-t border-neutral-800">
                <td className="px-3 py-2">
                  <code className="rounded bg-neutral-800 px-1 py-0.5">
                    /tasks/ui-component-libraries/mui
                  </code>
                </td>

                <td className="px-3 py-2">≈1,278 KB (+182 KB)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-neutral-500">
          Both routes are heavy relative to this app&apos;s other task pages
          (all in the 476–540 KB range) mostly because React Hook Form, Zod, and
          a date-picker library are pulled in on both sides — that cost is
          shared. The remaining ~182 KB gap between them isn&apos;t Radix/Base
          UI vs. shadcn primitive weight; it&apos;s Emotion&apos;s runtime style
          engine plus MUI&apos;s own component-internals layer, which ship on
          every route that imports{' '}
          <code className="rounded bg-neutral-800 px-1 py-0.5">
            @mui/material
          </code>
          , regardless of how few components are actually used.
        </p>
      </section>

      <section className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
        <h2 className="text-sm font-semibold text-neutral-200">
          Popular libraries, briefly
        </h2>

        <ul className="mt-3 grid gap-2 text-sm text-neutral-400">
          <li>
            <strong className="text-neutral-200">Ant Design</strong> — a large,
            opinionated, batteries-included kit (own design language, own icon
            set, form system built in). Great for admin/dashboard-style apps
            that want a consistent look out of the box; harder to make look like
            anything else.
          </li>

          <li>
            <strong className="text-neutral-200">Material UI (MUI)</strong> —
            implements Google&apos;s Material Design by default but is themeable
            away from it (as done here); the most npm-install-and-go of the
            three, at the cost of the runtime CSS-in-JS overhead measured above.
          </li>

          <li>
            <strong className="text-neutral-200">shadcn/ui</strong> — not a
            library in the traditional sense; a CLI that copies component source
            into your repo so you own and can edit it directly. Best fit for a
            Tailwind-based codebase (like this one) that wants full control over
            markup and styling without writing every primitive from scratch.
          </li>
        </ul>
      </section>
    </main>
  );
}
