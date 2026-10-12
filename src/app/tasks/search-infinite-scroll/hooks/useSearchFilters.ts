'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  AMENITIES,
  DEFAULT_FILTERS,
  type Amenity,
  type SearchFilters,
  type SortKey,
} from '@/lib/travel-types';
import { clearSavedScrollPosition } from './useScrollRestoration';

function parseFiltersFromParams(params: URLSearchParams): {
  filters: SearchFilters;
  sortKey: SortKey;
} {
  const maxPriceRaw = params.get('maxPrice');
  const minRatingRaw = params.get('minRating');
  const amenitiesRaw = params.get('amenities');
  const sortRaw = params.get('sortKey');

  const filters: SearchFilters = {
    maxPrice: maxPriceRaw ? Number(maxPriceRaw) : DEFAULT_FILTERS.maxPrice,
    minRating: minRatingRaw ? Number(minRatingRaw) : DEFAULT_FILTERS.minRating,
    refundableOnly: params.get('refundableOnly') === 'true',
    amenities: amenitiesRaw
      ? amenitiesRaw
          .split(',')
          .filter((a): a is Amenity =>
            (AMENITIES as readonly string[]).includes(a),
          )
      : [],
  };

  const sortKey: SortKey =
    sortRaw === 'price' || sortRaw === 'rating' || sortRaw === 'duration'
      ? sortRaw
      : 'price';

  return { filters, sortKey };
}

function serializeParams(filters: SearchFilters, sortKey: SortKey): string {
  const params = new URLSearchParams();

  if (filters.maxPrice !== null) {
    params.set('maxPrice', String(filters.maxPrice));
  }

  if (filters.minRating !== null) {
    params.set('minRating', String(filters.minRating));
  }

  if (filters.refundableOnly) {
    params.set('refundableOnly', 'true');
  }

  if (filters.amenities.length > 0) {
    params.set('amenities', filters.amenities.join(','));
  }

  if (sortKey !== 'price') {
    params.set('sortKey', sortKey);
  }

  return params.toString();
}

export function useSearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { filters, sortKey } = useMemo(
    () => parseFiltersFromParams(searchParams),
    [searchParams],
  );

  const updateParams = useCallback(
    (nextFilters: SearchFilters, nextSortKey: SortKey) => {
      const qs = serializeParams(nextFilters, nextSortKey);

      window.scrollTo(0, 0);
      clearSavedScrollPosition();
      window.history.replaceState(
        null,
        '',
        qs ? `${pathname}?${qs}` : pathname,
      );
    },
    [pathname, router],
  );

  return {
    filters,
    sortKey,
    setFilters: (next: SearchFilters) => updateParams(next, sortKey),
    setSort: (next: SortKey) => updateParams(filters, next),
  };
}
