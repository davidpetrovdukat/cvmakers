"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Segmented from '@/components/ui/Segmented';
import { convertTokensToCurrency, formatCurrency as formatCurrencyLib, Currency, SERVICE_COSTS, CURRENCY_OPTIONS, isCurrency } from '@/lib/currency';
import { formatInteger } from '@/lib/format';
import { useLocale } from '@/i18n/LocaleProvider';
import { localizePath } from '@/i18n/config';

const TOKENS_PER_GBP = 100;
const MIN_TOP_UP = 0.01;

type ActionKey = 'draft' | 'pdf' | 'docx' | 'ai' | 'manager';

type ActionConfig = {
  id: ActionKey;
  label: string;
  description: string;
  tokens: number;
};

const ACTION_COSTS: Record<ActionKey, number> = {
  draft: SERVICE_COSTS.CREATE_DRAFT,
  pdf: SERVICE_COSTS.CREATE_DRAFT + SERVICE_COSTS.EXPORT_PDF,
  docx: SERVICE_COSTS.CREATE_DRAFT + SERVICE_COSTS.EXPORT_DOCX,
  ai: SERVICE_COSTS.AI_IMPROVE,
  manager: SERVICE_COSTS.PERSONAL_MANAGER,
};

const COPY = {
  en: {
    title: 'Token calculator',
    subtitle: 'Calculate tokens needed and see effective cost per document.',
    calculateTitle: 'Calculate tokens',
    calculateDescription: 'Adjust the number of actions you plan to run. Each action multiplies by its token cost.',
    quantity: 'Quantity',
    tokens: 'tokens',
    results: 'Results',
    totalTokens: 'Total tokens',
    estimatedCost: 'Estimated cost',
    atRate: 'at {amount} = 100 tokens',
    suggestedTopUp: 'Suggested top-up',
    goToTopUp: 'Go to top-up page',
    clear: 'Clear calculator',
    examplesTitle: 'Examples',
    faqTitle: 'Frequently Asked Questions',
    actions: {
      draft: {
        label: 'Create draft',
        description: 'Creates a draft CV/resume in your Dashboard.',
      },
      pdf: {
        label: 'Create & Export PDF',
        description: 'Instantly generates a ready-to-download PDF.',
      },
      docx: {
        label: 'Create & Export DOCX',
        description: 'Exports a DOCX version for further editing.',
      },
      ai: {
        label: 'Improve with AI',
        description: 'Refines wording, structure, and impact using AI.',
      },
      manager: {
        label: 'Send to personal manager',
        description: 'Specialist review with feedback in 3-6 hours.',
      },
    },
    faq: [
      {
        question: 'How does the calculator work?',
        answer: 'Pick the actions you need. The calculator totals the tokens and shows the equivalent cost. Other currencies are converted at current exchange rates.',
      },
      {
        question: 'Which actions can I estimate?',
        answer: `Create draft: ${SERVICE_COSTS.CREATE_DRAFT} tokens. Create & Export PDF: ${SERVICE_COSTS.CREATE_DRAFT + SERVICE_COSTS.EXPORT_PDF} tokens. Create & Export DOCX: ${SERVICE_COSTS.CREATE_DRAFT + SERVICE_COSTS.EXPORT_DOCX} tokens. Improve with AI: ${SERVICE_COSTS.AI_IMPROVE} tokens. Send to personal manager: ${SERVICE_COSTS.PERSONAL_MANAGER} tokens.`,
      },
      {
        question: 'How accurate is the estimate?',
        answer: 'It reflects current rates at the time of calculation. VAT/taxes are not included and will be added at checkout where applicable.',
      },
    ],
    examples: [
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
    ],
  },
  tr: {
    title: 'Token hesaplayıcı',
    subtitle: 'İhtiyacınız olan token miktarını hesaplayın ve belge başına etkin maliyeti görün.',
    calculateTitle: 'Tokenları hesaplayın',
    calculateDescription: 'Planladığınız işlem adetlerini ayarlayın. Her işlem kendi token maliyetiyle çarpılır.',
    quantity: 'Adet',
    tokens: 'token',
    results: 'Sonuçlar',
    totalTokens: 'Toplam token',
    estimatedCost: 'Tahmini maliyet',
    atRate: '{amount} = 100 token üzerinden',
    suggestedTopUp: 'Önerilen yükleme',
    goToTopUp: 'Token yükleme sayfasına git',
    clear: 'Hesaplayıcıyı temizle',
    examplesTitle: 'Örnekler',
    faqTitle: 'Sık sorulan sorular',
    actions: {
      draft: {
        label: 'Taslak oluştur',
        description: 'Dashboard içinde bir CV/özgeçmiş taslağı oluşturur.',
      },
      pdf: {
        label: 'Oluştur ve PDF dışa aktar',
        description: 'İndirmeye hazır PDF dosyasını anında oluşturur.',
      },
      docx: {
        label: 'Oluştur ve DOCX dışa aktar',
        description: 'Daha sonra düzenlenebilir DOCX sürümünü dışa aktarır.',
      },
      ai: {
        label: 'Yapay zekâ ile iyileştir',
        description: 'İfadeyi, yapıyı ve etkiyi yapay zekâ ile iyileştirir.',
      },
      manager: {
        label: 'Kişisel yöneticiye gönder',
        description: '3-6 saat içinde geri bildirim içeren uzman incelemesi.',
      },
    },
    faq: [
      {
        question: 'Hesaplayıcı nasıl çalışır?',
        answer: 'İhtiyacınız olan işlemleri seçin. Hesaplayıcı toplam token miktarını ve karşılık gelen maliyeti gösterir. Diğer para birimleri güncel döviz kurlarına göre dönüştürülür.',
      },
      {
        question: 'Hangi işlemleri tahmin edebilirim?',
        answer: `Taslak oluştur: ${SERVICE_COSTS.CREATE_DRAFT} token. PDF oluştur ve dışa aktar: ${SERVICE_COSTS.CREATE_DRAFT + SERVICE_COSTS.EXPORT_PDF} token. DOCX oluştur ve dışa aktar: ${SERVICE_COSTS.CREATE_DRAFT + SERVICE_COSTS.EXPORT_DOCX} token. Yapay zekâ ile iyileştir: ${SERVICE_COSTS.AI_IMPROVE} token. Kişisel yöneticiye gönder: ${SERVICE_COSTS.PERSONAL_MANAGER} token.`,
      },
      {
        question: 'Tahmin ne kadar doğru?',
        answer: 'Hesaplama anındaki güncel oranları yansıtır. KDV/vergiler dahil değildir ve geçerli olduğu durumlarda ödeme sırasında eklenir.',
      },
    ],
    examples: [
      {
        title: 'Parlatılmış bir CV',
        description: 'Oluşturma + yapay zekâ düzenlemesi + PDF dışa aktarma.',
        actions: { draft: 1, ai: 1, pdf: 1 },
      },
      {
        title: 'İş arama hafta sonu',
        description: 'Yapay zekâ ve PDF dışa aktarma ile iki özelleştirilmiş özgeçmiş.',
        actions: { draft: 2, ai: 2, pdf: 2 },
      },
      {
        title: 'Yönetici destekli yenileme',
        description: 'Oluşturma, yapay zekâ ile iyileştirme ve kişisel yöneticiye gönderme.',
        actions: { draft: 1, ai: 1, manager: 1 },
      },
      {
        title: 'Ekip yenilemesi',
        description: 'Küçük bir ekip için beş taslak ve dört dışa aktarım.',
        actions: { draft: 5, pdf: 4 },
      },
    ],
  },
} as const;

export default function TokenCalculatorPage() {
  const locale = useLocale();
  const copy = COPY[locale];
  const bcRef = useRef<BroadcastChannel | null>(null);
  const [currency, setCurrency] = useState<Currency>('GBP');
  const actions = useMemo<ActionConfig[]>(
    () =>
      (Object.keys(ACTION_COSTS) as ActionKey[]).map((id) => ({
        id,
        label: copy.actions[id].label,
        description: copy.actions[id].description,
        tokens: ACTION_COSTS[id],
      })),
    [copy],
  );
  const [counts, setCounts] = useState<Record<ActionKey, number>>(() =>
    (Object.keys(ACTION_COSTS) as ActionKey[]).reduce((acc, action) => {
      acc[action] = 0;
      return acc;
    }, {} as Record<ActionKey, number>),
  );

  useEffect(() => {
    try {
      bcRef.current = new BroadcastChannel('app-events');
      bcRef.current.onmessage = (event: MessageEvent) => {
        const data: any = event.data;
        if (data?.type === 'currency-updated' && isCurrency(data.currency)) {
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
    return actions.reduce((sum, action) => sum + counts[action.id] * action.tokens, 0);
  }, [actions, counts]);

  const estimatedCost = convertTokensToCurrency(totalTokens, currency);
  const recommendedTopUp = Math.max(MIN_TOP_UP, Math.ceil(estimatedCost * 100) / 100);
  const tokensPerUnitLabel = formatCurrencyLib(convertTokensToCurrency(TOKENS_PER_GBP, currency), currency);

  const handleCountChange = (action: ActionKey, value: string) => {
    const parsed = Math.max(0, Math.floor(Number(value) || 0));
    setCounts((prev) => ({ ...prev, [action]: parsed }));
  };

  const applyExample = (exampleActions: Partial<Record<ActionKey, number>>) => {
    setCounts((prev) => {
      const next = { ...prev };
      actions.forEach((action) => {
        next[action.id] = exampleActions[action.id] ?? 0;
      });
      return next;
    });
  };

  const resetCounts = () => {
    setCounts((Object.keys(ACTION_COSTS) as ActionKey[]).reduce((acc, action) => {
      acc[action] = 0;
      return acc;
    }, {} as Record<ActionKey, number>));
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">{copy.title}</h1>
          <p className="mt-2 text-slate-600">{copy.subtitle}</p>
          <div className="mt-6 flex justify-center">
            <Segmented
              options={CURRENCY_OPTIONS}
              value={currency}
              onChange={(value) => setCurrency(value as Currency)}
            />
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900">{copy.calculateTitle}</h2>
            <p className="mt-1 text-sm text-slate-600">{copy.calculateDescription}</p>
            <div className="mt-6 space-y-4">
              {actions.map((action) => (
                <div key={action.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-base font-semibold text-slate-900">{action.label}</div>
                      <p className="text-sm text-slate-600">{action.description}</p>
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      <div className="font-semibold text-slate-900">{action.tokens} {copy.tokens}</div>
                      <div>{formatCurrencyLib(action.tokens / TOKENS_PER_GBP, currency)}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <label className="text-sm text-slate-600">{copy.quantity}</label>
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
            <h2 className="text-lg font-semibold text-slate-900">{copy.results}</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span>{copy.totalTokens}</span>
                <span className="text-base font-semibold text-slate-900">{formatInteger(totalTokens)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{copy.estimatedCost}</span>
                <span className="text-base font-semibold text-slate-900">
                  {formatCurrencyLib(estimatedCost, currency)} <span className="text-xs text-slate-500">({copy.atRate.replace('{amount}', tokensPerUnitLabel)})</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{copy.suggestedTopUp}</span>
                <span className="text-base font-semibold text-emerald-600">{formatCurrencyLib(recommendedTopUp, currency)}</span>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <Button href={localizePath('/pricing', locale)} size="lg" onClick={() => {
                if (typeof window !== 'undefined') {
                  // @ts-ignore
                  window.gtag?.('event', 'calc_go_to_pricing', {
                    currency,
                    total_tokens: totalTokens,
                    estimated_cost: estimatedCost,
                  });
                }
              }}>
                {copy.goToTopUp}
              </Button>
              <Button variant="outline" onClick={resetCounts}>
                {copy.clear}
              </Button>
            </div>
          </Card>
        </div>

        <section className="mt-12">
          <h3 className="text-xl font-semibold text-slate-900 mb-6 text-center">{copy.examplesTitle}</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {copy.examples.map((example) => {
              const exampleActions = example.actions as Partial<Record<ActionKey, number>>;
              const exampleTokens = actions.reduce((sum, action) => sum + (exampleActions[action.id] ?? 0) * action.tokens, 0);
              const exampleCost = convertTokensToCurrency(exampleTokens, currency);
              return (
                <motion.div
                  key={example.title}
                  className="cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-400 transition"
                  whileHover={{ y: -4 }}
                  onClick={() => applyExample(exampleActions)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-base font-semibold text-slate-900">{example.title}</div>
                      <p className="text-sm text-slate-600">{example.description}</p>
                    </div>
                    <div className="text-right text-sm text-slate-600">
                      <div className="font-semibold text-slate-900">{formatInteger(exampleTokens)} {copy.tokens}</div>
                      <div>{formatCurrencyLib(exampleCost, currency)}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <h3 className="text-xl font-semibold text-slate-900 mb-6 text-center">{copy.faqTitle}</h3>
          <div className="space-y-4">
            {copy.faq.map((item, index) => (
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
