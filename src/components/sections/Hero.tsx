'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import { THEME } from '@/lib/theme';
import { useSession } from 'next-auth/react';

const PHRASES = ['hired faster', 'a remote job', 'paid more', 'promoted'];

type Phase = 'typing' | 'pausing' | 'deleting';

export default function Hero() {
  const { status } = useSession();
  const signedIn = status === 'authenticated';
  const primaryHref = signedIn ? '/create-cv' : '/auth/signin?mode=login';

  // Typewriter state
  const [index, setIndex] = useState(0); // which phrase
  const [subIndex, setSubIndex] = useState(0); // how many chars
  const [phase, setPhase] = useState<Phase>('typing');
  const [blink, setBlink] = useState(true);
  const current = PHRASES[index % PHRASES.length];

  // Caret blink (slower, smoother)
  useEffect(() => {
    const t = setInterval(() => setBlink((b) => !b), 650);
    return () => clearInterval(t);
  }, []);

  // Typing/Deleting loop
  useEffect(() => {
    const TYPING_SPEED = 85; // slower typing
    const DELETING_SPEED = 55; // slower deleting
    const PAUSE_MS = 3500; // keep visible for 3.5s

    if (phase === 'typing') {
      if (subIndex < current.length) {
        const t = setTimeout(() => setSubIndex(subIndex + 1), TYPING_SPEED);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setPhase('deleting'), PAUSE_MS);
        return () => clearTimeout(t);
      }
    }

    if (phase === 'deleting') {
      if (subIndex > 0) {
        const t = setTimeout(() => setSubIndex(subIndex - 1), DELETING_SPEED);
        return () => clearTimeout(t);
      } else {
        setPhase('typing');
        setIndex((i) => (i + 1) % PHRASES.length);
      }
    }
  }, [phase, subIndex, current.length]);

  useEffect(() => {
    // When current phrase changes, restart typing
    setSubIndex(0);
    setPhase('typing');
  }, [index]);

  return (
    <div className="relative overflow-hidden">
      {/* Left-to-right gradient blending toward image tone (stronger) */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-900/15 via-slate-50/95 to-indigo-900/20" />
      <Section className="pt-12 pb-18 relative">
        <div className="grid md:grid-cols-2 items-center gap-10">
          {/* Left: Copy */}
          <div className="max-w-xl">
            <motion.h1
              className={`text-4xl sm:text-5xl font-bold leading-[1.1] ${THEME.text}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <span className="block">Create a perfect CV.</span>
              <span className="block">Our builder gets you</span>
              <span className="block h-[1.1em] text-indigo-600">
                {current.slice(0, subIndex)}
                <span className={`inline-block w-[1ch] ${blink ? 'opacity-100' : 'opacity-0'}`}>|</span>
              </span>
            </motion.h1>

            <motion.p
              className={`mt-3 max-w-xl text-lg ${THEME.muted}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              Pick a template, add your experience - get a clean, ATS-friendly CV in minutes. Export to PDF or DOCX.
            </motion.p>

            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.8, ease: 'easeOut' }}
            >
              <Button href={primaryHref} size="lg" variant="primary" className="hover:animate-pulse">
                Create my CV
              </Button>
            </motion.div>
          </div>

          {/* Right: Visual */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-black/10 shadow-2xl bg-white">
              <img
                src="/hero.webp"
                alt="Person creating a CV on a laptop"
                className="h-full w-full object-cover"
                loading="lazy"
              />
              {/* stronger soft gradient overlay from image side */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent to-indigo-900/25" />
            </div>
          </motion.div>
        </div>
      </Section>
    </div>
  );
}
