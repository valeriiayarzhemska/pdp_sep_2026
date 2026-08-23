'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
            // Default staleTime is 0, which serves cached data instantly on
            // remount but still fires a background refetch immediately
            // after — technically invisible to the user, but not actually
            // "no re-fetch." A search result set doesn't need re-validating
            // just because the traveler glanced at a detail page and came
            // back a few seconds later.
            staleTime: 60_000,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
