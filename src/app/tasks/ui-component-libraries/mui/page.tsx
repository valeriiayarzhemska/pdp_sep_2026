import Link from 'next/link';
import QueryProvider from '../QueryProvider';
import ThemeRegistry from './ThemeRegistry';
import MuiDemo from './MuiDemo';

export const metadata = {
  title: 'UI Component Libraries — MUI — PDP',
};

export default function MuiPage() {
  return (
    <ThemeRegistry>
      <main
        className="mx-auto max-w-4xl px-6 py-10"
        style={{ background: '#0a0a0a', color: '#f5f5f5' }}
      >
        <Link
          href="/tasks/ui-component-libraries"
          className="text-sm text-neutral-400 hover:text-neutral-200"
        >
          ← UI Component Libraries
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-neutral-100">MUI demo</h1>
          <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-medium text-blue-300">
            npm-installed · CSS-in-JS
          </span>
        </div>

        <p className="mt-2 max-w-2xl text-sm text-neutral-400">
          Themed via a JS{' '}
          <code className="rounded bg-neutral-800 px-1 py-0.5">
            createTheme()
          </code>{' '}
          object and rendered through Emotion, with{' '}
          <code className="rounded bg-neutral-800 px-1 py-0.5">
            @mui/material-nextjs
          </code>
          &apos;s{' '}
          <code className="rounded bg-neutral-800 px-1 py-0.5">
            AppRouterCacheProvider
          </code>{' '}
          wiring the style cache into streaming SSR.
        </p>

        <div className="mt-8">
          <QueryProvider>
            <MuiDemo />
          </QueryProvider>
        </div>
      </main>
    </ThemeRegistry>
  );
}
