import { NextResponse } from 'next/server';
import { getExchangeRateSnapshot } from '@/lib/exchange-rates';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const snapshot = await getExchangeRateSnapshot();

  return NextResponse.json(snapshot, {
    headers: {
      'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=86400',
    },
  });
}
