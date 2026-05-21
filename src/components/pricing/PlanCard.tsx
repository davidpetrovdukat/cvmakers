"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { motion, useReducedMotion } from "framer-motion";
import { Currency, formatCurrency } from "@/lib/currency";

export type PlanCardProps = {
  name: string;
  popular?: boolean;
  badgeText?: string;
  bullets: string[];
  cta: string;
  amount: number;
  currency: Currency;
  tokens: number;
  onAction?: (payload: { name: string; amount: number; currency: Currency; tokens: number }) => void;
};

export default function PlanCard({
  name,
  popular,
  badgeText,
  bullets,
  cta,
  amount,
  currency,
  tokens,
  onAction,
}: PlanCardProps) {
  const [agreeTerms, setAgreeTerms] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -8,
              scale: 1.02,
              transition: { type: "spring", stiffness: 260, damping: 22 },
            }
      }
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
    >
      <Card
        className={`${
          popular ? "shadow-lg border-2 border-indigo-200 bg-indigo-50/30" : "border-slate-200"
        } flex h-full flex-col justify-between rounded-2xl p-6`}
      >
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">{name}</h3>
            {(popular || badgeText) && (
              <motion.span
                className="rounded-full border border-indigo-300 bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.3,
                  type: "spring",
                  stiffness: 400,
                  damping: 17,
                }}
              >
                {badgeText || "POPULAR"}
              </motion.span>
            )}
          </div>

          <div className="mt-3 text-3xl font-bold text-slate-900">
            {formatCurrency(amount, currency)}
            <span className="text-base font-normal text-slate-500">/one-time</span>
          </div>

          <div className="mt-1 text-sm text-slate-600">{tokens.toLocaleString()} tokens</div>

          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {bullets.map((point) => (
              <li key={point} className="flex items-start gap-2 leading-snug">
                <span>•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 space-y-3">
          <label className="flex cursor-pointer items-start gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>
              I have read and agree to the{" "}
              <a href="/terms" target="_blank" className="text-indigo-600 underline hover:text-indigo-800">
                Terms and Conditions
              </a>
            </span>
          </label>
          <Button
            className="w-full"
            size="lg"
            onClick={() => onAction?.({ name, amount, currency, tokens })}
            disabled={!agreeTerms}
          >
            {cta}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
