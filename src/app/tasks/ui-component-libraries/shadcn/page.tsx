import Link from 'next/link';
import QueryProvider from '../QueryProvider';
import ShadcnDemo from './ShadcnDemo';

export const metadata = {
  title: 'UI Component Libraries — shadcn/ui — PDP',
};

export default function ShadcnPage() {
  return (
    <main className="dark mx-auto max-w-4xl bg-neutral-950 px-6 py-10 text-neutral-100">
      <Link
        href="/tasks/ui-component-libraries"
        className="text-sm text-neutral-400 hover:text-neutral-200"
      >
        ← UI Component Libraries
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-neutral-100">
          shadcn/ui demo
        </h1>
        
        <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-medium text-blue-300">
          Tailwind-native · copy-paste
        </span>
      </div>

      <p className="mt-2 max-w-2xl text-sm text-neutral-400">
        This route wraps its content in a{' '}
        <code className="rounded bg-neutral-800 px-1 py-0.5">.dark</code> class
        scoped to this page — the app itself is dark by hardcoded Tailwind
        classes, not by shadcn&apos;s CSS-variable theme, so the variables have
        to be told which palette to use.
      </p>

      <div className="mt-8">
        <QueryProvider>
          <ShadcnDemo />
        </QueryProvider>
      </div>
    </main>
  );
}
