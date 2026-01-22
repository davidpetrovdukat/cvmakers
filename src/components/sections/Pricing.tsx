'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import { PRICING_PLANS } from '@/lib/data';
import { THEME } from '@/lib/theme';
import PlanCard from '@/components/pricing/PlanCard';
import CustomPlanCard from '@/components/pricing/CustomPlanCard';
import { convertToTokens, convertTokensToCurrency, Currency } from '@/lib/currency';
import { FileText, Download, FileDown, Sparkles, LayoutDashboard } from 'lucide-react';
import { SERVICE_COSTS } from '@/lib/currency';

export default function Pricing() {
  const bcRef = useRef<BroadcastChannel | null>(null);
  const [currency, setCurrency] = useState<Currency>('GBP');

  useEffect(()=>{
    try {
      bcRef.current = new BroadcastChannel('app-events');
      bcRef.current.onmessage = (ev: MessageEvent) => {
        const data: any = (ev as any)?.data || {};
        if (data.type === 'currency-updated' && (data.currency === 'GBP' || data.currency === 'EUR' || data.currency === 'USD')) {
          setCurrency(data.currency);
          try { localStorage.setItem('currency', data.currency); } catch {}
        }
      };
    } catch {}
    // Read saved currency on mount (client) to avoid SSR mismatch
    try {
      const saved = localStorage.getItem('currency');
      if (saved === 'GBP' || saved === 'EUR' || saved === 'USD') setCurrency(saved);
    } catch {}
    return () => { try { bcRef.current?.close(); } catch {} };
  }, []);

  const handleTopUpRequest = () => {
    toast.info('Token top-ups are handled manually. Please contact support.');
  };

  return (
    <Section id="pricing" className="py-14">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold">Token top-up plans</h2>
        <p className="mt-2 text-slate-600">Tokens are charged per action. No subscription or hidden fees.</p>
      </motion.div>

      <div className="grid md:grid-cols-4 gap-6">
        {PRICING_PLANS.map((plan) => {
          // Parse GBP amount from the formatted price string
          const gbpAmount = plan.price ? parseFloat(plan.price.replace(/[£,]/g, '')) : 0;
          const tokens = convertToTokens(gbpAmount, 'GBP').tokens;
          const convertedAmount = convertTokensToCurrency(tokens, currency);
          
          return (
            <PlanCard
              key={plan.name}
              name={plan.name}
              popular={plan.popular}
              bullets={plan.points}
              cta={plan.cta}
              amount={convertedAmount}
              currency={currency}
              tokens={tokens}
              onAction={handleTopUpRequest}
            />
          );
        })}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <CustomPlanCard currency={currency} onRequest={handleTopUpRequest} />
        </motion.div>
      </div>
      <div className="mx-auto max-w-4xl mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h3 className="text-lg font-semibold text-center mb-6">How much does an action cost?</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {([
              { icon: FileText, label: 'Create CV', tokens: SERVICE_COSTS.CREATE_DRAFT },
              { icon: FileText, label: 'Create Resume', tokens: SERVICE_COSTS.CREATE_DRAFT },
              { icon: Download, label: 'Export PDF', tokens: SERVICE_COSTS.EXPORT_PDF },
              { icon: FileDown, label: 'Export DOCX', tokens: SERVICE_COSTS.EXPORT_DOCX },
              { icon: Sparkles, label: 'AI Assist', tokens: SERVICE_COSTS.AI_IMPROVE },
              { icon: LayoutDashboard, label: 'Manager', tokens: SERVICE_COSTS.PERSONAL_MANAGER },
            ] as const).map(({ icon: Icon, label, tokens }) => (
              <Card key={label} className="p-4 text-center hover:shadow-md transition-shadow" padding="sm">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="text-xs font-medium text-slate-700">{label}</div>
                  <div className="text-sm font-bold text-indigo-600">{tokens} Tokens</div>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-4 text-xs text-slate-500 text-center">Tokens never expire. Refunds for exports are not provided.</div>
        </motion.div>
      </div>
      <p className="mt-4 text-xs text-slate-500 text-center">Taxes may apply. Tokens deposit after purchase (signed-in users only).</p>
    </Section>
  );
}
