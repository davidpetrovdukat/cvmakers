import { CUSTOM_PLAN_ID, PRICING_PLANS } from './data';
import {
  convertToTokens,
  getBundlePrice,
  getMinimumTopUpAmount,
  isCurrency,
  type Currency,
} from './currency';
import { getExchangeRateSnapshot } from './exchange-rates';

export const MAX_CUSTOM_TOPUP_GBP = 1000;

/** What the browser is allowed to send: a choice, never a price or a token count. */
export type CheckoutRequest = {
  planId?: unknown;
  customAmount?: unknown;
  currency?: unknown;
};

export type CheckoutItem = {
  kind: 'TOKENS';
  productId: string;
  name: string;
  description: string;
  amount: number;
  currency: Currency;
  tokens: number;
};

export class CheckoutError extends Error {}

/**
 * Prices a checkout on the server from the plan catalogue and current exchange rates.
 * Every amount and token count that reaches the payment gateway comes from here.
 */
export async function resolveCheckoutItem(input: CheckoutRequest): Promise<CheckoutItem> {
  if (!isCurrency(input.currency)) {
    throw new CheckoutError('Unsupported currency');
  }
  const currency = input.currency;
  const snapshot = await getExchangeRateSnapshot();

  if (input.planId !== CUSTOM_PLAN_ID) {
    const plan = PRICING_PLANS.find((p) => p.id === input.planId);
    if (!plan) {
      throw new CheckoutError('Unknown plan');
    }
    return {
      kind: 'TOKENS',
      productId: plan.id,
      name: plan.name,
      description: `Top-up: ${plan.name}`,
      amount: getBundlePrice(plan, currency, snapshot),
      currency,
      tokens: plan.tokens,
    };
  }

  const raw = typeof input.customAmount === 'number' ? input.customAmount : Number(input.customAmount);
  if (!Number.isFinite(raw)) {
    throw new CheckoutError('Invalid amount');
  }
  const amount = Math.round(raw * 100) / 100;
  // Allow a cent of drift between the rates the browser showed and the server's rates.
  const min = getMinimumTopUpAmount(currency, snapshot) - 0.01;
  const max = getBundlePrice({ gbpAmount: MAX_CUSTOM_TOPUP_GBP }, currency, snapshot);
  if (amount < min || amount > max) {
    throw new CheckoutError('Amount is outside the allowed range');
  }

  const tokens = convertToTokens(amount, currency, snapshot).tokens;
  if (tokens <= 0) {
    throw new CheckoutError('Invalid amount');
  }

  return {
    kind: 'TOKENS',
    productId: CUSTOM_PLAN_ID,
    name: 'Custom',
    description: `Top-up: Custom (${tokens} tokens)`,
    amount,
    currency,
    tokens,
  };
}
