'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { useState } from 'react';
import type { Currency } from '@/lib/currency';
import { convertToTokens } from '@/lib/currency';

export default function CustomPlanCard({ currency, onRequest }: { currency: Currency; onRequest: () => void; }) {
  const [priceInput, setPriceInput] = useState<string>('5');
  const min = 0.01;
  const numericPrice = parseFloat(priceInput || '0');
  const validNumber = Number.isFinite(numericPrice);

  const tokens = validNumber ? convertToTokens(numericPrice, currency).tokens : 0;
  const reduceMotion = useReducedMotion();

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setPriceInput(e.target.value);
  };

  const currencyLabel = currency === 'GBP' ? String.fromCharCode(163) : currency === 'EUR' ? String.fromCharCode(8364) : '$';

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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Top-Up</h3>
        <span className="text-xs rounded-full px-2 py-1 bg-slate-100 border border-[#E2E8F0] text-slate-700">EARLY / SUPPORTER</span>
      </div>
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
        <span className="text-base font-normal text-slate-500">/one-time</span>
      </div>
      {(!validNumber || numericPrice < min) && (
        <div className="mt-1 text-[11px] text-red-600">Minimum amount is {currencyLabel}0.01</div>
      )}
      <div className="mt-1 text-xs text-slate-600">= {tokens} tokens</div>
      <ul className="mt-4 space-y-2 text-sm text-slate-700 list-disc pl-5">
        <li>Plan a manual top-up</li>
        <li>No subscription - pay what you need</li>
        <li>Minimum {currencyLabel}0.01</li>
      </ul>
      <div className="mt-6">
        <Button className="w-full" size="lg" onClick={onRequest} disabled={!validNumber || numericPrice < min}>
          Request top-up
        </Button>
      </div>
    </motion.div>
  );
}



