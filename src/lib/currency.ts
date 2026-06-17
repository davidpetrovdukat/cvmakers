export const SUPPORTED_CURRENCIES = ['GBP', 'EUR', 'USD', 'TRY', 'JPY'] as const;

export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

export const ZERO_DECIMAL_CURRENCIES = ['JPY'] as const;
export type ZeroDecimalCurrency = (typeof ZERO_DECIMAL_CURRENCIES)[number];

export const CURRENCY_OPTIONS = SUPPORTED_CURRENCIES.map((currency) => ({
  label: currency,
  value: currency,
}));

export function isCurrency(value: unknown): value is Currency {
  return typeof value === 'string' && SUPPORTED_CURRENCIES.includes(value as Currency);
}

/** SSR-safe default before localStorage is read on the client. */
export function getDefaultCurrencyForLocale(locale: string): Currency {
  return locale === 'ja' ? 'JPY' : 'GBP';
}

export function isZeroDecimalCurrency(currency: Currency): currency is ZeroDecimalCurrency {
  return (ZERO_DECIMAL_CURRENCIES as readonly string[]).includes(currency);
}

export const TOKENS_PER_GBP = 100;
export const GBP_TO_TRY_RATE = 61.6353;

export type ExchangeRateSnapshot = {
  base: 'EUR';
  rates: Record<Currency, number>;
  asOf: string;
  fetchedAt: string;
  source: 'ecb' | 'fallback';
};

export const DEFAULT_EXCHANGE_RATE_SNAPSHOT: ExchangeRateSnapshot = {
  base: 'EUR',
  rates: {
    EUR: 1,
    GBP: 0.86438,
    USD: 1.1555,
    TRY: 0.86438 * GBP_TO_TRY_RATE,
    JPY: 163,
  },
  asOf: '2026-05-25',
  fetchedAt: '2026-05-25T06:00:00.000Z',
  source: 'fallback',
};

export interface CurrencyConversion {
  amount: number;
  currency: Currency;
  tokens: number;
  gbpEquivalent: number;
}

function getSnapshot(snapshot?: ExchangeRateSnapshot): ExchangeRateSnapshot {
  return snapshot ?? DEFAULT_EXCHANGE_RATE_SNAPSHOT;
}

export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency,
  snapshot?: ExchangeRateSnapshot,
): number {
  if (!Number.isFinite(amount)) return 0;
  if (from === to) return amount;

  const activeSnapshot = getSnapshot(snapshot);
  const fromRate = activeSnapshot.rates[from];
  const toRate = activeSnapshot.rates[to];

  if (!Number.isFinite(fromRate) || !Number.isFinite(toRate) || fromRate <= 0 || toRate <= 0) {
    return 0;
  }

  const amountInEur = amount / fromRate;
  return amountInEur * toRate;
}

export function convertToTokens(
  amount: number,
  currency: Currency,
  snapshot?: ExchangeRateSnapshot,
): CurrencyConversion {
  const gbpAmount = convertCurrency(amount, currency, 'GBP', snapshot);
  const tokens = Math.floor(gbpAmount * TOKENS_PER_GBP);

  return {
    amount,
    currency,
    tokens,
    gbpEquivalent: gbpAmount,
  };
}

export function convertTokensToCurrency(
  tokens: number,
  currency: Currency,
  snapshot?: ExchangeRateSnapshot,
): number {
  const gbpAmount = tokens / TOKENS_PER_GBP;
  return convertCurrency(gbpAmount, 'GBP', currency, snapshot);
}

function getCurrencyLocale(currency: Currency): string {
  switch (currency) {
    case 'GBP':
      return 'en-GB';
    case 'EUR':
      return 'en-IE';
    case 'TRY':
      return 'tr-TR';
    case 'JPY':
      return 'ja-JP';
    default:
      return 'en-US';
  }
}

export function formatCurrency(amount: number, currency: Currency): string {
  const zeroDecimal = isZeroDecimalCurrency(currency);
  return new Intl.NumberFormat(getCurrencyLocale(currency), {
    style: 'currency',
    currency,
    minimumFractionDigits: zeroDecimal ? 0 : 2,
    maximumFractionDigits: zeroDecimal ? 0 : 2,
  }).format(amount);
}

export function getCurrencySymbol(currency: Currency): string {
  switch (currency) {
    case 'GBP':
      return '£';
    case 'EUR':
      return '€';
    case 'USD':
      return '$';
    case 'TRY':
      return '₺';
    case 'JPY':
      return '¥';
  }
}

export type TokenBundle = {
  id: string;
  name: string;
  gbpAmount: number;
  tokens: number;
  popular: boolean;
  cta: string;
  bullets: string[];
};

export const TOKEN_BUNDLES: TokenBundle[] = [
  {
    id: 'plan-starter',
    name: 'Starter',
    gbpAmount: 5.0,
    tokens: 500,
    popular: false,
    cta: 'Buy Tokens',
    bullets: [
      'Top up 500 tokens (~50 documents)',
      'No subscription',
      'Draft and preview for free',
    ],
  },
  {
    id: 'plan-pro',
    name: 'Pro',
    gbpAmount: 15.0,
    tokens: 1500,
    popular: true,
    cta: 'Buy Tokens',
    bullets: [
      'Top up 1,500 tokens (~150 documents)',
      'Templates and branding',
      'Collaboration tools',
      'Read receipts',
    ],
  },
  {
    id: 'plan-business',
    name: 'Business',
    gbpAmount: 30.0,
    tokens: 3000,
    popular: false,
    cta: 'Buy Tokens',
    bullets: [
      'Top up 3,000 tokens (~300 documents)',
      'Team management and roles',
      'API and webhooks',
      'Priority support',
    ],
  },
];

export type Plan = (typeof TOKEN_BUNDLES)[0];

export function getBundlePrice(
  bundle: { gbpAmount: number },
  currency: Currency,
  snapshot?: ExchangeRateSnapshot,
): number {
  const converted = convertCurrency(bundle.gbpAmount, 'GBP', currency, snapshot);
  if (isZeroDecimalCurrency(currency)) {
    return Math.round(converted);
  }
  return Math.round(converted * 100) / 100;
}

export function getMinimumTopUpAmount(currency: Currency, snapshot?: ExchangeRateSnapshot): number {
  const gbpMin = 5;
  const converted = getBundlePrice({ gbpAmount: gbpMin }, currency, snapshot);
  return isZeroDecimalCurrency(currency) ? Math.ceil(converted) : converted;
}

export function toStoredAmount(amount: number, currency: Currency): number {
  return isZeroDecimalCurrency(currency) ? Math.round(amount) : Math.round(amount * 100);
}

export const SERVICE_COSTS = {
  CREATE_DRAFT: 100,
  EXPORT_PDF: 50,
  EXPORT_DOCX: 50,
  AI_IMPROVE: 200,
  PERSONAL_MANAGER: 800,
} as const;

export function calculateServiceCost(services: (keyof typeof SERVICE_COSTS)[]): number {
  return services.reduce((total, service) => total + SERVICE_COSTS[service], 0);
}
