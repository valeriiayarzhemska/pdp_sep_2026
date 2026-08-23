import type { ReactNode } from 'react';
import QueryProvider from './QueryProvider';

// The QueryClient lives here, in the route segment's layout, rather than in
// page.tsx — a layout stays mounted across client-side navigation between
// the list page and the offer detail page, so the infinite-query cache
// (already-loaded pages, scroll position's data dependency) survives a
// "view details → back" round trip instead of being torn down and refetched.
export default function SearchLayout({ children }: { children: ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
