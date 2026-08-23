import {
  AMENITIES,
  type Amenity,
  type SearchFilters,
} from '@/lib/travel-types';

const PRICE_OPTIONS = [
  { label: 'Any price', value: '' },
  { label: 'Up to $100', value: '100' },
  { label: 'Up to $200', value: '200' },
  { label: 'Up to $300', value: '300' },
  { label: 'Up to $400', value: '400' },
];

const RATING_OPTIONS = [
  { label: 'Any rating', value: '' },
  { label: '3+ stars', value: '3' },
  { label: '4+ stars', value: '4' },
  { label: '4.5+ stars', value: '4.5' },
];

export default function FiltersBar({
  filters,
  onFiltersChange,
}: {
  filters: SearchFilters;
  onFiltersChange: (next: SearchFilters) => void;
}) {
  function toggleAmenity(amenity: Amenity) {
    const next = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];

    onFiltersChange({ ...filters, amenities: next });
  }

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
      <h2 className="text-sm font-semibold text-neutral-200">Filters</h2>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="max-price"
          className="text-xs font-medium text-neutral-400"
        >
          Max price
        </label>
        <select
          id="max-price"
          aria-label="Max price"
          value={filters.maxPrice ?? ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              maxPrice: e.target.value ? Number(e.target.value) : null,
            })
          }
          className="rounded-md border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-sm text-neutral-100"
        >
          {PRICE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="min-rating"
          className="text-xs font-medium text-neutral-400"
        >
          Min rating
        </label>
        <select
          id="min-rating"
          aria-label="Min rating"
          value={filters.minRating ?? ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              minRating: e.target.value ? Number(e.target.value) : null,
            })
          }
          className="rounded-md border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-sm text-neutral-100"
        >
          {RATING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-1.5 text-sm text-neutral-300">
        <input
          type="checkbox"
          checked={filters.refundableOnly}
          onChange={(e) =>
            onFiltersChange({ ...filters, refundableOnly: e.target.checked })
          }
        />
        Refundable only
      </label>

      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium text-neutral-400">Amenities</p>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((amenity) => (
            <label
              key={amenity}
              className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs ${
                filters.amenities.includes(amenity)
                  ? 'border-blue-500/60 bg-blue-500/15 text-blue-300'
                  : 'border-neutral-700 text-neutral-400'
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={filters.amenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
              />
              {amenity}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
