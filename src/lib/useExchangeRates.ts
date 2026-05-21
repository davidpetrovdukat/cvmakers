'use client';

import * as React from 'react';
import {
  DEFAULT_EXCHANGE_RATE_SNAPSHOT,
  ExchangeRateSnapshot,
} from '@/lib/currency';

export function useExchangeRates() {
  const [snapshot, setSnapshot] = React.useState<ExchangeRateSnapshot>(DEFAULT_EXCHANGE_RATE_SNAPSHOT);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch('/api/exchange-rates', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to load exchange rates');
        }

        const payload = (await response.json()) as ExchangeRateSnapshot;
        if (!cancelled) {
          setSnapshot(payload);
        }
      } catch (error) {
        console.error('[USE_EXCHANGE_RATES_ERROR]', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { snapshot, loading };
}
