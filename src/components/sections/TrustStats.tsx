'use client';

import { motion } from 'framer-motion';
import Section from '@/components/layout/Section';
import { Star } from 'lucide-react';
import { useI18n } from '@/i18n/LocaleProvider';
import { Locale } from '@/i18n/config';

const STATS_COPY: Record<Locale, { prefix: string; count: string; middle: string; rating: string; suffix: string }> = {
  en: {
    prefix: 'Trusted by',
    count: '16,000+',
    middle: 'job seekers. Rated',
    rating: '4.9/5',
    suffix: 'based on user reviews.',
  },
  tr: {
    prefix: '',
    count: '16.000+',
    middle: 'iş arayan tarafından güveniliyor. Kullanıcı yorumlarına göre',
    rating: '4,9/5',
    suffix: 'puan aldı.',
  },
  ja: {
    prefix: '',
    count: '16,000人以上',
    middle: 'の求職者にご利用いただいています。ユーザーレビューによる評価は',
    rating: '4.9/5',
    suffix: 'です。',
  },
};

export default function TrustStats() {
  const { locale } = useI18n();
  const copy = STATS_COPY[locale];

  return (
    <Section className="py-8">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="flex items-center justify-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="w-5 h-5 fill-yellow-400 text-yellow-400"
              aria-hidden="true"
            />
          ))}
        </div>
        <p className="text-base sm:text-lg text-slate-600">
          {copy.prefix && <>{copy.prefix} </>}
          <span className="font-semibold text-slate-900">{copy.count}</span>{' '}
          {copy.middle}{' '}
          <span className="font-semibold text-slate-900">{copy.rating}</span>{' '}
          {copy.suffix}
        </p>
      </motion.div>
    </Section>
  );
}
