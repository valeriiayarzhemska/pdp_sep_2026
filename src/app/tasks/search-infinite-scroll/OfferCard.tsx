import Link from 'next/link';
import type { OfferWithMeta } from '@/lib/travel-types';
import { PRICE_STALE_AFTER_MS } from '@/lib/travel-types';

function formatCheckedAt(ms: number): string {
  const seconds = Math.max(0, Math.round(ms / 1000));

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  return `${Math.round(seconds / 60)}m ago`;
}

export default function OfferCard({
  offer,
  isFavorited,
  now,
  onToggleFavorite,
  onRefreshPrice,
  isRefreshing,
}: {
  offer: OfferWithMeta;
  isFavorited: boolean;
  now: number;
  onToggleFavorite: (offerId: string, next: boolean) => void;
  onRefreshPrice: (offerId: string) => void;
  isRefreshing: boolean;
}) {
  const age = now - offer.priceCheckedAt;
  const isStale = age > PRICE_STALE_AFTER_MS;
  const total = offer.pricePerNight * offer.nights;

  return (
    <div
      data-testid="offer-card"
      data-offer-id={offer.id}
      className="flex gap-4 rounded-xl border border-neutral-800 bg-neutral-900/50 p-4"
    >
      <div className="flex w-24 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-2xl">
        🏨
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-medium text-neutral-100">
              {offer.name}
            </p>
            <p className="text-sm text-neutral-400">{offer.city}</p>
          </div>

          <button
            type="button"
            data-testid="favorite-toggle"
            aria-pressed={isFavorited}
            aria-label={
              isFavorited ? 'Remove from favorites' : 'Save to favorites'
            }
            onClick={() => onToggleFavorite(offer.id, !isFavorited)}
            className={`shrink-0 rounded-full border px-2.5 py-1 text-sm transition-colors ${
              isFavorited
                ? 'border-rose-500/60 bg-rose-500/15 text-rose-300'
                : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
            }`}
          >
            {isFavorited ? '♥ Saved' : '♡ Save'}
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-400">
          <span>
            ★ {offer.rating.toFixed(1)}{' '}
            <span className="text-neutral-500">({offer.reviewCount})</span>
          </span>
          <span>
            {offer.nights} night{offer.nights > 1 ? 's' : ''}
          </span>
          <span>
            {offer.checkIn} → {offer.checkOut}
          </span>
          {offer.refundable && (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-300">
              Refundable
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {offer.amenities.map((amenity) => (
            <span
              key={amenity}
              className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400"
            >
              {amenity}
            </span>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-lg font-semibold text-neutral-100">
              ${offer.pricePerNight}
              <span className="text-sm font-normal text-neutral-500">
                {' '}
                / night
              </span>
            </p>
            <p className="text-xs text-neutral-500">${total} total</p>
          </div>

          <div className="flex items-center gap-2">
            {isStale && (
              <span className="text-xs text-amber-400">
                Priced {formatCheckedAt(age)} — may be outdated
              </span>
            )}
            {isStale && (
              <button
                type="button"
                onClick={() => onRefreshPrice(offer.id)}
                disabled={isRefreshing}
                className="rounded-md border border-neutral-700 px-2 py-1 text-xs text-neutral-300 hover:border-neutral-500 disabled:opacity-50"
              >
                {isRefreshing ? 'Refreshing…' : 'Refresh price'}
              </button>
            )}
            <Link
              href={`/tasks/search-infinite-scroll/offer/${offer.id}?listPrice=${offer.pricePerNight}`}
              className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:border-neutral-500"
            >
              View details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
