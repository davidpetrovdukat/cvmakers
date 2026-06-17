'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import { useI18n } from '@/i18n/LocaleProvider';
import type { Locale } from '@/i18n/config';

const STEPS = {
  en: [
    { title: 'Create profile', desc: 'Add your details once: contacts, links, skills.' },
    { title: 'Pick a template', desc: 'Choose a formal, universal or creative layout.' },
    { title: 'Add experience', desc: 'Summarize roles and achievements with guidance.' },
    { title: 'Export & share', desc: 'Export PDF or DOCX and send it confidently.' },
  ],
  tr: [
    { title: 'Profil oluştur', desc: 'İletişim bilgilerinizi, bağlantılarınızı ve yetkinliklerinizi bir kez ekleyin.' },
    { title: 'Şablon seç', desc: 'Resmi, evrensel veya yaratıcı bir düzen seçin.' },
    { title: 'Deneyim ekle', desc: 'Rollerinizi ve başarılarınızı yönlendirmelerle özetleyin.' },
    { title: 'Dışa aktar ve paylaş', desc: 'PDF veya DOCX olarak dışa aktarın ve güvenle gönderin.' },
  ],
  ja: [
    { title: 'プロフィール作成', desc: '連絡先、リンク、スキルを一度だけ追加します。' },
    { title: 'テンプレートを選択', desc: 'フォーマル、ユニバーサル、クリエイティブのレイアウトからお選びください。' },
    { title: '経験を追加', desc: 'ガイダンスに沿って役割と実績をまとめます。' },
    { title: 'エクスポートと共有', desc: 'PDFまたはDOCXでエクスポートし、自信を持って送付できます。' },
  ],
} as const;

const SECTION_COPY: Record<Locale, { heading: string; subheading: string; stepLabel: string }> = {
  en: { heading: 'How it works', subheading: '4 simple steps from profile to export.', stepLabel: 'Step' },
  tr: { heading: 'Nasıl çalışır', subheading: 'Profilden dışa aktarıma 4 basit adım.', stepLabel: 'Adım' },
  ja: { heading: 'ご利用の流れ', subheading: 'プロフィール作成からエクスポートまで、簡単4ステップです。', stepLabel: 'ステップ' },
};

export default function HowItWorks() {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const steps = STEPS[locale];
  const sectionCopy = SECTION_COPY[locale];

  return (
    <Section id="how" className="py-12">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold">{sectionCopy.heading}</h2>
        <p className="mt-2 text-slate-600">{sectionCopy.subheading}</p>
      </motion.div>

      <div className="grid md:grid-cols-4 gap-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            whileHover={reduceMotion ? undefined : { y: -6, scale: 1.02, transition: { type: 'spring', stiffness: 260, damping: 22 } }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            transition={{ delay: reduceMotion ? 0 : index * 0.05, duration: 0.4 }}
            viewport={{ once: true }}
          >
            <Card className="h-full" padding="md">
              <div className="text-xs text-slate-500">{sectionCopy.stepLabel} {index + 1}</div>
              <div className="mt-1 font-semibold">{step.title}</div>
              <div className="mt-1 text-sm text-slate-700">{step.desc}</div>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
