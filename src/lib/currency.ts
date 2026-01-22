// Currency conversion system with GBP as base currency
// 1.00 GBP = 100 tokens

export type Currency = 'GBP' | 'EUR' | 'USD';

// Exchange rates relative to GBP (base currency)
export const EXCHANGE_RATES: Record<Currency, number> = {
  GBP: 1.0,    // Base currency
  EUR: 1.15,   // 1 GBP = 1.15 EUR (approximate)
  USD: 1.27,   // 1 GBP = 1.27 USD (approximate, updated Jan 2025)
};

// Token conversion rate
export const TOKENS_PER_GBP = 100;

export interface CurrencyConversion {
  amount: number;
  currency: Currency;
  tokens: number;
  gbpEquivalent: number;
}

/**
 * Convert any currency amount to tokens based on GBP as base currency
 * @param amount - Amount in the specified currency
 * @param currency - Source currency
 * @returns CurrencyConversion object with tokens and GBP equivalent
 */
export function convertToTokens(amount: number, currency: Currency): CurrencyConversion {
  // Convert to GBP first
  const gbpAmount = amount / EXCHANGE_RATES[currency];
  
  // Calculate tokens (1 GBP = 100 tokens)
  const tokens = Math.floor(gbpAmount * TOKENS_PER_GBP);
  
  return {
    amount,
    currency,
    tokens,
    gbpEquivalent: gbpAmount,
  };
}

/**
 * Convert tokens back to currency amount
 * @param tokens - Number of tokens
 * @param currency - Target currency
 * @returns Amount in the specified currency
 */
export function convertTokensToCurrency(tokens: number, currency: Currency): number {
  const gbpAmount = tokens / TOKENS_PER_GBP;
  return gbpAmount * EXCHANGE_RATES[currency];
}

/**
 * Format currency amount with proper symbol and decimals
 * @param amount - Amount to format
 * @param currency - Currency code
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const symbols = {
    GBP: '£',
    EUR: '€',
    USD: '$',
  };
  
  return `${symbols[currency]}${amount.toFixed(2)}`;
}

/**
 * Get pricing plans with proper currency conversion
 */
export const PRICING_PLANS = [
  {
    id: 'plan-starter',
    name: 'Starter',
    gbpAmount: 5.00,
    tokens: convertToTokens(5.00, 'GBP').tokens,
    popular: false,
    cta: 'Request top-up',
    bullets: [
      'Top up 500 tokens (~50 documents)',
      'No subscription',
      'Draft and preview for free',
    ],
  },
  {
    id: 'plan-pro',
    name: 'Pro',
    gbpAmount: 15.00,
    tokens: convertToTokens(15.00, 'GBP').tokens,
    popular: true,
    cta: 'Request top-up',
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
    gbpAmount: 30.00,
    tokens: convertToTokens(30.00, 'GBP').tokens,
    popular: false,
    cta: 'Request top-up',
    bullets: [
      'Top up 3,000 tokens (~300 documents)',
      'Team management and roles',
      'API and webhooks',
      'Priority support',
    ],
  },
];

export type Plan = (typeof PRICING_PLANS)[0];

/**
 * Service costs in tokens
 */
export const SERVICE_COSTS = {
  CREATE_DRAFT: 100,        // Create CV/resume draft
  EXPORT_PDF: 50,           // Export to PDF
  EXPORT_DOCX: 50,          // Export to DOCX
  AI_IMPROVE: 200,          // Improve with AI
  PERSONAL_MANAGER: 800,    // Send to personal manager
} as const;

/**
 * Calculate total cost for a service combination
 * @param services - Array of service keys
 * @returns Total tokens required
 */
export function calculateServiceCost(services: (keyof typeof SERVICE_COSTS)[]): number {
  return services.reduce((total, service) => total + SERVICE_COSTS[service], 0);
}
