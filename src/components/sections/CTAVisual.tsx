'use client';

import { motion } from 'framer-motion';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import { useSession } from 'next-auth/react';
import { useLocale } from '@/i18n/LocaleProvider';
import { localizePath } from '@/i18n/config';

const COPY = {
  en: {
    heading: 'Ready to get hired faster?',
    body: 'Join thousands of professionals who boosted their career with CV Makers.',
    cta: 'Create my CV',
  },
  tr: {
    heading: 'Daha hızlı işe alınmaya hazır mısınız?',
    body: 'Kariyerini CV Makers ile güçlendiren binlerce profesyonele katılın.',
    cta: 'CV oluştur',
  },
  ja: {
    heading: 'より早く内定を獲得しませんか？',
    body: 'CV Makersでキャリアを強化した数千人のプロフェッショナルに参加してください。',
    cta: 'CVを作成する',
  },
} as const;

export default function CTAVisual() {
  const locale = useLocale();
  const copy = COPY[locale];
  const { status } = useSession();
  const signedIn = status === 'authenticated';
  const ctaHref = signedIn ? localizePath('/create-cv', locale) : `${localizePath('/auth/signin', locale)}?mode=login`;

  return (
    <div className="relative bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
      <Section className="py-16">
        <motion.div
          className="text-center max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] mb-4">
            {copy.heading}
          </h3>
          <p className="mt-4 text-lg sm:text-xl text-indigo-100 max-w-xl mx-auto">
            {copy.body}
          </p>
          <div className="mt-8">
            <Button href={ctaHref} size="lg" variant="primary" className="bg-white !text-black hover:bg-indigo-600 !hover:text-white">
              {copy.cta}
            </Button>
          </div>
        </motion.div>
      </Section>
    </div>
  );
}
