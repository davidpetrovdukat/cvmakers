"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { motion, useReducedMotion } from "framer-motion";
import { Currency } from "@/lib/currency";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export type PlanCardProps = {
  name: string;
  popular?: boolean;
  badgeText?: string;
  bullets: string[];
  cta: string;
  priceText?: string; // e.g., 'GBP 10'
  amount?: number; // numeric amount (one-time)
  currency?: Currency;
  vatRatePercent?: number;
  tokens?: number;
  onAction?: () => void;
};

export default function PlanCard({
                                   name,
                                   popular,
                                   badgeText,
                                   bullets,
                                   cta,
                                   priceText,
                                   amount,
                                   currency = "GBP",
                                   vatRatePercent = 20,
                                   tokens,
                                 }: PlanCardProps) {
  const [agreeTerms, setAgreeTerms] = useState(false);
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const { data: session, status } = useSession();

  // --- Resolve amount & currency
  const resolvedAmount = (() => {
    if (typeof amount === "number") return { amount, currency } as const;
    if (priceText) {
      const match = priceText.match(/([A-Z]{3})\s*([0-9]+(?:\.[0-9]+)?)/);
      const curr = (match?.[1] as Currency) || "GBP";
      const amt = parseFloat(match?.[2] || "0");
      return { amount: amt, currency: curr } as const;
    }
    return { amount: 0, currency: "GBP" as Currency } as const;
  })();

  // --- Tokens & VAT
  const computedTokens =
    typeof tokens === "number"
      ? Math.max(0, Math.round(tokens))
      : Math.max(0, Math.round(resolvedAmount.amount * 100));
  const incVat = resolvedAmount.amount * (1 + vatRatePercent / 100);

  const money = (n: number, curr: Currency) => {
    const locale =
      curr === "GBP" ? "en-GB" : curr === "EUR" ? "en-IE" : "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: curr,
      maximumFractionDigits: n % 1 === 0 ? 0 : 2,
    }).format(n);
  };

  // --- Redirect on click
  const handleTopUp = () => {
    if (status !== "authenticated") {
      toast.info("Please log in to continue");
      router.push("/auth/signin?mode=login");
      return;
    }

    const checkoutData = {
      planId: name,
      description: `Top-up: ${name}`,
      amount: resolvedAmount.amount,
      currency: resolvedAmount.currency,
      tokens: computedTokens,
      vatRate: vatRatePercent,
      vatAmount: resolvedAmount.amount * (vatRatePercent / 100),
      total: incVat,
      email: session?.user?.email || "",
    };

    try {
      localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
      router.push("/checkout");
    } catch (err) {
      console.error("Failed to save checkout data:", err);
      toast.error("Something went wrong, please try again.");
    }
  };

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
        } flex flex-col justify-between h-full p-6 rounded-2xl`}
      >
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">{name}</h3>
            {(popular || badgeText) && (
              <motion.span
                className="text-xs rounded-full px-2 py-1 text-indigo-700 bg-indigo-100 border border-indigo-300 font-semibold"
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
            {money(resolvedAmount.amount, resolvedAmount.currency)}
            <span className="text-base font-normal text-slate-500">
              /one-time
            </span>
          </div>

          <div className="text-sm text-slate-600 mt-1">
            ≈ {computedTokens} tokens
          </div>
          <div className="text-[11px] text-slate-500">
            incl. VAT: {money(incVat, resolvedAmount.currency)}
          </div>

          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {bullets.map((point) => (
              <li
                key={point}
                className="flex items-start gap-2 leading-snug"
              >
                <span>•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

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
          <Button className="w-full" size="lg" onClick={handleTopUp} disabled={!agreeTerms}>
            Buy Tokens
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
