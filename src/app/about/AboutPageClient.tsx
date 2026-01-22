"use client";

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { THEME } from '@/lib/theme';
import { ScaledA4, ResumeTemplates, sampleResumeData, sampleCVData } from '@/components/resume';
import type { ResumeTemplateKey } from '@/components/resume';

interface FeatureItem {
  title: string;
  description: string;
  iconBg: string;
  icon: ReactNode;
}

interface PillarItem {
  title: string;
  description: string;
  iconBg: string;
  icon: ReactNode;
}

const TEMPLATE_KEYS: ResumeTemplateKey[] = ['classic', 'split', 'serif', 'tech'];

const STEPS: FeatureItem[] = [
  {
    title: 'Create quality documents in minutes',
    description: 'Modern templates that read well for hiring teams and pass applicant tracking systems.',
    iconBg: 'bg-indigo-100',
    icon: (
      <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: 'Guided writing',
    description: 'Friendly prompts and ready-made phrasing to keep things concise and professional.',
    iconBg: 'bg-emerald-100',
    icon: (
      <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5h9a2 2 0 012 2v12l-3.5-2-3.5 2V7a2 2 0 00-2-2H5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 3v4m0 4v4m0 4h3a1 1 0 001-1V7.414a1 1 0 00-.293-.707l-3.414-3.414A1 1 0 0016.586 3H16z" />
      </svg>
    ),
  },
  {
    title: 'Edit, preview, export',
    description: 'Work in your dashboard, preview on A4, download PDF/DOCX when you\'re ready.',
    iconBg: 'bg-purple-100',
    icon: (
      <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    title: 'Fair pricing with tokens',
    description: 'Top up once, spend only on actions you need (create, improve, export).',
    iconBg: 'bg-amber-100',
    icon: (
      <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.343-4 3s1.79 3 4 3 4 1.343 4 3-1.79 3-4 3-4-1.343-4-3" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 10v2" />
      </svg>
    ),
  },
];

const PILLARS: PillarItem[] = [
  {
    title: 'Structure first',
    description: 'Every template enforces a clean visual rhythm, consistent spacing, and clear hierarchy.',
    iconBg: 'bg-sky-100',
    icon: (
      <svg className="h-5 w-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5h5v5H4zM4 14h5v5H4zM13 5h7M13 9h7M13 14h7M13 18h7" />
      </svg>
    ),
  },
  {
    title: 'Measurable results',
    description: 'We nudge users to add impact: numbers, deltas, and outcomes that matter to recruiters.',
    iconBg: 'bg-indigo-100',
    icon: (
      <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4-4 3 3 6-7 3 3" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 20h16" />
      </svg>
    ),
  },
  {
    title: 'Frictionless export',
    description: 'Live A4 preview and print-safe typography ensure your PDF looks exactly as expected.',
    iconBg: 'bg-rose-100',
    icon: (
      <svg className="h-5 w-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v9m0 0l-3-3m3 3 3-3" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19h14" />
      </svg>
    ),
  },
];

const PRINCIPLES = [
  {
    title: 'Clarity over flair',
    description: 'We prefer readable layouts to heavy decoration.',
  },
  {
    title: 'Respect for time',
    description: 'Few steps, fast preview, quick export.',
  },
  {
    title: 'Own your data',
    description: 'You control what\'s stored and when it\'s deleted.',
  },
  {
    title: 'No lock-in',
    description: 'Tokens, not subscriptions; export to open formats anytime.',
  },
];

const TRUST_ITEMS = [
  {
    title: 'Data protection',
    description: 'All data in transit is encrypted; infrastructure hosted in the UK/EU with GDPR compliance.',
  },
  {
    title: 'Minimal data collection',
    description: 'We store only what\'s needed to deliver the service. No full card data on our servers.',
  },
  {
    title: 'Account controls',
    description: 'Download your data, request deletion from your account.',
  },
  {
    title: 'Operational security',
    description: 'Regular updates and internal reviews; production access is restricted by role.',
  },
];

const COMPANY_DETAILS = [
  'WORKING AGENT LTD',
  'Company number: 15957326',
  '31 Auctioneers Way, Northampton, United Kingdom, NN1 1HF',
  'General enquiries: info@cv-makers.co.uk',
];

const TEMPLATE_COPY = {
  resume: {
    title: 'Resume templates',
    description: 'Optimised for concise, achievement-led resumes (1-2 pages).',
    href: (key: ResumeTemplateKey) => `/create-resume?template=${key}`,
    data: sampleResumeData,
  },
  cv: {
    title: 'CV templates',
    description: 'Extended CV layouts with space for research, publications, and detailed history.',
    href: (key: ResumeTemplateKey) => `/create-cv?template=${key}`,
    data: sampleCVData,
  },
} as const;

type TemplateGroupKey = keyof typeof TEMPLATE_COPY;

export default function AboutPageClient() {
  return (
    <div className="min-h-screen">
      <Section className="pt-12 pb-20">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className={`text-4xl sm:text-5xl font-bold leading-tight ${THEME.text}`}>
            We help people land interviews with better CVs and resumes - faster.
          </h1>
          <p className={`mt-6 text-lg ${THEME.muted}`}>
            CV Makers turns your experience into a clear, ATS-friendly document you can create, edit, and export in minutes. Pay only for what you use with simple tokens.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/create-cv" size="lg">Get started</Button>
            <Button href="/pricing" variant="outline" size="lg">View pricing</Button>
          </div>
        </motion.div>
      </Section>

      <Section className="py-20 bg-slate-50/60">
        <motion.div
          className="mx-auto max-w-5xl"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className={`text-3xl font-bold text-center ${THEME.text}`}>What we do</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {STEPS.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                viewport={{ once: true }}
                whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
              >
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-full ${step.iconBg}`}>
                      {step.icon}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                      <p className="mt-2 text-sm text-slate-600">{step.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Section>

      <Section className="py-20">
        <motion.div
          className="mx-auto max-w-5xl"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center">
            <h2 className={`text-3xl font-bold ${THEME.text}`}>Our approach</h2>
            <p className={`mt-4 text-base ${THEME.muted}`}>
              Short, practical, and transparent. We focus on the parts that actually impact outcomes - structure, wording, and clarity.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {PILLARS.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                viewport={{ once: true }}
                whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
              >
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-full ${pillar.iconBg}`}>
                      {pillar.icon}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{pillar.title}</h3>
                      <p className="mt-2 text-sm text-slate-600">{pillar.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Section>

      <Section className="py-20 bg-slate-50/60">
        <motion.div
          className="mx-auto max-w-5xl"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className={`text-3xl font-bold text-center ${THEME.text}`}>Our principles</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {PRINCIPLES.map((principle, index) => (
              <motion.div
                key={principle.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                viewport={{ once: true }}
                whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900">{principle.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{principle.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Section>

      <Section className="py-20">
        <motion.div
          className="mx-auto max-w-5xl"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className={`text-3xl font-bold text-center ${THEME.text}`}>Trust & Security</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {TRUST_ITEMS.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                viewport={{ once: true }}
                whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Section>

      <Section className="py-20 bg-slate-50/60">
        <motion.div
          className="mx-auto max-w-3xl"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className={`text-3xl font-bold text-center ${THEME.text}`}>Company details</h2>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
            {COMPANY_DETAILS.map((line) => (
              <div key={line} className="py-1 text-center">
                {line}
              </div>
            ))}
          </div>
        </motion.div>
      </Section>

      <Section className="py-20">
        <motion.div
          className="mx-auto max-w-6xl"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold ${THEME.text}`}>Resume & CV templates</h2>
            <p className={`mt-3 text-base ${THEME.muted}`}>Explore clean, ATS-friendly layouts that keep your achievements front and center.</p>
          </div>
          <div className="space-y-12">
            {(Object.keys(TEMPLATE_COPY) as TemplateGroupKey[]).map((groupKey) => {
              const group = TEMPLATE_COPY[groupKey];
              return (
                <div key={groupKey}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">{group.title}</h3>
                    <p className="text-sm text-slate-600">{group.description}</p>
                  </div>
                  <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {TEMPLATE_KEYS.map((key, index) => {
                      const Template = ResumeTemplates[key];
                      return (
                        <motion.div
                          key={`${groupKey}-${key}`}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.4 }}
                          viewport={{ once: true }}
                          whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
                        >
                          <Card className="border border-slate-200 bg-white p-4">
                            <div className="text-sm font-semibold text-slate-900">{labelForTemplate(key)}</div>
                            <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white p-2">
                              <ScaledA4>
                                <Template data={group.data} />
                              </ScaledA4>
                            </div>
                            <div className="mt-3 text-xs text-slate-500">Printable A4 | ATS ready | Multi-language</div>
                            <div className="mt-3">
                              <Button href={group.href(key)} variant="outline" className="w-full">Use template</Button>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </Section>

      <Section className="py-20">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className={`text-3xl font-bold ${THEME.text}`}>Questions? We\'re here to help</h2>
          <p className={`mt-4 text-base ${THEME.muted}`}>Get in touch with our team for support, partnerships, or media inquiries.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/contact" size="lg">Contact us</Button>
            <Button href="/pricing" variant="outline" size="lg">View pricing</Button>
          </div>
        </motion.div>
      </Section>
    </div>
  );
}

function labelForTemplate(key: ResumeTemplateKey): string {
  switch (key) {
    case 'classic':
      return 'Classic ATS';
    case 'split':
      return 'Modern Split';
    case 'serif':
      return 'Elegant Serif';
    case 'tech':
      return 'Tech Compact';
    default:
      return key;
  }
}


