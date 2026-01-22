'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import Section from '@/components/layout/Section';
import { Files } from 'lucide-react';

function formatRu(n: number) {
  try {
    // Use NBSP group separators (ru-RU), then replace with normal spaces for visual consistency
    return new Intl.NumberFormat('ru-RU').format(Math.max(0, Math.floor(n))).replace(/\u00A0/g, ' ');
  } catch {
    return String(Math.max(0, Math.floor(n)));
  }
}

export default function ResumesCounter() {
  const [count, setCount] = useState<number>(16356);
  const mv = useMotionValue(0);
  const animRef = useRef<ReturnType<typeof animate> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animate helper
  const animateTo = (target: number, duration = 0.8) => {
    try { animRef.current?.stop(); } catch {}
    animRef.current = animate(mv, target, { duration, ease: 'easeOut', onUpdate: (v) => setCount(Math.round(v)) });
  };

  // Fetch initial value once
  useEffect(() => {
    let cancelled = false;
    fetch('/api/metrics/resumes', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const initial = typeof data?.count === 'number' ? data.count : 16356;
        mv.set(Math.max(0, Math.floor(Math.max(0, initial - 50))));
        animateTo(initial, 0.9);
        setCount(initial);
      })
      .catch(() => {
        mv.set(0);
        animateTo(16356, 0.9);
        setCount(16356);
      });
    return () => { cancelled = true; try { animRef.current?.stop(); } catch {} };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Periodic increment
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const inc = 1 + Math.floor(Math.random() * 5);
      setCount((prev) => {
        const next = prev + inc;
        animateTo(next, 0.6);
        try {
          fetch('/api/metrics/resumes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ increment: inc }),
          }).catch(() => {});
        } catch {}
        return next;
      });
    }, 20000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Section className="pt-4 pb-2">
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
      >
        <div
          className="mx-auto w-full max-w-3xl rounded-2xl border border-indigo-100 bg-indigo-50/90 text-slate-900 px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-center gap-3 text-center"
          aria-live="polite"
        >
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-white border border-indigo-100 text-indigo-500">
            <Files size={20} aria-hidden="true" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl sm:text-4xl font-bold tracking-tight">
              {formatRu(count)}
            </div>
            <div className="text-lg sm:text-xl text-slate-800">resumes and CVs created this week</div>
          </div>
        </div>
      </motion.div>
    </Section>
  );
}
