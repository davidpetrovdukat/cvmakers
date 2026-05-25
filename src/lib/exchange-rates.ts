import {
  Currency,
  DEFAULT_EXCHANGE_RATE_SNAPSHOT,
  ExchangeRateSnapshot,
  GBP_TO_TRY_RATE,
  SUPPORTED_CURRENCIES,
} from '@/lib/currency';

const ECB_DAILY_RATES_URL = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml';

function extractRate(xml: string, currency: Currency): number | null {
  if (currency === 'EUR') return 1;
  const match = xml.match(new RegExp(`currency=["']${currency}["']\\s+rate=["']([0-9.]+)["']`, 'i'));
  if (!match) return null;
  const parsed = Number.parseFloat(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function extractDate(xml: string): string | null {
  const match = xml.match(/time=["']([0-9-]+)["']/i);
  return match?.[1] ?? null;
}

export async function getExchangeRateSnapshot(): Promise<ExchangeRateSnapshot> {
  try {
    const response = await fetch(ECB_DAILY_RATES_URL, {
      headers: { Accept: 'application/xml,text/xml' },
      next: { revalidate: 60 * 60 * 6 },
    });

    if (!response.ok) {
      throw new Error(`ECB request failed with ${response.status}`);
    }

    const xml = await response.text();
    const asOf = extractDate(xml);
    if (!asOf) {
      throw new Error('Unable to read ECB rate date');
    }

    const rates = SUPPORTED_CURRENCIES.reduce((acc, currency) => {
      const rate = extractRate(xml, currency);
      if (rate === null) {
        throw new Error(`Missing ECB rate for ${currency}`);
      }
      acc[currency] = rate;
      return acc;
    }, {} as Record<Currency, number>);
    rates.TRY = rates.GBP * GBP_TO_TRY_RATE;

    return {
      base: 'EUR',
      rates,
      asOf,
      fetchedAt: new Date().toISOString(),
      source: 'ecb',
    };
  } catch (error) {
    console.error('[EXCHANGE_RATES_ERROR]', error);
    return DEFAULT_EXCHANGE_RATE_SNAPSHOT;
  }
}
