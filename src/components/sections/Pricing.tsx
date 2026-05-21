'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import { PRICING_PLANS } from '@/lib/data';
import PlanCard from '@/components/pricing/PlanCard';
import CustomPlanCard from '@/components/pricing/CustomPlanCard';
import { Currency, getBundlePrice, SERVICE_COSTS } from '@/lib/currency';
import { FileText, Download, FileDown, Sparkles, LayoutDashboard } from 'lucide-react';
import { useExchangeRates } from '@/lib/useExchangeRates';

export default function Pricing() {
  const bcRef = useRef<BroadcastChannel | null>(null);
  const router = useRouter();
  const [currency, setCurrency] = useState<Currency>('GBP');
  const { snapshot: exchangeRates } = useExchangeRates();

  useEffect(() => {
    try {
      bcRef.current = new BroadcastChannel('app-events');
      bcRef.current.onmessage = (ev: MessageEvent) => {
        const data: any = (ev as any)?.data || {};
        if (data.type === 'currency-updated' && (data.currency === 'GBP' || data.currency === 'EUR' || data.currency === 'USD')) {
          setCurrency(data.currency);
          try {
            localStorage.setItem('currency', data.currency);
          } catch {}
        }
      };
    } catch {}

    try {
      const saved = localStorage.getItem('currency');
      if (saved === 'GBP' || saved === 'EUR' || saved === 'USD') setCurrency(saved);
    } catch {}

    return () => {
      try {
        bcRef.current?.close();
      } catch {}
    };
  }, []);

  const handleTopUpRequest = () => {
    router.push('/pricing');
  };

  return (
    <Section id="pricing" className="py-14">
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl font-bold sm:text-3xl">Token top-up plans</h2>
        <p className="mt-2 text-slate-600">Tokens are charged per action. No subscription or hidden fees.</p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-4">
        {PRICING_PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            name={plan.name}
            popular={plan.popular}
            bullets={plan.points}
            cta={plan.cta}
            amount={getBundlePrice(plan, currency, exchangeRates)}
            currency={currency}
            tokens={plan.tokens}
            onAction={handleTopUpRequest}
          />
        ))}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <CustomPlanCard currency={currency} exchangeRates={exchangeRates} onRequest={handleTopUpRequest} />
        </motion.div>
      </div>

      <div className="mx-auto mt-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h3 className="mb-6 text-center text-lg font-semibold">How much does an action cost?</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {([
              { icon: FileText, label: 'Create CV', tokens: SERVICE_COSTS.CREATE_DRAFT },
              { icon: FileText, label: 'Create Resume', tokens: SERVICE_COSTS.CREATE_DRAFT },
              { icon: Download, label: 'Export PDF', tokens: SERVICE_COSTS.EXPORT_PDF },
              { icon: FileDown, label: 'Export DOCX', tokens: SERVICE_COSTS.EXPORT_DOCX },
              { icon: Sparkles, label: 'AI Assist', tokens: SERVICE_COSTS.AI_IMPROVE },
              { icon: LayoutDashboard, label: 'Manager', tokens: SERVICE_COSTS.PERSONAL_MANAGER },
            ] as const).map(({ icon: Icon, label, tokens }) => (
              <Card key={label} className="p-4 text-center transition-shadow hover:shadow-md" padding="sm">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                    <Icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="text-xs font-medium text-slate-700">{label}</div>
                  <div className="text-sm font-bold text-indigo-600">{tokens} Tokens</div>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-4 text-center text-xs text-slate-500">Tokens never expire. Refunds for exports are not provided.</div>
        </motion.div>
      </div>

      <p className="mt-4 text-center text-xs text-slate-500">Tokens deposit after purchase for signed-in users.</p>
    </Section>
  );
}
