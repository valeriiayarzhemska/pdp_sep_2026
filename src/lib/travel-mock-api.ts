import {
  AMENITIES,
  type Amenity,
  type HotelOffer,
  type OfferWithMeta,
  type SearchFilters,
  type SortKey,
} from './travel-types';

const CITIES = [
  'Lisbon',
  'Porto',
  'Barcelona',
  'Rome',
  'Prague',
  'Vienna',
  'Budapest',
  'Athens',
  'Split',
  'Valencia',
];

const NAME_PREFIXES = ['Grand', 'Boutique', 'Riverside', 'Old Town', 'Harbor', 'Central', 'Garden', 'Skyline'];
const NAME_SUFFIXES = ['Hotel', 'Inn', 'Suites', 'Residence', 'Lodge'];

const DATASET_SIZE = 600;

// Every price "drifts" deterministically over real time, in fixed windows —
// this is what lets the mock backend honestly report a *different* current
// price for the same offer id on a later request, without needing a live
// database of prices ticking in the background.
const PRICE_DRIFT_INTERVAL_MS = 30_000;

function hashString(value: string): number {
  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }

  return Math.abs(hash);
}

function generateOffers(): HotelOffer[] {
  return Array.from({ length: DATASET_SIZE }, (_, i) => {
    const id = `hotel-${i + 1}`;
    const city = CITIES[i % CITIES.length];
    const name = `${NAME_PREFIXES[i % NAME_PREFIXES.length]} ${NAME_SUFFIXES[(i * 3) % NAME_SUFFIXES.length]}`;
    const rating = Math.min(5, Math.round((3 + ((i * 13) % 21) / 10) * 10) / 10);
    const reviewCount = 20 + ((i * 53) % 980);
    const basePrice = 60 + ((i * 29) % 340);
    const nights = 1 + (i % 6);
    const refundable = i % 3 === 0;
    const amenities: Amenity[] = AMENITIES.filter((_, idx) => (i >> idx) & 1);
    const checkInOffset = i % 60;
    const checkIn = new Date(2026, 8, 1 + checkInOffset).toISOString().slice(0, 10);
    const checkOut = new Date(2026, 8, 1 + checkInOffset + nights).toISOString().slice(0, 10);

    return {
      id,
      name,
      city,
      rating,
      reviewCount,
      pricePerNight: basePrice,
      nights,
      refundable,
      amenities: amenities.length > 0 ? amenities : (['wifi'] as Amenity[]),
      checkIn,
      checkOut,
    };
  });
}

const globalForTravel = globalThis as unknown as { __travelOffers?: HotelOffer[] };

function getOffers(): HotelOffer[] {
  if (!globalForTravel.__travelOffers) {
    globalForTravel.__travelOffers = generateOffers();
  }

  return globalForTravel.__travelOffers;
}

// Deterministic "current price": the same offer id returns the same price
// within one drift window, and a plausibly different one once the window
// has moved on — simulating a real market price changing between when a
// traveler first saw a list and when they check back.
export function getCurrentPrice(offer: HotelOffer, now: number): number {
  const bucket = Math.floor(now / PRICE_DRIFT_INTERVAL_MS);
  const seed = (hashString(offer.id) + bucket) % 21;
  const driftPct = (seed - 10) / 100; // -10%..+10%

  return Math.max(1, Math.round(offer.pricePerNight * (1 + driftPct)));
}

export function withCurrentPrice(offer: HotelOffer, now: number): OfferWithMeta {
  return {
    ...offer,
    pricePerNight: getCurrentPrice(offer, now),
    priceCheckedAt: now,
  };
}

export function findOffer(id: string): HotelOffer | undefined {
  return getOffers().find((o) => o.id === id);
}

function applyFilters(offers: HotelOffer[], filters: SearchFilters): HotelOffer[] {
  return offers.filter((offer) => {
    if (filters.maxPrice !== null && offer.pricePerNight > filters.maxPrice) {
      return false;
    }

    if (filters.minRating !== null && offer.rating < filters.minRating) {
      return false;
    }

    if (filters.refundableOnly && !offer.refundable) {
      return false;
    }

    if (filters.amenities.length > 0) {
      const hasAll = filters.amenities.every((a) => offer.amenities.includes(a));

      if (!hasAll) {
        return false;
      }
    }

    return true;
  });
}

function sortValue(offer: HotelOffer, sortKey: SortKey): number {
  if (sortKey === 'price') {
    return offer.pricePerNight;
  }

  if (sortKey === 'rating') {
    return -offer.rating; // higher rating first
  }

  return offer.nights;
}

function sortOffers(offers: HotelOffer[], sortKey: SortKey): HotelOffer[] {
  return [...offers].sort((a, b) => {
    const diff = sortValue(a, sortKey) - sortValue(b, sortKey);

    if (diff !== 0) {
      return diff;
    }

    // Stable tiebreaker so the sequence is deterministic across requests —
    // required for cursor pagination to make sense at all.
    return a.id.localeCompare(b.id);
  });
}

function encodeCursor(offer: HotelOffer, sortKey: SortKey): string {
  const payload = JSON.stringify({ v: sortValue(offer, sortKey), id: offer.id });

  return Buffer.from(payload, 'utf-8').toString('base64url');
}

function decodeCursor(cursor: string): { v: number; id: string } | null {
  try {
    const payload = Buffer.from(cursor, 'base64url').toString('utf-8');

    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export type SearchPage = {
  items: HotelOffer[];
  nextCursor: string | null;
  totalCount: number;
};

export function searchOffers(params: {
  filters: SearchFilters;
  sortKey: SortKey;
  cursor: string | null;
  limit: number;
}): SearchPage {
  const { filters, sortKey, cursor, limit } = params;
  const filtered = applyFilters(getOffers(), filters);
  const sorted = sortOffers(filtered, sortKey);

  let startIndex = 0;

  if (cursor) {
    const decoded = decodeCursor(cursor);

    if (decoded) {
      const idx = sorted.findIndex(
        (o) => sortValue(o, sortKey) === decoded.v && o.id === decoded.id,
      );

      startIndex = idx === -1 ? 0 : idx + 1;
    }
  }

  const page = sorted.slice(startIndex, startIndex + limit);
  const last = page[page.length - 1];
  const hasMore = startIndex + limit < sorted.length;

  return {
    items: page,
    nextCursor: hasMore && last ? encodeCursor(last, sortKey) : null,
    totalCount: sorted.length,
  };
}

const globalForFavorites = globalThis as unknown as { __travelFavorites?: Set<string> };

export function getFavoritesStore(): Set<string> {
  if (!globalForFavorites.__travelFavorites) {
    globalForFavorites.__travelFavorites = new Set();
  }

  return globalForFavorites.__travelFavorites;
}
