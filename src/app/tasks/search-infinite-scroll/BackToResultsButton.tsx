'use client';

import { useRouter } from 'next/navigation';

// Deliberately router.back() rather than <Link href="/tasks/search-infinite-scroll">.
// A plain Link pushes a fresh URL with no query string, silently dropping
// whatever filters/sort were applied — the browser's own back button
// doesn't have that problem because it replays the exact previous history
// entry, params included. router.back() gets the same correct behavior
// (and, as a side effect, correctly triggers the scroll-restoration logic
// on the results page, which is built around real back/popstate
// navigation, not a fresh push).
export default function BackToResultsButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <button type="button" onClick={() => router.back()} className={className}>
      ← Back to results
    </button>
  );
}
