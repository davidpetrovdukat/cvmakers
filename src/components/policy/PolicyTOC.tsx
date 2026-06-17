'use client';

import { Heading } from '@/types/policy';
import { Locale } from '@/i18n/config';
import { useLocale } from '@/i18n/LocaleProvider';

const LABELS: Record<Locale, { ariaLabel: string; onThisPage: string }> = {
  en: { ariaLabel: 'Table of contents', onThisPage: 'On this page' },
  tr: { ariaLabel: 'İçindekiler', onThisPage: 'Bu sayfada' },
  ja: { ariaLabel: '目次', onThisPage: 'このページの内容' },
};

interface PolicyTOCProps {
  headings: Heading[];
  current?: string | null;
  onJump?: (id: string) => void;
}

export default function PolicyTOC({ headings, current, onJump }: PolicyTOCProps) {
  const locale = useLocale();
  const labels = LABELS[locale];
  return (
    <nav aria-label={labels.ariaLabel} className="text-sm">
      <div className="text-xs font-semibold text-slate-500 mb-2">{labels.onThisPage}</div>
      <ul className="space-y-1">
        {headings.map((h) => (
          <li key={h.id}>
            <button
              className={`block w-full text-left rounded-lg px-2 py-1.5 hover:bg-slate-100 ${
                current === h.id ? 'text-slate-900 font-medium bg-slate-100' : 'text-slate-700'
              }`}
              onClick={() => onJump?.(h.id)}
            >
              {h.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
