'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchOfferRefresh } from '../../api-client';
import BackToResultsButton from '../../BackToResultsButton';

export default function OfferDetail({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const listPriceRaw = searchParams.get('listPrice');
  const listPrice = listPriceRaw ? Number(listPriceRaw) : null;

  const { data: offer, isLoading, isError } = useQuery({
    queryKey: ['offer-detail', id],
    queryFn: () => fetchOfferRefresh(id),
  });

  if (isLoading) {
    return <p className="text-sm text-neutral-500">Loading…</p>;
  }

  if (isError || !offer) {
    return <p className="text-sm text-rose-400">Could not load this offer.</p>;
  }

  const priceChanged = listPrice !== null && listPrice !== offer.pricePerNight;

  return (
    <div className="grid gap-4">
      <div className="flex h-48 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-800 text-4xl">
        🏨
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-neutral-100">{offer.name}</h1>
        <p className="text-neutral-400">{offer.city}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-400">
        <span>
          ★ {offer.rating.toFixed(1)} ({offer.reviewCount} reviews)
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

      <div className="flex flex-wrap gap-1.5">
        {offer.amenities.map((amenity) => (
          <span
            key={amenity}
            className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400"
          >
            {amenity}
          </span>
        ))}
      </div>

      {priceChanged && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          The price for this stay changed since you saw it in the list: ${listPrice} → $
          {offer.pricePerNight} per night.
        </div>
      )}

      <p className="text-2xl font-semibold text-neutral-100">
        ${offer.pricePerNight}
        <span className="text-base font-normal text-neutral-500"> / night</span>
      </p>

      <BackToResultsButton className="w-fit rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:border-neutral-500" />
    </div>
  );
}
