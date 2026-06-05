'use client';

import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Segmented from '@/components/ui/Segmented';
import { ScaledA4 } from '@/components/resume/ui';
import { ResumeTemplates, type ResumeTemplateKey, sampleResumeData, sampleCVData } from '@/components/resume';
import { useLocale } from '@/i18n/LocaleProvider';
import { localizePath } from '@/i18n/config';

const TEMPLATE_KEYS: ResumeTemplateKey[] = ['classic', 'split', 'serif', 'tech'];

const COPY = {
  en: {
    heading: 'Resume & CV templates',
    subheading: 'Formal, universal and creative - for any industry.',
    resume: 'Resume',
    cv: 'CV',
    ats: 'ATS-friendly - 1-2 pages',
    languages: 'EN/TR/JP',
    preview: 'Preview',
    useTemplate: 'Use template',
    close: 'Close',
  },
  tr: {
    heading: 'Özgeçmiş ve CV şablonları',
    subheading: 'Resmi, evrensel ve yaratıcı - her sektör için.',
    resume: 'Özgeçmiş',
    cv: 'CV',
    ats: 'ATS uyumlu - 1-2 sayfa',
    languages: 'EN/TR/JP',
    preview: 'Önizle',
    useTemplate: 'Şablonu kullan',
    close: 'Kapat',
  },
  ja: {
    heading: '職務経歴書とCVテンプレート',
    subheading: 'フォーマル、ユニバーサル、クリエイティブ — あらゆる業界に対応しています。',
    resume: '職務経歴書',
    cv: 'CV',
    ats: 'ATS対応 — 1〜2ページ',
    languages: 'EN/TR/JP',
    preview: 'プレビュー',
    useTemplate: 'テンプレートを使用',
    close: '閉じる',
  },
} as const;

export default function TemplatesShowcase() {
  const locale = useLocale();
  const copy = COPY[locale];
  const [docType, setDocType] = useState<'resume' | 'cv'>('resume');
  const [modal, setModal] = useState<{ open: boolean; key?: ResumeTemplateKey }>({ open: false });
  const reduceMotion = useReducedMotion();

  const data = useMemo(() => (docType === 'resume' ? sampleResumeData : sampleCVData), [docType]);

  return (
    <Section id="templates" className="py-10 bg-slate-50">
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold">{copy.heading}</h2>
        <p className="mt-2 text-slate-600">{copy.subheading}</p>
        <div className="mt-4 flex justify-center">
          <Segmented
            options={[{ label: copy.resume, value: 'resume' }, { label: copy.cv, value: 'cv' }]}
            value={docType}
            onChange={(v) => setDocType(v as 'resume' | 'cv')}
          />
        </div>
      </motion.div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TEMPLATE_KEYS.map((key, index) => {
          const T = ResumeTemplates[key];
          const title = labelForTemplate(key);
          return (
            <motion.div
              key={key}
              initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              whileHover={reduceMotion ? undefined : { y: -8, scale: 1.02, transition: { type: 'spring', stiffness: 260, damping: 22 } }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.45, delay: reduceMotion ? 0 : index * 0.06 }}
              viewport={{ once: true }}
            >
              <Card className="p-3 h-full transition-transform hover:-translate-y-2">
                <div className="text-sm font-semibold text-slate-700 mb-2">{title}</div>
                <div className="rounded-lg border border-slate-300 bg-white overflow-hidden p-3 shadow-xl">
                  <ScaledA4>
                    <T data={data} />
                  </ScaledA4>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{copy.ats}</span>
                  <span>{copy.languages}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setModal({ open: true, key })}>{copy.preview}</Button>
                  <a className="flex-1" href={`${localizePath('/auth/signin', locale)}?mode=login`}><Button variant="secondary" className="w-full">{copy.useTemplate}</Button></a>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {modal.open && modal.key && (
        <TemplatePreviewModal
          onClose={() => setModal({ open: false })}
          docType={docType}
          templateKey={modal.key}
          closeLabel={copy.close}
        />
      )}
    </Section>
  );
}

function labelForTemplate(k: ResumeTemplateKey) {
  switch (k) {
    case 'classic': return 'The London';
    case 'split': return 'The Berlin';
    case 'serif': return 'The New York';
    case 'tech': return 'The Silicon Valley';
    default: return k;
  }
}

function TemplatePreviewModal({
  onClose,
  docType,
  templateKey,
  closeLabel,
}: {
  onClose: () => void;
  docType: 'resume' | 'cv';
  templateKey: ResumeTemplateKey;
  closeLabel: string;
}) {
  const T = ResumeTemplates[templateKey];
  const data = docType === 'resume' ? sampleResumeData : sampleCVData;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 flex min-h-full items-center justify-center p-4">
        <div
          className="relative rounded-2xl bg-white p-4 shadow-xl"
          style={{ width: 'min(95vw, calc(90vh * 0.707))', maxHeight: '90vh' }}
        >
          <button
            aria-label={closeLabel}
            onClick={onClose}
            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-slate-600 hover:bg-slate-100"
            type="button"
          >
            X
          </button>
          <div className="mb-2 pr-8 text-sm font-semibold text-slate-700">
            {labelForTemplate(templateKey)} - {docType.toUpperCase()}
          </div>
          <div className="rounded-lg border border-slate-200 p-2">
            <ScaledA4 maxScale={1}>
              <T data={data} />
            </ScaledA4>
          </div>
        </div>
      </div>
    </div>
  );
}
