import { convertToTokens, Currency } from './currency';
import { PRICING_PLANS } from './data';

export const pricingPlans = PRICING_PLANS;

export type Plan = (typeof pricingPlans)[0];
export type { Currency };

// Legacy compatibility - keep old structure for existing components
export const legacyPricingPlans = [
  {
    id: 'plan-starter',
    name: 'Starter',
    baseGBP: 5.00,
    baseEUR: convertToTokens(5.00, 'GBP').gbpEquivalent * 1.15, // Convert GBP to EUR
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
    baseGBP: 15.00,
    baseEUR: convertToTokens(15.00, 'GBP').gbpEquivalent * 1.15, // Convert GBP to EUR
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
    baseGBP: 30.00,
    baseEUR: convertToTokens(30.00, 'GBP').gbpEquivalent * 1.15, // Convert GBP to EUR
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
