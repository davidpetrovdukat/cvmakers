"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Segmented from '@/components/ui/Segmented';
import { convertToTokens, convertTokensToCurrency, formatCurrency as formatCurrencyLib, Currency, SERVICE_COSTS } from '@/lib/currency';

const TOKENS_PER_GBP = 100;
const MIN_TOP_UP = 0.01;

type ActionKey = 'draft' | 'pdf' | 'docx' | 'ai' | 'manager';

type ActionConfig = {
  id: ActionKey;
  label: string;
  description: string;
  tokens: number;
};

const ACTIONS: ActionConfig[] = [
  {
    id: 'draft',
    label: 'Create draft',
    description: 'Creates a draft CV/resume in your Dashboard.',
    tokens: SERVICE_COSTS.CREATE_DRAFT,
  },
  {
    id: 'pdf',
    label: 'Create & Export PDF',
    description: 'Instantly generates a ready-to-download PDF.',
    tokens: SERVICE_COSTS.CREATE_DRAFT + SERVICE_COSTS.EXPORT_PDF,
  },
  {
    id: 'docx',
    label: 'Create & Export DOCX',
    description: 'Exports a DOCX version for further editing.',
    tokens: SERVICE_COSTS.CREATE_DRAFT + SERVICE_COSTS.EXPORT_DOCX,
  },
  {
    id: 'ai',
    label: 'Improve with AI',
    description: 'Refines wording, structure, and impact using AI.',
    tokens: SERVICE_COSTS.AI_IMPROVE,
  },
  {
    id: 'manager',
    label: 'Send to personal manager',
    description: 'Specialist review with feedback in 3–6 hours.',
    tokens: SERVICE_COSTS.PERSONAL_MANAGER,
  },
];

const FAQ_ITEMS = [
  {
    question: 'How does the calculator work?',
    answer: 'Pick the actions you need — the calculator totals the tokens and shows the GBP equivalent at £1.00 = 100 tokens. Other currencies are converted at current exchange rates.',
  },
  {
    question: 'Which actions can I estimate?',
    answer: `Create draft — ${SERVICE_COSTS.CREATE_DRAFT} tokens. Create & Export PDF — ${SERVICE_COSTS.CREATE_DRAFT + SERVICE_COSTS.EXPORT_PDF} tokens. Create & Export DOCX — ${SERVICE_COSTS.CREATE_DRAFT + SERVICE_COSTS.EXPORT_DOCX} tokens. Improve with AI — ${SERVICE_COSTS.AI_IMPROVE} tokens. Send to personal manager — ${SERVICE_COSTS.PERSONAL_MANAGER} tokens.`,
  },
  {
    question: 'How accurate is the estimate?',
    answer: 'It reflects current rates at the time of calculation. VAT/taxes are not included and will be added at checkout where applicable.',
  },
];

const EXAMPLES: Array<{
  title: string;
  description: string;
  actions: Partial<Record<ActionKey, number>>;
}> = [
  {
    title: 'One polished CV',
    description: 'Create + AI polish + PDF export.',
    actions: { draft: 1, ai: 1, pdf: 1 },
  },
  {
    title: 'Job hunt weekend',
    description: 'Two tailored resumes with AI and PDF exports.',
    actions: { draft: 2, ai: 2, pdf: 2 },
  },
  {
    title: 'Manager-assisted revamp',
    description: 'Create, AI improve, and send to personal manager.',
    actions: { draft: 1, ai: 1, manager: 1 },
  },
  {
    title: 'Full team refresh',
    description: 'Five drafts and four exports for a small team.',
    actions: { draft: 5, pdf: 4 },
  },
];



export default function TokenCalculatorPage() {
  const bcRef = useRef<BroadcastChannel | null>(null);
  const [currency, setCurrency] = useState<Currency>('GBP');
  const [counts, setCounts] = useState<Record<ActionKey, number>>(() =>
    ACTIONS.reduce((acc, action) => {
      acc[action.id] = 0;
      return acc;
    }, {} as Record<ActionKey, number>),
  );

  useEffect(() => {
    try {
      bcRef.current = new BroadcastChannel('app-events');
      bcRef.current.onmessage = (event: MessageEvent) => {
        const data: any = (event as MessageEvent).data;
        if (data?.type === 'currency-updated' && (data.currency === 'GBP' || data.currency === 'EUR' || data.currency === 'USD')) {
          setCurrency(data.currency);
        }
      };
    } catch {
      bcRef.current = null;
    }
    return () => {
      try {
        bcRef.current?.close();
      } catch {}
    };
  }, []);

  const totalTokens = useMemo(() => {
    return ACTIONS.reduce((sum, action) => sum + counts[action.id] * action.tokens, 0);
  }, [counts]);

  const estimatedCost = convertTokensToCurrency(totalTokens, currency);
  const recommendedTopUp = Math.max(MIN_TOP_UP, Math.ceil(estimatedCost * 100) / 100);
  const tokensPerUnitLabel = currency === 'GBP' ? '£1.00' : currency === 'EUR' ? '€1.15' : '$1.27';

  const handleCountChange = (action: ActionKey, value: string) => {
    const parsed = Math.max(0, Math.floor(Number(value) || 0));
    setCounts((prev) => ({ ...prev, [action]: parsed }));
  };

  const applyExample = (exampleActions: Partial<Record<ActionKey, number>>) => {
    setCounts((prev) => {
      const next = { ...prev };
      ACTIONS.forEach((action) => {
        next[action.id] = exampleActions[action.id] ?? 0;
      });
      return next;
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Token calculator</h1>
          <p className="mt-2 text-slate-600">Calculate tokens needed and see effective cost per document.</p>
          <div className="mt-6 flex justify-center">
            <Segmented
              options={[
                { label: 'GBP', value: 'GBP' },
                { label: 'EUR', value: 'EUR' },
                { label: 'USD', value: 'USD' },
              ]}
              value={currency}
              onChange={(value) => setCurrency(value as Currency)}
            />
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900">Calculate tokens</h2>
            <p className="mt-1 text-sm text-slate-600">Adjust the number of actions you plan to run. Each action multiplies by its token cost.</p>
            <div className="mt-6 space-y-4">
              {ACTIONS.map((action) => (
                <div key={action.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-base font-semibold text-slate-900">{action.label}</div>
                      <p className="text-sm text-slate-600">{action.description}</p>
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      <div className="font-semibold text-slate-900">{action.tokens} tokens</div>
                      <div>{formatCurrencyLib(action.tokens / TOKENS_PER_GBP, currency)}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <label className="text-sm text-slate-600">Quantity</label>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={counts[action.id].toString()}
                      onChange={(event) => handleCountChange(action.id, event.target.value)}
                      className="w-24"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-md border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Results</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span>Total tokens</span>
                <span className="text-base font-semibold text-slate-900">{totalTokens.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Estimated cost</span>
                <span className="text-base font-semibold text-slate-900">
                  {formatCurrencyLib(estimatedCost, currency)} <span className="text-xs text-slate-500">(at {tokensPerUnitLabel} = 100 tokens)</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Suggested top-up</span>
                <span className="text-base font-semibold text-emerald-600">{formatCurrencyLib(recommendedTopUp, currency)}</span>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <Button href="/pricing" size='lg' onClick={() => {
                if (typeof window !== 'undefined') {
                  // @ts-ignore
                  window.gtag?.('event', 'calc_go_to_pricing', {
                    currency,
                    total_tokens: totalTokens,
                    estimated_cost: estimatedCost,
                  });
                }
              }}>
                Go to top-up page
              </Button>
              <Button
                variant='outline'
                onClick={() => {
                  setCounts(ACTIONS.reduce((acc, action) => {
                    acc[action.id] = 0;
                    return acc;
                  }, {} as Record<ActionKey, number>));
                }}
              >
                Clear calculator
              </Button>
            </div>
          </Card>
        </div>

        <section className="mt-12">
          <h3 className="text-xl font-semibold text-slate-900 mb-6 text-center">Examples</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {EXAMPLES.map((example) => {
              const exampleTokens = ACTIONS.reduce((sum, action) => sum + (example.actions[action.id] ?? 0) * action.tokens, 0);
              const exampleCost = convertTokensToCurrency(exampleTokens, currency);
              return (
                <motion.div
                  key={example.title}
                  className="cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-400 transition"
                  whileHover={{ y: -4 }}
                  onClick={() => applyExample(example.actions)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-base font-semibold text-slate-900">{example.title}</div>
                      <p className="text-sm text-slate-600">{example.description}</p>
                    </div>
                    <div className="text-right text-sm text-slate-600">
                      <div className="font-semibold text-slate-900">{exampleTokens.toLocaleString()} tokens</div>
                      <div>{formatCurrencyLib(exampleCost, currency)}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <h3 className="text-xl font-semibold text-slate-900 mb-6 text-center">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <motion.div
                key={item.question}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Card className="p-5">
                  <h4 className="font-semibold text-slate-900 mb-2">{item.question}</h4>
                  <p className="text-sm text-slate-600">{item.answer}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
