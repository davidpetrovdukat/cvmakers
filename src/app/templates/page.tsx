"use client";

import * as React from 'react';
import { PreviewA4 } from '@/components/resume/ui';
import { ResumeTemplates, type ResumeTemplateKey, sampleResumeData, sampleCVData, emptyResumeData, emptyCVData } from '@/components/resume';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useLocale } from '@/i18n/LocaleProvider';
import { localizePath } from '@/i18n/config';

const COPY = {
  en: {
    title: 'Templates',
    resume: 'Resume (1 page)',
    cv: 'CV (multi-page)',
    mock: 'Sample data',
    empty: 'Empty',
    top: 'Top',
    openFull: 'Open full',
    useTemplate: 'Use template',
    templateLabels: {
      classic: 'Classic ATS',
      split: 'Modern Split',
      serif: 'Elegant Serif',
      tech: 'Tech Compact',
    },
  },
  tr: {
    title: 'Şablonlar',
    resume: 'Özgeçmiş (1 sayfa)',
    cv: 'CV (çok sayfa)',
    mock: 'Örnek veri',
    empty: 'Boş',
    top: 'Yukarı',
    openFull: 'Tam aç',
    useTemplate: 'Şablonu kullan',
    templateLabels: {
      classic: 'Klasik ATS',
      split: 'Modern Bölünmüş',
      serif: 'Zarif Serif',
      tech: 'Teknik Kompakt',
    },
  },
  ja: {
    title: 'テンプレート',
    resume: '職務経歴書（1ページ）',
    cv: 'CV（複数ページ）',
    mock: 'サンプルデータ',
    empty: '空',
    top: 'トップ',
    openFull: '全体表示',
    useTemplate: 'テンプレートを使用',
    templateLabels: {
      classic: 'クラシックATS',
      split: 'モダンスプリット',
      serif: 'エレガントセリフ',
      tech: 'テックコンパクト',
    },
  },
} as const;

export default function TemplatesPage() {
  const locale = useLocale();
  const copy = COPY[locale];
  const [docType, setDocType] = React.useState<'resume' | 'cv'>('resume');
  const [variant, setVariant] = React.useState<'mock' | 'empty'>('mock');

  const data = React.useMemo(() => {
    if (variant === 'mock') return docType === 'resume' ? sampleResumeData : sampleCVData;
    return docType === 'resume' ? emptyResumeData : emptyCVData;
  }, [docType, variant]);

  const templateKeys: ResumeTemplateKey[] = ['classic', 'split', 'serif', 'tech'];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold">{copy.title} - {docType.toUpperCase()} ({variant === 'mock' ? copy.mock : copy.empty})</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <select className="rounded-md border border-slate-300 bg-white px-3 py-2" value={docType} onChange={(e) => setDocType(e.target.value as 'resume' | 'cv')}>
              <option value="resume">{copy.resume}</option>
              <option value="cv">{copy.cv}</option>
            </select>
            <select className="rounded-md border border-slate-300 bg-white px-3 py-2" value={variant} onChange={(e) => setVariant(e.target.value as 'mock' | 'empty')}>
              <option value="mock">{copy.mock}</option>
              <option value="empty">{copy.empty}</option>
            </select>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {templateKeys.map((key) => {
            const T = ResumeTemplates[key];
            const title = copy.templateLabels[key];
            return (
              <Card key={key} className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-700">{title}</div>
                  <div className="flex gap-2 text-xs text-slate-500">
                    <a className="underline" href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{copy.top}</a>
                  </div>
                </div>
                <PreviewA4>
                  <T data={data} />
                </PreviewA4>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => window.open(window.location.href, '_blank')}>{copy.openFull}</Button>
                  <a href={`${localizePath(`/create-${docType}`, locale)}?template=${key}`} className="flex-1"><Button variant="secondary" className="w-full">{copy.useTemplate}</Button></a>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
