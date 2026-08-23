import { NextRequest, NextResponse } from 'next/server';
import { getFavoritesStore } from '@/lib/travel-mock-api';
import { FORCE_FAVORITE_FAILURE_ID } from '@/lib/travel-types';

export async function GET() {
  return NextResponse.json({ favoriteIds: Array.from(getFavoritesStore()) });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { offerId?: string; favorited?: boolean };
  const { offerId, favorited } = body;

  if (!offerId || typeof favorited !== 'boolean') {
    return NextResponse.json({ error: 'Missing offerId or favorited.' }, { status: 400 });
  }

  await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 200));

  // One fixed offer always rejects the write — a deterministic way to
  // demonstrate (and test) the optimistic-update rollback path, instead of
  // a random failure rate that would make the demo and the tests flaky.
  if (offerId === FORCE_FAVORITE_FAILURE_ID) {
    return NextResponse.json({ error: 'Could not save favorite. Try again.' }, { status: 500 });
  }

  const store = getFavoritesStore();

  if (favorited) {
    store.add(offerId);
  } else {
    store.delete(offerId);
  }

  return NextResponse.json({ favoriteIds: Array.from(store) });
}
