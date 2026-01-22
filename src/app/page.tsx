'use client';

import { motion } from 'framer-motion';
import Hero from '@/components/sections/Hero';
import TrustStats from '@/components/sections/TrustStats';
import Pricing from '@/components/sections/Pricing';
import WhyUs from '@/components/sections/WhyUs';
import HowItWorks from '@/components/sections/HowItWorks';
import TemplatesShowcase from '@/components/sections/TemplatesShowcase';
import CTAVisual from '@/components/sections/CTAVisual';

export default function HomePage() {
  return (
    <motion.div 
      className="bg-[#F8FAFC] min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <main>
        {/* 1. Hero */}
        <Hero />
        {/* 2. Trust & Stats */}
        <TrustStats />
        {/* 3. Why choose us */}
        <WhyUs />
        {/* 4. How it works */}
        <HowItWorks />
        {/* 5. Token top-up plans */}
        <Pricing />
        {/* 6. Resume & CV templates */}
        <TemplatesShowcase />
        {/* 7. CTA block */}
        <CTAVisual />
        {/* Footer — already rendered by layout */}
      </main>
    </motion.div>
  );
}
