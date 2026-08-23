import { NextRequest, NextResponse } from 'next/server';
import { searchOffers, withCurrentPrice } from '@/lib/travel-mock-api';
import {
  AMENITIES,
  PAGE_SIZE,
  type Amenity,
  type SearchFilters,
  type SearchResponse,
  type SortKey,
} from '@/lib/travel-types';

function parseFilters(params: URLSearchParams): SearchFilters {
  const maxPriceRaw = params.get('maxPrice');
  const minRatingRaw = params.get('minRating');
  const amenitiesRaw = params.get('amenities');

  return {
    maxPrice: maxPriceRaw ? Number(maxPriceRaw) : null,
    minRating: minRatingRaw ? Number(minRatingRaw) : null,
    refundableOnly: params.get('refundableOnly') === 'true',
    amenities: amenitiesRaw
      ? (amenitiesRaw.split(',').filter((a): a is Amenity => (AMENITIES as readonly string[]).includes(a)))
      : [],
  };
}

function parseSortKey(params: URLSearchParams): SortKey {
  const raw = params.get('sortKey');

  if (raw === 'price' || raw === 'rating' || raw === 'duration') {
    return raw;
  }

  return 'price';
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const filters = parseFilters(params);
  const sortKey = parseSortKey(params);
  const cursor = params.get('cursor');
  const limit = Math.min(50, Math.max(1, Number(params.get('limit') ?? PAGE_SIZE) || PAGE_SIZE));

  // Simulate realistic network latency so loading states have something to
  // show, same as the other tasks' mock endpoints.
  await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 250));

  const page = searchOffers({ filters, sortKey, cursor, limit });
  const now = Date.now();
  const response: SearchResponse = {
    items: page.items.map((offer) => withCurrentPrice(offer, now)),
    nextCursor: page.nextCursor,
    totalCount: page.totalCount,
  };

  return NextResponse.json(response);
}
