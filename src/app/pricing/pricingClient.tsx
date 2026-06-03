"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Section from "@/components/layout/Section";
import Segmented from "@/components/ui/Segmented";
import { CURRENCY_OPTIONS, Currency, getBundlePrice, isCurrency } from "@/lib/currency";
import { PRICING_PLANS } from "@/lib/data";
import PlanCard from "@/components/pricing/PlanCard";
import CustomPlanCard from "@/components/pricing/CustomPlanCard";
import { useExchangeRates } from "@/lib/useExchangeRates";
import { useLocale } from "@/i18n/LocaleProvider";
import { localizePath } from "@/i18n/config";

type CheckoutPayload = {
  name: string;
  price: number;
  currency: Currency;
  tokens: number;
};

const COPY = {
  en: {
    title: 'Top-Up',
    subtitle: 'Choose a plan and proceed to secure checkout.',
    tokenLabel: 'tokens',
    popular: 'POPULAR',
    termsLabel: 'I have read and agree to the',
    termsLinkLabel: 'Terms and Conditions',
    plans: {
      'plan-starter': { name: 'Quick Start', points: ['Manual token top-up', 'No subscription', 'Preview included'], cta: 'Buy Tokens' },
      'plan-pro': { name: 'Job Hunter', points: ['Manual token top-up', 'Branding options', 'Priority support'], cta: 'Buy Tokens' },
      'plan-business': { name: 'Career Boost', points: ['Manual token top-up', 'Team access', 'Integrations roadmap'], cta: 'Buy Tokens' },
      'plan-annual': { name: 'Annual Pro', points: ['50,000 tokens for the year', 'Best value per token', 'Priority support'], cta: 'Buy Now' },
    },
    custom: {
      custom: 'Custom',
      customPayloadName: 'Custom',
      ariaPrice: 'Custom price',
      minimumAmount: 'Minimum amount is {amount}',
      tokens: 'tokens',
      bullets: ['Plan a manual top-up', 'No subscription - pay what you need', 'Minimum {amount}'],
      termsLabel: 'I have read and agree to the',
      termsLinkLabel: 'Terms and Conditions',
      termsHref: '/terms',
      buyTokens: 'Buy Tokens',
    },
  },
  tr: {
    title: 'Token Yükle',
    subtitle: 'Bir plan seçin ve güvenli ödeme adımına geçin.',
    tokenLabel: 'token',
    popular: 'POPÜLER',
    termsLabel: 'Okudum ve kabul ediyorum:',
    termsLinkLabel: 'Şartlar ve Koşullar',
    plans: {
      'plan-starter': { name: 'Hızlı Başlangıç', points: ['Manuel token yükleme', 'Abonelik yok', 'Önizleme dahil'], cta: 'Token Satın Al' },
      'plan-pro': { name: 'İş Arayan', points: ['Manuel token yükleme', 'Markalama seçenekleri', 'Öncelikli destek'], cta: 'Token Satın Al' },
      'plan-business': { name: 'Kariyer Desteği', points: ['Manuel token yükleme', 'Ekip erişimi', 'Entegrasyon yol haritası'], cta: 'Token Satın Al' },
      'plan-annual': { name: 'Yıllık Pro', points: ['Yıl için 50.000 token', 'Token başına en iyi değer', 'Öncelikli destek'], cta: 'Satın Al' },
    },
    custom: {
      custom: 'Özel',
      customPayloadName: 'Özel',
      ariaPrice: 'Özel fiyat',
      minimumAmount: 'Minimum tutar {amount}',
      tokens: 'token',
      bullets: ['Manuel token yükleme planlayın', 'Abonelik yok - ihtiyacınız kadar ödeyin', 'Minimum {amount}'],
      termsLabel: 'Okudum ve kabul ediyorum:',
      termsLinkLabel: 'Şartlar ve Koşullar',
      termsHref: '/terms',
      buyTokens: 'Token Satın Al',
    },
  },
} as const;

export default function PricingClient() {
  const locale = useLocale();
  const copy = COPY[locale];
  const bcRef = useRef<BroadcastChannel | null>(null);
  const { snapshot: exchangeRates } = useExchangeRates();
  const [currency, setCurrency] = useState<Currency>(() => {
    if (typeof window === "undefined") return "GBP";
    try {
      const saved = localStorage.getItem("currency");
      return isCurrency(saved) ? saved : "GBP";
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
          isCurrency(data.currency)
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
      router.push(`${localizePath('/auth/signin', locale)}?mode=login`);
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
      locale,
    };

    localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
    router.push(localizePath('/checkout', locale));
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
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{copy.title}</h1>
          <p className="mt-2 text-slate-600">{copy.subtitle}</p>

          <motion.div
            className="mt-6 flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Segmented
              options={CURRENCY_OPTIONS}
              value={currency}
              onChange={(v) => handleCurrencyChange(v as Currency)}
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-10 grid gap-6 md:grid-cols-3 lg:grid-cols-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {PRICING_PLANS.map((plan, index) => {
            const localized = copy.plans[plan.id as keyof typeof copy.plans];
            return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
            >
              <PlanCard
                name={localized?.name ?? plan.name}
                popular={plan.popular}
                badgeText={plan.popular ? copy.popular : undefined}
                bullets={localized?.points ?? plan.points}
                cta={localized?.cta ?? plan.cta}
                amount={getBundlePrice(plan, currency, exchangeRates)}
                currency={currency}
                tokens={plan.tokens}
                tokenLabel={copy.tokenLabel}
                termsLabel={copy.termsLabel}
                termsLinkLabel={copy.termsLinkLabel}
                termsHref={localizePath('/terms', locale)}
                onAction={({ name, amount, currency: selectedCurrency, tokens }) =>
                  handlePlanRequest({ name, price: amount, currency: selectedCurrency, tokens })
                }
              />
            </motion.div>
          );})}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            <CustomPlanCard
              currency={currency}
              exchangeRates={exchangeRates}
              labels={{ ...copy.custom, termsHref: localizePath(copy.custom.termsHref, locale) }}
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
