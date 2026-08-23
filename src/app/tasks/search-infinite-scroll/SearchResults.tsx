'use client';

import { useEffect, useState } from 'react';

import FiltersBar from './FiltersBar';
import SortSelect from './SortSelect';
import OfferCard from './OfferCard';

import { useSearchFilters } from './hooks/useSearchFilters';
import { useOffersList } from './hooks/useOffersList';
import { useFavorites } from './hooks/useFavorites';
import { useResultsVirtualizer } from './hooks/useResultsVirtualizer';
import { useScrollRestoration } from './hooks/useScrollRestoration';

export default function SearchResults() {
  const { filters, sortKey, setFilters, setSort } = useSearchFilters();
  const {
    entities,
    resultOrder,
    totalCount,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refreshingId,
    refreshPrice,
  } = useOffersList(filters, sortKey);
  const { favoriteIds, favoriteError, toggleFavorite } = useFavorites();

  
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 5_000);

    return () => clearInterval(interval);
  }, []);

  const { listRef, virtualizer, virtualizerRef, virtualItems } =
    useResultsVirtualizer(resultOrder.length);

  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];

    if (!lastItem) {
      return;
    }

    if (lastItem.index >= resultOrder.length - 3 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [virtualItems, resultOrder.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const { saveScrollBeforeNavigating } = useScrollRestoration({
    virtualItems,
    virtualizerRef,
    resultOrderLength: resultOrder.length,
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
      <aside className="lg:sticky lg:top-4">
        <FiltersBar filters={filters} onFiltersChange={setFilters} />
      </aside>

      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-neutral-500">
            {isLoading ? 'Searching…' : `${totalCount} stays found`}
          </p>
          <SortSelect sortKey={sortKey} onSortChange={setSort} />
        </div>

        {favoriteError && (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {favoriteError}
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            Something went wrong loading results.
          </div>
        )}

        <div
          ref={listRef}
          onClickCapture={saveScrollBeforeNavigating}
          style={{ position: 'relative', height: virtualizer.getTotalSize() }}
        >
          {virtualItems.map((virtualRow) => {
            const offerId = resultOrder[virtualRow.index];
            const offer = entities[offerId];

            if (!offer) {
              return null;
            }

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
                  paddingBottom: '1rem',
                }}
              >
                <OfferCard
                  offer={offer}
                  isFavorited={favoriteIds.has(offer.id)}
                  now={now}
                  onToggleFavorite={toggleFavorite}
                  onRefreshPrice={refreshPrice}
                  isRefreshing={refreshingId === offer.id}
                />
              </div>
            );
          })}
        </div>

        {isFetchingNextPage && (
          <p className="pb-8 text-center text-sm text-neutral-500">Loading more stays…</p>
        )}

        {!hasNextPage && resultOrder.length > 0 && (
          <p className="pb-8 text-center text-sm text-neutral-600">
            That&apos;s every stay matching your search.
          </p>
        )}
      </div>
    </div>
  );
}
