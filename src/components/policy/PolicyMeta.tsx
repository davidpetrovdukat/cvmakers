'use client';

import Card from '@/components/ui/Card';
import { Locale } from '@/i18n/config';
import { useLocale } from '@/i18n/LocaleProvider';

const LABELS: Record<Locale, { effective: string; updated: string; version: string; law: string }> = {
  en: { effective: 'Effective', updated: 'Last updated', version: 'Version', law: 'Governing law' },
  tr: { effective: 'Yürürlük', updated: 'Son güncelleme', version: 'Sürüm', law: 'Geçerli hukuk' },
  ja: { effective: '発効日', updated: '最終更新', version: 'バージョン', law: '準拠法' },
};

interface PolicyMetaProps {
  effectiveDate?: string;
  lastUpdated?: string;
  version?: string;
  lawText?: string;
}

function MetaRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className="text-slate-500 w-24">{label}</div>
      <div className="text-slate-900 font-medium">{value || '-'}</div>
    </div>
  );
}

export default function PolicyMeta({ effectiveDate, lastUpdated, version, lawText }: PolicyMetaProps) {
  const locale = useLocale();
  const labels = LABELS[locale];

  return (
    <Card className="p-6" padding="md">
      <div className="grid sm:grid-cols-3 gap-4 text-sm">
        <MetaRow label={labels.effective} value={effectiveDate} />
        <MetaRow label={labels.updated} value={lastUpdated} />
        <MetaRow label={labels.version} value={version} />
      </div>
      {lawText && <div className="mt-3 text-xs text-slate-600">{labels.law}: {lawText}</div>}
    </Card>
  );
}
