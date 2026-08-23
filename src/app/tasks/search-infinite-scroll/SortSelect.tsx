import type { SortKey } from '@/lib/travel-types';

const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: 'Price (low to high)', value: 'price' },
  { label: 'Rating (high to low)', value: 'rating' },
  { label: 'Duration', value: 'duration' },
];

export default function SortSelect({
  sortKey,
  onSortChange,
}: {
  sortKey: SortKey;
  onSortChange: (next: SortKey) => void;
}) {
  return (
    <select
      aria-label="Sort by"
      value={sortKey}
      onChange={(e) => onSortChange(e.target.value as SortKey)}
      className="rounded-md border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-sm text-neutral-100"
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
