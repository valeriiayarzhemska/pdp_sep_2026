export const AMENITIES = [
  'wifi',
  'pool',
  'breakfast',
  'parking',
  'gym',
  'spa',
] as const;

export type Amenity = (typeof AMENITIES)[number];

export type HotelOffer = {
  id: string;
  name: string;
  city: string;
  rating: number; // 3.0–5.0
  reviewCount: number;
  pricePerNight: number;
  nights: number;
  refundable: boolean;
  amenities: Amenity[];
  checkIn: string; // ISO date
  checkOut: string; // ISO date
};

// What the API actually returns for an offer: the catalog fields plus the
// moment this specific price was computed, so the client can show its own
// "priced as of" badge per row rather than one global timestamp for the
// whole page.
export type OfferWithMeta = HotelOffer & {
  priceCheckedAt: number; // epoch ms
};

export type SortKey = 'price' | 'rating' | 'duration';

export type SearchFilters = {
  maxPrice: number | null;
  minRating: number | null;
  refundableOnly: boolean;
  amenities: Amenity[];
};

export const DEFAULT_FILTERS: SearchFilters = {
  maxPrice: null,
  minRating: null,
  refundableOnly: false,
  amenities: [],
};

export type SearchResponse = {
  items: OfferWithMeta[];
  nextCursor: string | null;
  totalCount: number;
};

export const PAGE_SIZE = 20;

// How long since an offer's price was last checked before the UI treats it
// as possibly outdated. Scaled down from a realistic ~10-15 minutes to a
// demo/test-friendly window — documented, not hidden.
export const PRICE_STALE_AFTER_MS = 20_000;

// One fixed offer id that the mock backend always rejects a favorite toggle
// for, so the optimistic-rollback path has something deterministic to
// demonstrate and test against.
export const FORCE_FAVORITE_FAILURE_ID = 'hotel-500';
