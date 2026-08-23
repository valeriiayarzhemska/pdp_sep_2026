import type {
  SearchFilters,
  SearchResponse,
  SortKey,
  OfferWithMeta,
} from '@/lib/travel-types';

function buildQuery(
  filters: SearchFilters,
  sortKey: SortKey,
  cursor: string | null,
): string {
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

  params.set('sortKey', sortKey);

  if (cursor) {
    params.set('cursor', cursor);
  }

  return params.toString();
}

export async function fetchOffersPage(params: {
  filters: SearchFilters;
  sortKey: SortKey;
  cursor: string | null;
  signal?: AbortSignal;
}): Promise<SearchResponse> {
  const qs = buildQuery(params.filters, params.sortKey, params.cursor);
  const res = await fetch(`/api/search/offers?${qs}`, {
    signal: params.signal,
  });

  if (!res.ok) {
    throw new Error('Failed to load offers.');
  }

  return res.json();
}

export async function fetchOfferRefresh(id: string): Promise<OfferWithMeta> {
  const res = await fetch(`/api/search/offers/${id}`);

  if (!res.ok) {
    throw new Error('Failed to refresh offer.');
  }

  const data = await res.json();

  return data.item;
}

export async function fetchFavoriteIds(): Promise<string[]> {
  const res = await fetch('/api/search/favorites');

  if (!res.ok) {
    throw new Error('Failed to load favorites.');
  }

  const data = await res.json();

  return data.favoriteIds;
}

export async function postFavorite(
  offerId: string,
  favorited: boolean,
): Promise<string[]> {
  const res = await fetch('/api/search/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offerId, favorited }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));

    throw new Error(data.error ?? 'Failed to save favorite.');
  }

  const data = await res.json();

  return data.favoriteIds;
}
