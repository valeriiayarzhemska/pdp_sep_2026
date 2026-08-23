'use client';

import { useMemo, useState } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { fetchOfferRefresh, fetchOffersPage } from '../api-client';
import type {
  OfferWithMeta,
  SearchFilters,
  SearchResponse,
  SortKey,
} from '@/lib/travel-types';

type OffersPages = { pages: SearchResponse[]; pageParams: (string | null)[] };

export function useOffersList(filters: SearchFilters, sortKey: SortKey) {
  const queryClient = useQueryClient();
  const queryKey = ['offers', filters, sortKey] as const;

  const offersQuery = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam, signal }) =>
      fetchOffersPage({ filters, sortKey, cursor: pageParam, signal }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: SearchResponse) => lastPage.nextCursor,
    refetchOnMount: false,
  });

  const { entities, resultOrder, totalCount } = useMemo(() => {
    const entities: Record<string, OfferWithMeta> = {};
    const resultOrder: string[] = [];
    let totalCount = 0;

    for (const page of offersQuery.data?.pages ?? []) {
      totalCount = page.totalCount;

      for (const item of page.items) {
        entities[item.id] = item;
        resultOrder.push(item.id);
      }
    }

    return { entities, resultOrder, totalCount };
  }, [offersQuery.data]);

  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  const refreshPriceMutation = useMutation({
    mutationFn: (offerId: string) => fetchOfferRefresh(offerId),
    onMutate: (offerId) => setRefreshingId(offerId),
    onSuccess: (refreshed) => {
      queryClient.setQueryData(queryKey, (old: OffersPages | undefined) => {
        if (!old) {
          return old;
        }

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.map((item) =>
              item.id === refreshed.id ? refreshed : item,
            ),
          })),
        };
      });
    },
    onSettled: () => setRefreshingId(null),
  });

  return {
    entities,
    resultOrder,
    totalCount,
    isLoading: offersQuery.isLoading,
    isError: offersQuery.isError,
    hasNextPage: offersQuery.hasNextPage,
    isFetchingNextPage: offersQuery.isFetchingNextPage,
    fetchNextPage: offersQuery.fetchNextPage,
    refreshingId,
    refreshPrice: (offerId: string) => refreshPriceMutation.mutate(offerId),
  };
}
