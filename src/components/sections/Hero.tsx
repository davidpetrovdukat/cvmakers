'use client';

import { motion } from 'framer-motion';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import { THEME } from '@/lib/theme';
import { useSession } from 'next-auth/react';
import { useI18n } from '@/i18n/LocaleProvider';
import { localizePath } from '@/i18n/config';

const HERO_COPY = {
  en: {
    phrases: ['hired faster', 'a remote job', 'paid more', 'promoted'],
    title1: 'Create a perfect CV.',
    title2: 'Our builder gets you',
    body: 'Pick a template, add your experience - get a clean, ATS-friendly CV in minutes. Export to PDF or DOCX.',
    cta: 'Create my CV',
    imageAlt: 'Person creating a CV on a laptop',
  },
  tr: {
    phrases: ['daha hızlı işe alınmaya', 'uzaktan çalışılan bir işe', 'daha yüksek gelire', 'terfiye'],
    title1: 'Kusursuz bir CV oluşturun.',
    title2: 'Oluşturucumuz sizi yaklaştırır:',
    body: 'Bir şablon seçin, deneyiminizi ekleyin ve dakikalar içinde temiz, ATS uyumlu bir CV alın. PDF veya DOCX olarak dışa aktarın.',
    cta: 'CV oluştur',
    imageAlt: 'Dizüstü bilgisayarda CV oluşturan kişi',
  },
} as const;

export default function Hero() {
  const { locale } = useI18n();
  const copy = HERO_COPY[locale];
  const { status } = useSession();
  const signedIn = status === 'authenticated';
  const primaryHref = signedIn ? localizePath('/create-cv', locale) : `${localizePath('/auth/signin', locale)}?mode=login`;
  const headlinePhrase = copy.phrases[0];

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-900/15 via-slate-50/95 to-indigo-900/20" />
      <Section className="pt-12 pb-18 relative">
        <div className="grid md:grid-cols-2 items-center gap-10">
          <div className="max-w-xl">
            <motion.h1
              className={`text-4xl sm:text-5xl font-bold leading-[1.1] ${THEME.text}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <span className="block">{copy.title1}</span>
              <span className="block">{copy.title2}</span>
              <span className="block h-[1.1em] text-indigo-600">
                {headlinePhrase}
              </span>
            </motion.h1>

            <motion.p
              className={`mt-3 max-w-xl text-lg ${THEME.muted}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              {copy.body}
            </motion.p>

            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.8, ease: 'easeOut' }}
            >
              <Button href={primaryHref} size="lg" variant="primary" className="hover:animate-pulse">
                {copy.cta}
              </Button>
            </motion.div>
          </div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-black/10 shadow-2xl bg-white">
              <img
                src="/hero.webp"
                alt={copy.imageAlt}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent to-indigo-900/25" />
            </div>
          </motion.div>
        </div>
      </Section>
    </div>
  );
}
