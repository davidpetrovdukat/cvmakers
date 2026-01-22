'use client';

import { motion } from 'framer-motion';
import Section from '@/components/layout/Section';
import { Star } from 'lucide-react';

export default function TrustStats() {
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
          Trusted by <span className="font-semibold text-slate-900">16,000+</span> job seekers. Rated{' '}
          <span className="font-semibold text-slate-900">4.9/5</span> based on user reviews.
        </p>
      </motion.div>
    </Section>
  );
}
