'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { useState } from 'react';
import type { Currency, ExchangeRateSnapshot } from '@/lib/currency';
import { convertToTokens, formatCurrency, getCurrencySymbol } from '@/lib/currency';

export default function CustomPlanCard({
  currency,
  exchangeRates,
  onRequest,
}: {
  currency: Currency;
  exchangeRates?: ExchangeRateSnapshot;
  onRequest: (data: { name: string; price: number; currency: Currency; tokens: number }) => void;
}) {
  const [priceInput, setPriceInput] = useState<string>('5');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const min = 5;
  const numericPrice = parseFloat(priceInput || '0');
  const validNumber = Number.isFinite(numericPrice);

  const tokens = validNumber ? convertToTokens(numericPrice, currency, exchangeRates).tokens : 0;
  const reduceMotion = useReducedMotion();

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setPriceInput(e.target.value);
  };

  const handleRequest = () => {
    if (validNumber && numericPrice >= min) {
      onRequest({
        name: 'Custom',
        price: numericPrice,
        currency: currency,
        tokens,
      });
    }
  };

  const currencyLabel = getCurrencySymbol(currency);
  const minimumAmount = formatCurrency(min, currency);

  return (
    <motion.div
      className="rounded-2xl bg-white border border-[#E2E8F0] shadow-sm p-6 flex flex-col"
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      whileHover={reduceMotion ? undefined : { y: -8, scale: 1.02, transition: { type: 'spring', stiffness: 260, damping: 22 } }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
    >
      <h3 className="text-lg font-semibold">Custom</h3>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-3xl font-bold">{currencyLabel}</span>
        <input
          type="number"
          step="any"
          value={priceInput}
          onChange={onChange}
          className="w-24 text-3xl font-bold bg-transparent border-b border-[#E2E8F0] focus:outline-none focus:ring-0"
          aria-label="Custom price"
        />
      </div>
      {(!validNumber || numericPrice < min) && (
        <div className="mt-1 text-[11px] text-red-600">Minimum amount is {minimumAmount}</div>
      )}
      <div className="mt-1 text-xs text-slate-600">= {tokens} tokens</div>
      <ul className="mt-4 space-y-2 text-sm text-slate-700 list-disc pl-5">
        <li>Plan a manual top-up</li>
        <li>No subscription - pay what you need</li>
        <li>Minimum {minimumAmount}</li>
      </ul>
      <div className="mt-6 space-y-3">
        <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span>
            I have read and agree to the{' '}
            <a href="/terms" target="_blank" className="text-indigo-600 underline hover:text-indigo-800">
              Terms and Conditions
            </a>
          </span>
        </label>
        <Button className="w-full" size="lg" onClick={handleRequest} disabled={!validNumber || numericPrice < min || !agreeTerms}>
          Buy Tokens
        </Button>
      </div>
    </motion.div>
  );
}



