import { DEFAULT_EXCHANGE_RATE_SNAPSHOT, type ExchangeRateSnapshot } from '@/lib/currency';

export async function getExchangeRateSnapshot(): Promise<ExchangeRateSnapshot> {
  return DEFAULT_EXCHANGE_RATE_SNAPSHOT;
}
