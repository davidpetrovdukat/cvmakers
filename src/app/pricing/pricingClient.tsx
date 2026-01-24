"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import Segmented from "@/components/ui/Segmented";
import { CC, VAT_RATES } from "@/lib/constants";
import { Currency } from "@/lib/currency";
import {
  convertToTokens,
  convertTokensToCurrency,
  formatCurrency,
} from "@/lib/currency";
import { PRICING_PLANS } from "@/lib/data";
import PlanCard from "@/components/pricing/PlanCard";
import CustomPlanCard from "@/components/pricing/CustomPlanCard";

const COUNTRIES = Object.keys(CC);

export default function PricingClient() {
  const bcRef = useRef<BroadcastChannel | null>(null);
  const [currency, setCurrency] = useState<Currency>(() => {
    if (typeof window === "undefined") return "GBP";
    try {
      return (localStorage.getItem("currency") as Currency) || "GBP";
    } catch {
      return "GBP";
    }
  });
  const [country, setCountry] = useState<string>("United Kingdom");
  const { status, data: session } = useSession();
  const router = useRouter();
  const signedIn = status === "authenticated";

  const vatRate = useMemo(() => {
    const code = (CC as Record<string, string>)[country] || "UK";
    const rates = (VAT_RATES as Record<string, number[]>)[code] || [0, 20];
    return rates[rates.length - 1] || 20;
  }, [country]);

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

  const handlePlanRequest = (plan: any) => {
    if (!signedIn) {
      router.push("/auth/signin?mode=login");
      return;
    }

    // Обработка Custom top-up - цена уже передана в правильной валюте
    if (plan.name === 'Custom' && typeof plan.price === 'number' && plan.currency) {
      const tokens = convertToTokens(plan.price, plan.currency).tokens;
      const convertedAmount = plan.price; // Уже в правильной валюте
      const vatAmount = (convertedAmount * vatRate) / 100;

      const checkoutData = {
        email: session?.user?.email || "",
        planId: plan.name,
        description: `Top-up: ${plan.name}`,
        amount: convertedAmount,
        currency: plan.currency,
        tokens,
        vatRate,
        vatAmount,
        total: convertedAmount + vatAmount,
      };

      localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
      router.push("/checkout");
      return;
    }

    // Обработка обычных планов - цена в формате строки с символом валюты
    if (!plan.price || typeof plan.price !== 'string') {
      console.error('Invalid plan price:', plan);
      return;
    }

    const gbpAmount = parseFloat(plan.price.replace(/[£,]/g, ""));
    const tokens = convertToTokens(gbpAmount, "GBP").tokens;
    const convertedAmount = convertTokensToCurrency(tokens, currency);
    const vatAmount = (convertedAmount * vatRate) / 100;

    const checkoutData = {
      email: session?.user?.email || "",
      planId: plan.name,
      description: `Top-up: ${plan.name}`,
      amount: convertedAmount,
      currency,
      tokens,
      vatRate,
      vatAmount,
      total: convertedAmount + vatAmount,
    };

    localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
    router.push("/checkout");
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <Section className="py-12">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold">Top-Up</h1>
          <p className="mt-2 text-slate-600">
            Choose a plan and proceed to secure checkout.
          </p>

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
              onChange={(v) => setCurrency(v as Currency)}
            />
            <select
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </motion.div>
        </motion.div>

        <motion.div 
          className="mt-10 grid md:grid-cols-3 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {PRICING_PLANS.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
            >
              <PlanCard
                name={plan.name}
                popular={plan.popular}
                bullets={plan.points}
                cta="Buy Tokens"
                amount={plan.price ? parseFloat(plan.price.replace(/[£,]/g, "")) : 0}
                currency={currency}
                onAction={() => handlePlanRequest(plan)}
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
              onRequest={handlePlanRequest}
            />
          </motion.div>
        </motion.div>
      </Section>
    </div>
  );
}
