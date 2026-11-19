import { Currency } from './currency';
import { PRICING_PLANS } from './data';

export const pricingPlans = PRICING_PLANS;

export type Plan = (typeof pricingPlans)[0];
export type { Currency };

// Legacy compatibility - prices are fixed in EUR.
export const legacyPricingPlans = [
  {
    id: 'plan-starter',
    name: 'Starter',
    baseEUR: 5.00,
    tokens: 500,
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
    baseEUR: 15.00,
    tokens: 1500,
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
    baseEUR: 30.00,
    tokens: 3000,
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
