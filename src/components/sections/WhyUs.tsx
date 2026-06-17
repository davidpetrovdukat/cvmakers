'use client';

import { motion } from 'framer-motion';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import { Zap, ShieldCheck, PenLine, Sparkles, Coins, Share2 } from 'lucide-react';
import { useI18n } from '@/i18n/LocaleProvider';
import type { Locale } from '@/i18n/config';

const FEATURES = {
  en: [
    {
      icon: Zap,
      title: 'Resume in 10 minutes',
      desc: 'Build a professional document in a few clicks - clear structure and strong wording.',
    },
    {
      icon: ShieldCheck,
      title: 'ATS-friendly templates',
      desc: 'Layouts designed to pass applicant tracking systems and please recruiters.',
    },
    {
      icon: PenLine,
      title: 'Pre-written content',
      desc: 'Curated phrases and bullet points for popular roles.',
    },
    {
      icon: Sparkles,
      title: 'Subtle guidance',
      badge: 'AI-assisted',
      desc: 'Smart suggestions turn notes into clear bullets and summaries.',
    },
    {
      icon: Coins,
      title: 'Pay only for what you use',
      desc: 'Tokens instead of a subscription. No hidden fees.',
    },
    {
      icon: Share2,
      title: 'Export & share',
      desc: 'PDF/DOCX and a shareable link - send your resume right away.',
    },
  ],
  tr: [
    {
      icon: Zap,
      title: '10 dakikada özgeçmiş',
      desc: 'Birkaç tıklamayla profesyonel bir belge oluşturun: net yapı ve güçlü ifade.',
    },
    {
      icon: ShieldCheck,
      title: 'ATS uyumlu şablonlar',
      desc: 'Aday takip sistemlerinden geçmek ve işe alım uzmanlarına hitap etmek için tasarlanmış düzenler.',
    },
    {
      icon: PenLine,
      title: 'Hazır yazılmış içerik',
      desc: 'Popüler roller için seçilmiş ifadeler ve madde önerileri.',
    },
    {
      icon: Sparkles,
      title: 'Akıllı yönlendirme',
      badge: 'Yapay zekâ destekli',
      desc: 'Akıllı öneriler notlarınızı net maddelere ve özetlere dönüştürür.',
    },
    {
      icon: Coins,
      title: 'Yalnızca kullandığınız kadar ödeyin',
      desc: 'Abonelik yerine token kullanın. Gizli ücret yok.',
    },
    {
      icon: Share2,
      title: 'Dışa aktarın ve paylaşın',
      desc: 'PDF/DOCX ve paylaşılabilir bağlantı ile özgeçmişinizi hemen gönderin.',
    },
  ],
  ja: [
    {
      icon: Zap,
      title: '10分で職務経歴書を作成',
      desc: '数クリックでプロフェッショナルな書類を作成できます。明確な構成と説得力のある表現です。',
    },
    {
      icon: ShieldCheck,
      title: 'ATS対応テンプレート',
      desc: '応募者追跡システムを通過し、採用担当者に好印象を与えるレイアウトです。',
    },
    {
      icon: PenLine,
      title: '事前作成済みコンテンツ',
      desc: '人気の職種向けに厳選されたフレーズと箇条書きです。',
    },
    {
      icon: Sparkles,
      title: 'さりげないガイダンス',
      badge: 'AI支援',
      desc: 'スマートな提案がメモを明確な箇条書きと要約に変換します。',
    },
    {
      icon: Coins,
      title: '使った分だけお支払い',
      desc: 'サブスクリプションの代わりにトークンを使用します。隠れた費用はありません。',
    },
    {
      icon: Share2,
      title: 'エクスポートと共有',
      desc: 'PDF/DOCXと共有可能なリンクで、職務経歴書をすぐに送れます。',
    },
  ],
} as const;

const HEADING: Record<Locale, string> = {
  en: 'Why choose us',
  tr: 'Neden bizi seçmelisiniz',
  ja: '私たちを選ぶ理由',
};

export default function WhyUs() {
  const { locale } = useI18n();
  const features = FEATURES[locale];

  return (
    <Section id="why-us" className="py-12">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold">{HEADING[locale]}</h2>
      </motion.div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.45 }}
              viewport={{ once: true }}
            >
              <Card className="relative overflow-hidden transition-all duration-200 hover:-translate-y-[2px] hover:shadow-md" padding="md">
                <div className="flex items-center gap-2">
                  <Icon size={20} className="opacity-80 text-[#0F172A]" aria-hidden="true" />
                  <h3 className="font-semibold text-lg">
                    {feature.title}
                    {'badge' in feature && feature.badge && (
                      <sup className="ml-2 align-super text-[10px] px-1.5 py-0.5 rounded-full bg-[#FB7185]/15 text-[#FB7185] border border-[#FB7185]/30">
                        {feature.badge}
                      </sup>
                    )}
                  </h3>
                </div>
                <p className="mt-2 text-sm text-slate-700">{feature.desc}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}
