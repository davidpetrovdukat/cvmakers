export const SUPPORTED_CURRENCIES = ['EUR'] as const;

export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

export const ZERO_DECIMAL_CURRENCIES = [] as const;
export type ZeroDecimalCurrency = (typeof ZERO_DECIMAL_CURRENCIES)[number];

export const CURRENCY_OPTIONS = [{ label: 'EUR', value: 'EUR' }] as const;

export function isCurrency(value: unknown): value is Currency { return value === 'EUR'; }

/** EUR is the only supported purchase and invoice currency. */
export function getDefaultCurrencyForLocale(_locale: string): Currency { return 'EUR'; }

export function isZeroDecimalCurrency(_currency: Currency): _currency is ZeroDecimalCurrency { return false; }

export const TOKENS_PER_EUR = 100;

export type ExchangeRateSnapshot = {
  base: 'EUR';
  rates: Record<Currency, number>;
  asOf: string;
  fetchedAt: string;
  source: 'fixed';
};

export const DEFAULT_EXCHANGE_RATE_SNAPSHOT: ExchangeRateSnapshot = {
  base: 'EUR',
  rates: { EUR: 1 },
  asOf: 'fixed',
  fetchedAt: '2026-11-19T00:00:00.000Z',
  source: 'fixed',
};

export interface CurrencyConversion {
  amount: number;
  currency: Currency;
  tokens: number;
  eurEquivalent: number;
}

export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency,
  _snapshot?: ExchangeRateSnapshot,
): number {
  return Number.isFinite(amount) && from === 'EUR' && to === 'EUR' ? amount : 0;
}

export function convertToTokens(
  amount: number,
  currency: Currency,
  _snapshot?: ExchangeRateSnapshot,
): CurrencyConversion {
  const eurAmount = convertCurrency(amount, currency, 'EUR');
  const tokens = Math.floor(eurAmount * TOKENS_PER_EUR);

  return {
    amount,
    currency,
    tokens,
    eurEquivalent: eurAmount,
  };
}

export function convertTokensToCurrency(
  tokens: number,
  currency: Currency,
  _snapshot?: ExchangeRateSnapshot,
): number {
  return currency === 'EUR' ? tokens / TOKENS_PER_EUR : 0;
}

export function formatCurrency(amount: number, currency: Currency): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getCurrencySymbol(_currency: Currency): string { return '€'; }

export type TokenBundle = {
  id: string;
  name: string;
  eurAmount: number;
  tokens: number;
  popular: boolean;
  cta: string;
  bullets: string[];
};

export const TOKEN_BUNDLES: TokenBundle[] = [
  {
    id: 'plan-starter',
    name: 'Starter',
    eurAmount: 5.0,
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
    eurAmount: 15.0,
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
    eurAmount: 30.0,
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
  bundle: { eurAmount: number },
  currency: Currency,
  _snapshot?: ExchangeRateSnapshot,
): number {
  return currency === 'EUR' ? Math.round(bundle.eurAmount * 100) / 100 : 0;
}

export function getMinimumTopUpAmount(currency: Currency, _snapshot?: ExchangeRateSnapshot): number {
  return getBundlePrice({ eurAmount: 5 }, currency);
}

export function toStoredAmount(amount: number, _currency: Currency): number {
  return Math.round(amount * 100);
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
