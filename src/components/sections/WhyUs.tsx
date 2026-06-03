'use client';

import { motion } from 'framer-motion';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import { Zap, ShieldCheck, PenLine, Sparkles, Coins, Share2 } from 'lucide-react';
import { useI18n } from '@/i18n/LocaleProvider';

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
} as const;

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
        <h2 className="text-2xl sm:text-3xl font-bold">{locale === 'tr' ? 'Neden bizi seçmelisiniz' : 'Why choose us'}</h2>
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
