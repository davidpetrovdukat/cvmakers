'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import PolicyTOC from './PolicyTOC';
import PolicyMeta from './PolicyMeta';
import PolicyContent from './PolicyContent';
import { Heading, PolicySection, Region } from '@/types/policy';

interface PolicyPageProps {
  title: string;
  sections: PolicySection[];
  effectiveDate?: string;
  lastUpdated?: string;
  version?: string;
  helpEmail?: string;
  showRegionToggle?: boolean;
}

export default function PolicyPage({
  title,
  sections,
  effectiveDate = '1 Sep 2025',
  lastUpdated = '2 Sep 2025',
  version = 'v1.0.0',
  helpEmail = 'info@mail.com',
  showRegionToggle = true,
}: PolicyPageProps) {
  const [region, setRegion] = useState<Region>('UK');
  const [active, setActive] = useState<string | null>(sections?.[0]?.id ?? null);
  const contentRef = useRef<HTMLDivElement>(null);

  const headings: Heading[] = useMemo(
    () => (sections || []).map((s) => ({ id: s.id, title: s.title })),
    [sections]
  );

  useEffect(() => {
    if (!contentRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top || 0) - (b.boundingClientRect.top || 0));
        if (visible[0]) setActive(visible[0].target.id);
      },
      { root: null, rootMargin: '0px 0px -70% 0px', threshold: [0, 1] }
    );
    const nodes = contentRef.current.querySelectorAll('section[id]');
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [sections]);

  const lawText = region === 'UK' ? 'England & Wales' : 'Your EU Member State (default: Republic of Ireland)';

  const onJump = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActive(id);
  };

  return (
    <main className="bg-slate-50 min-h-screen">
      <Section className="py-10">
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <span className="rounded-full bg-emerald-100 text-emerald-600 px-3 py-1 text-xs font-semibold">Updated</span>
            <span className="rounded-full bg-indigo-100 text-indigo-600 px-3 py-1 text-xs font-semibold">Effective 1 Sep 2025</span>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900">{title}</h1>
          <p className="max-w-2xl mx-auto text-slate-600 text-lg">
            These Terms & Conditions explain how you can use CV Makers, purchase token packages,
            and receive document generation services from WORKING AGENT LTD.
          </p>
          <motion.div 
            className="mt-6 flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {!showRegionToggle ? null : (
              <div className="inline-flex rounded-xl border border-black/10 bg-white p-1">
                {(['UK', 'EU'] as Region[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRegion(r)}
                    className={`px-3 py-1.5 text-sm rounded-lg ${
                      region === r ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
            <Button variant="outline" onClick={() => window.print()}>Print</Button>
          </motion.div>
        </motion.div>

        <div className="mt-10 grid lg:grid-cols-[260px,1fr,300px] gap-6 items-start">
          <motion.div 
            className="hidden lg:block"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Card className="p-5 sticky top-24" padding="md">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">On this page</h3>
              <PolicyTOC headings={headings} current={active} onJump={onJump} />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <PolicyMeta
              effectiveDate={effectiveDate}
              lastUpdated={lastUpdated}
              version={version}
              lawText={lawText}
            />
            <Card className="mt-6 p-6" padding="md">
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg">📄</div>
                  <div>
                    <div className="font-semibold text-slate-900">Scope</div>
                    <div>Applies to all users of cv-makers.co.uk worldwide.</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg">🪙</div>
                  <div>
                    <div className="font-semibold text-slate-900">Tokens</div>
                    <div>Credits required to create, export, or enhance CV/resume files.</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-lg">🔐</div>
                  <div>
                    <div className="font-semibold text-slate-900">Data</div>
                    <div>Your materials remain yours; we process them securely.</div>
                  </div>
                </div>
              </div>
            </Card>
            <div className="mt-6" />
            <div ref={contentRef as any} className="space-y-10">
              <PolicyContent sections={sections} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                viewport={{ once: true }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
              >
                <Card className="p-6" padding="md">
                  <h3 className="text-base font-semibold">Need help?</h3>
                  <p className="text-slate-600 text-sm mt-1">
                    Email <a className="underline" href={`mailto:${helpEmail}`}>{helpEmail}</a> and we'll get back to you.
                  </p>
                  <div className="mt-4 h-px bg-black/10" />
                  <h4 className="text-sm font-medium mt-4">Quick access</h4>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    <li><Button href="/help/billing-tokens" variant="outline" size="sm">Billing & tokens guide</Button></li>
                    <li><Button href="/help/troubleshooting" variant="outline" size="sm">Troubleshooting</Button></li>
                    <li><Button href="/refund" variant="outline" size="sm">Refund policy</Button></li>
                  </ul>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                viewport={{ once: true }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
              >
                <Card className="p-6" padding="md">
                  <h3 className="text-base font-semibold">Change log</h3>
                  <ul className="mt-3 text-sm text-slate-700 space-y-3">
                    <li>
                      <div className="font-medium text-slate-900">1 Sep 2025</div>
                      <div>New Terms & Conditions published for CV Makers launch.</div>
                    </li>
                  </ul>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>

      </Section>
    </main>
  );
}
