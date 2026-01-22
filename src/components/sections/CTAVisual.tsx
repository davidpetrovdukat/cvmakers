'use client';

import { motion } from 'framer-motion';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import { useSession } from 'next-auth/react';

export default function CTAVisual() {
  const { status } = useSession();
  const signedIn = status === 'authenticated';
  const ctaHref = signedIn ? '/create-cv' : '/auth/signin?mode=login';

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
            Ready to get hired faster?
          </h3>
          <p className="mt-4 text-lg sm:text-xl text-indigo-100 max-w-xl mx-auto">
            Join thousands of professionals who boosted their career with CV Makers.
          </p>
          <div className="mt-8">
            <Button href={ctaHref} size="lg" variant="primary" className="bg-white !text-black hover:bg-indigo-600 !hover:text-white">
              Create my CV
            </Button>
          </div>
        </motion.div>
      </Section>
    </div>
  );
}
