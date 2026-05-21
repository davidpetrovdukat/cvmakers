"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Section from "@/components/layout/Section";
import Segmented from "@/components/ui/Segmented";
import { Currency, getBundlePrice } from "@/lib/currency";
import { PRICING_PLANS } from "@/lib/data";
import PlanCard from "@/components/pricing/PlanCard";
import CustomPlanCard from "@/components/pricing/CustomPlanCard";
import { useExchangeRates } from "@/lib/useExchangeRates";

type CheckoutPayload = {
  name: string;
  price: number;
  currency: Currency;
  tokens: number;
};

export default function PricingClient() {
  const bcRef = useRef<BroadcastChannel | null>(null);
  const { snapshot: exchangeRates } = useExchangeRates();
  const [currency, setCurrency] = useState<Currency>(() => {
    if (typeof window === "undefined") return "GBP";
    try {
      return (localStorage.getItem("currency") as Currency) || "GBP";
    } catch {
      return "GBP";
    }
  });
  const { status, data: session } = useSession();
  const router = useRouter();
  const signedIn = status === "authenticated";

  const handleCurrencyChange = (next: Currency) => {
    setCurrency(next);
    try {
      localStorage.setItem("currency", next);
    } catch {}
    try {
      bcRef.current?.postMessage({ type: "currency-updated", currency: next });
    } catch {}
  };

  useEffect(() => {
    try {
      bcRef.current = new BroadcastChannel("app-events");
      bcRef.current.onmessage = (ev: MessageEvent) => {
        const data: any = (ev as any)?.data || {};
        if (
          data.type === "currency-updated" &&
          (data.currency === "GBP" || data.currency === "EUR" || data.currency === "USD")
        ) {
          setCurrency(data.currency);
          try {
            localStorage.setItem("currency", data.currency);
          } catch {}
        }
      };
    } catch {}

    return () => {
      try {
        bcRef.current?.close();
      } catch {}
    };
  }, []);

  const handlePlanRequest = (plan: CheckoutPayload) => {
    if (!signedIn) {
      router.push("/auth/signin?mode=login");
      return;
    }

    const checkoutData = {
      email: session?.user?.email || "",
      planId: plan.name,
      description: `Top-up: ${plan.name}`,
      amount: plan.price,
      currency: plan.currency,
      tokens: plan.tokens,
      total: plan.price,
    };

    localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Section className="py-12">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Top-Up</h1>
          <p className="mt-2 text-slate-600">Choose a plan and proceed to secure checkout.</p>

          <motion.div
            className="mt-6 flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Segmented
              options={[
                { label: "GBP", value: "GBP" },
                { label: "EUR", value: "EUR" },
                { label: "USD", value: "USD" },
              ]}
              value={currency}
              onChange={(v) => handleCurrencyChange(v as Currency)}
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-10 grid gap-6 md:grid-cols-3 lg:grid-cols-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {PRICING_PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
            >
              <PlanCard
                name={plan.name}
                popular={plan.popular}
                bullets={plan.points}
                cta="Buy Tokens"
                amount={getBundlePrice(plan, currency, exchangeRates)}
                currency={currency}
                tokens={plan.tokens}
                onAction={({ name, amount, currency: selectedCurrency, tokens }) =>
                  handlePlanRequest({ name, price: amount, currency: selectedCurrency, tokens })
                }
              />
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            <CustomPlanCard
              currency={currency}
              exchangeRates={exchangeRates}
              onRequest={({ name, price, currency: selectedCurrency, tokens }) =>
                handlePlanRequest({ name, price, currency: selectedCurrency, tokens })
              }
            />
          </motion.div>
        </motion.div>
      </Section>
    </div>
  );
}
