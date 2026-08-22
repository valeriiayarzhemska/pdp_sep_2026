import Link from 'next/link';
import { TASKS } from '@/lib/tasks-registry';

export default function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12">
      <header className="mb-10">
        <p className="text-sm font-medium text-blue-400">
          Personal Development Plan
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-neutral-100">
          Middle Frontend Developer — Practical Tasks
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-400">
          One task at a time. Click a card to open its write-up, theory notes
          and a runnable proof-of-concept.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {TASKS.map((task) => {
          const content = (
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-neutral-800 px-2.5 py-0.5 text-xs font-medium text-neutral-300">
                  {task.level}
                </span>
                {task.status === 'planned' && (
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-300">
                    Coming soon
                  </span>
                )}
              </div>
              <h2 className="mt-3 text-lg font-semibold text-neutral-100">
                {task.title}
              </h2>
              <p className="mt-1.5 text-sm text-neutral-400">{task.summary}</p>
            </>
          );

          return (
            <li key={task.slug}>
              {task.status === 'available' ? (
                <Link
                  href={`/tasks/${task.slug}`}
                  className="block h-full rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 transition-colors hover:border-blue-500/50 hover:bg-neutral-900"
                >
                  {content}
                </Link>
              ) : (
                <div className="block h-full cursor-not-allowed rounded-xl border border-neutral-800/60 bg-neutral-900/20 p-5 opacity-60">
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
