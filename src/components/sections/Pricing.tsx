'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import { PRICING_PLANS } from '@/lib/data';
import PlanCard from '@/components/pricing/PlanCard';
import CustomPlanCard from '@/components/pricing/CustomPlanCard';
import { Currency, getBundlePrice, isCurrency, SERVICE_COSTS } from '@/lib/currency';
import { FileText, Download, FileDown, Sparkles, LayoutDashboard } from 'lucide-react';
import { useExchangeRates } from '@/lib/useExchangeRates';
import { useLocale } from '@/i18n/LocaleProvider';
import { localizePath } from '@/i18n/config';

const COPY = {
  en: {
    heading: 'Token top-up plans',
    subheading: 'Tokens are charged per action. No subscription or hidden fees.',
    costHeading: 'How much does an action cost?',
    tokenLabel: 'tokens',
    tokenUnit: 'Tokens',
    refundNote: 'Tokens never expire. Refunds for exports are not provided.',
    depositNote: 'Tokens deposit after purchase for signed-in users.',
    popular: 'POPULAR',
    termsLabel: 'I have read and agree to the',
    termsLinkLabel: 'Terms and Conditions',
    termsHref: '/terms',
    plans: {
      'plan-starter': {
        name: 'Quick Start',
        points: ['Manual token top-up', 'No subscription', 'Preview included'],
        cta: 'Buy Tokens',
      },
      'plan-pro': {
        name: 'Job Hunter',
        points: ['Manual token top-up', 'Branding options', 'Priority support'],
        cta: 'Buy Tokens',
      },
      'plan-business': {
        name: 'Career Boost',
        points: ['Manual token top-up', 'Team access', 'Integrations roadmap'],
        cta: 'Buy Tokens',
      },
      'plan-annual': {
        name: 'Annual Pro',
        points: ['50,000 tokens for the year', 'Best value per token', 'Priority support'],
        cta: 'Buy Now',
      },
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
    actions: {
      createCv: 'Create CV',
      createResume: 'Create Resume',
      exportPdf: 'Export PDF',
      exportDocx: 'Export DOCX',
      aiAssist: 'AI Assist',
      manager: 'Manager',
    },
  },
  tr: {
    heading: 'Token yükleme planları',
    subheading: 'Tokenlar işlem başına kullanılır. Abonelik veya gizli ücret yoktur.',
    costHeading: 'Bir işlem kaç token tutar?',
    tokenLabel: 'token',
    tokenUnit: 'Token',
    refundNote: 'Tokenların süresi dolmaz. Dışa aktarımlar için iade sağlanmaz.',
    depositNote: 'Satın alma sonrası tokenlar oturum açmış kullanıcı hesabına eklenir.',
    popular: 'POPÜLER',
    termsLabel: 'Okudum ve kabul ediyorum:',
    termsLinkLabel: 'Şartlar ve Koşullar',
    termsHref: '/terms',
    plans: {
      'plan-starter': {
        name: 'Hızlı Başlangıç',
        points: ['Manuel token yükleme', 'Abonelik yok', 'Önizleme dahil'],
        cta: 'Token Satın Al',
      },
      'plan-pro': {
        name: 'İş Arayan',
        points: ['Manuel token yükleme', 'Markalama seçenekleri', 'Öncelikli destek'],
        cta: 'Token Satın Al',
      },
      'plan-business': {
        name: 'Kariyer Desteği',
        points: ['Manuel token yükleme', 'Ekip erişimi', 'Entegrasyon yol haritası'],
        cta: 'Token Satın Al',
      },
      'plan-annual': {
        name: 'Yıllık Pro',
        points: ['Yıl için 50.000 token', 'Token başına en iyi değer', 'Öncelikli destek'],
        cta: 'Satın Al',
      },
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
    actions: {
      createCv: 'CV Oluştur',
      createResume: 'Özgeçmiş Oluştur',
      exportPdf: 'PDF Dışa Aktar',
      exportDocx: 'DOCX Dışa Aktar',
      aiAssist: 'Yapay Zekâ Desteği',
      manager: 'Yönetici',
    },
  },
} as const;

export default function Pricing() {
  const locale = useLocale();
  const copy = COPY[locale];
  const bcRef = useRef<BroadcastChannel | null>(null);
  const router = useRouter();
  const [currency, setCurrency] = useState<Currency>('GBP');
  const { snapshot: exchangeRates } = useExchangeRates();

  useEffect(() => {
    try {
      bcRef.current = new BroadcastChannel('app-events');
      bcRef.current.onmessage = (ev: MessageEvent) => {
        const data: any = (ev as any)?.data || {};
        if (data.type === 'currency-updated' && isCurrency(data.currency)) {
          setCurrency(data.currency);
          try {
            localStorage.setItem('currency', data.currency);
          } catch {}
        }
      };
    } catch {}

    try {
      const saved = localStorage.getItem('currency');
      if (isCurrency(saved)) setCurrency(saved);
    } catch {}

    return () => {
      try {
        bcRef.current?.close();
      } catch {}
    };
  }, []);

  const actionCosts = useMemo(
    () => [
      { icon: FileText, label: copy.actions.createCv, tokens: SERVICE_COSTS.CREATE_DRAFT },
      { icon: FileText, label: copy.actions.createResume, tokens: SERVICE_COSTS.CREATE_DRAFT },
      { icon: Download, label: copy.actions.exportPdf, tokens: SERVICE_COSTS.EXPORT_PDF },
      { icon: FileDown, label: copy.actions.exportDocx, tokens: SERVICE_COSTS.EXPORT_DOCX },
      { icon: Sparkles, label: copy.actions.aiAssist, tokens: SERVICE_COSTS.AI_IMPROVE },
      { icon: LayoutDashboard, label: copy.actions.manager, tokens: SERVICE_COSTS.PERSONAL_MANAGER },
    ],
    [copy],
  );

  const handleTopUpRequest = () => {
    router.push(localizePath('/pricing', locale));
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
        <h2 className="text-2xl font-bold sm:text-3xl">{copy.heading}</h2>
        <p className="mt-2 text-slate-600">{copy.subheading}</p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
        {PRICING_PLANS.map((plan) => {
          const localized = copy.plans[plan.id as keyof typeof copy.plans];
          return (
            <PlanCard
              key={plan.id}
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
              termsHref={localizePath(copy.termsHref, locale)}
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
          <CustomPlanCard
            currency={currency}
            exchangeRates={exchangeRates}
            labels={{ ...copy.custom, termsHref: localizePath(copy.custom.termsHref, locale) }}
            onRequest={handleTopUpRequest}
          />
        </motion.div>
      </div>

      <div className="mx-auto mt-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h3 className="mb-6 text-center text-lg font-semibold">{copy.costHeading}</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {actionCosts.map(({ icon: Icon, label, tokens }) => (
              <Card key={label} className="p-4 text-center transition-shadow hover:shadow-md" padding="sm">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                    <Icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="text-xs font-medium text-slate-700">{label}</div>
                  <div className="text-sm font-bold text-indigo-600">{tokens} {copy.tokenUnit}</div>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-4 text-center text-xs text-slate-500">{copy.refundNote}</div>
        </motion.div>
      </div>

      <p className="mt-4 text-center text-xs text-slate-500">{copy.depositNote}</p>
    </Section>
  );
}
