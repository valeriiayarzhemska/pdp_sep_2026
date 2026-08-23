import { NextRequest, NextResponse } from 'next/server';
import { findOffer, withCurrentPrice } from '@/lib/travel-mock-api';

// Used by the "this price might be outdated — refresh?" affordance: the
// client already has a cached copy of this offer from the list page, and
// asks the backend to recompute its current price so it can reconcile
// (show "price changed" or just bump the checked-at timestamp).
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const offer = findOffer(id);

  if (!offer) {
    return NextResponse.json({ error: 'Unknown offer id.' }, { status: 404 });
  }

  await new Promise((resolve) => setTimeout(resolve, 150 + Math.random() * 200));

  return NextResponse.json({ item: withCurrentPrice(offer, Date.now()) });
}
