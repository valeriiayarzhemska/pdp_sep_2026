import { NextRequest, NextResponse } from 'next/server';
import { simulateSearchLatency } from '@/lib/autocomplete-mock-utils';
import { searchProducts } from '@/lib/product-mock-api';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') ?? '';

  await simulateSearchLatency(query);

  return NextResponse.json(searchProducts(query));
}
