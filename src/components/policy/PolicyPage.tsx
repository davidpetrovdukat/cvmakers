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
import { useLocale } from '@/i18n/LocaleProvider';
import { localizePath } from '@/i18n/config';

interface PolicyPageProps {
  title: string;
  sections: PolicySection[];
  effectiveDate?: string;
  lastUpdated?: string;
  version?: string;
  helpEmail?: string;
  showRegionToggle?: boolean;
}

const COPY = {
  en: {
    updated: 'Updated',
    effective: 'Effective 06.10.2025',
    intro: 'This page explains how you can use CV Makers, purchase token packages, and receive document generation services from WORKING AGENT LTD.',
    print: 'Print',
    toc: 'On this page',
    scope: 'Scope',
    scopeBody: 'Applies to users of cv-makers.co.uk.',
    tokens: 'Tokens',
    tokensBody: 'Credits required to create, export, or enhance CV/resume files.',
    data: 'Data',
    dataBody: 'Your materials remain yours; we process them securely.',
    needHelp: 'Need help?',
    helpText: "and we'll get back to you.",
    quickAccess: 'Quick access',
    billing: 'Billing & tokens guide',
    troubleshooting: 'Troubleshooting',
    refund: 'Refund policy',
    changeLog: 'Change log',
    change: 'Policy pages published for CV Makers launch.',
    lawUk: 'England & Wales',
    lawEu: 'Your EU Member State (default: Republic of Ireland)',
  },
  tr: {
    updated: 'Güncellendi',
    effective: 'Yürürlük 06.10.2025',
    intro: 'Bu sayfa CV Makers kullanımını, token paketlerini ve WORKING AGENT LTD tarafından sağlanan belge oluşturma hizmetlerini açıklar.',
    print: 'Yazdır',
    toc: 'Bu sayfada',
    scope: 'Kapsam',
    scopeBody: 'cv-makers.co.uk kullanıcılarına uygulanır.',
    tokens: 'Tokenlar',
    tokensBody: 'CV/özgeçmiş oluşturma, dışa aktarma veya iyileştirme için kullanılan krediler.',
    data: 'Veri',
    dataBody: 'Materyalleriniz size aittir; bunları güvenli şekilde işleriz.',
    needHelp: 'Yardıma mı ihtiyacınız var?',
    helpText: 'adresine e-posta gönderin; size dönüş yapacağız.',
    quickAccess: 'Hızlı erişim',
    billing: 'Faturalandırma ve token rehberi',
    troubleshooting: 'Sorun giderme',
    refund: 'İade politikası',
    changeLog: 'Değişiklik günlüğü',
    change: 'CV Makers lansmanı için politika sayfaları yayınlandı.',
    lawUk: 'İngiltere ve Galler',
    lawEu: 'AB Üye Devletiniz',
  },
  ja: {
    updated: '更新日',
    effective: '施行日 06.10.2025',
    intro: '本ページでは、CV Makersのご利用、トークンパッケージの購入、およびWORKING AGENT LTDによる書類生成サービスについて説明します。',
    print: '印刷',
    toc: 'このページの内容',
    scope: '適用範囲',
    scopeBody: 'cv-makers.co.ukの利用者に適用されます。',
    tokens: 'トークン',
    tokensBody: 'CV/職務経歴書の作成、エクスポート、改善に必要なクレジットです。',
    data: 'データ',
    dataBody: 'お客様の資料の権利はお客様に帰属し、当社は安全に処理します。',
    needHelp: 'お困りですか？',
    helpText: 'までメールをお送りください。折り返しご連絡いたします。',
    quickAccess: 'クイックアクセス',
    billing: '請求およびトークンガイド',
    troubleshooting: 'トラブルシューティング',
    refund: '返金ポリシー',
    changeLog: '変更履歴',
    change: 'CV Makersのローンチに伴い、ポリシーページを公開しました。',
    lawUk: 'イングランドおよびウェールズ',
    lawEu: 'お客様のEU加盟国（デフォルト：アイルランド共和国）',
  },
} as const;

export default function PolicyPage({
  title,
  sections,
  effectiveDate = '06.10.2025',
  lastUpdated = '06.10.2025',
  version = 'v1.0.0',
  helpEmail = 'info@mail.com',
  showRegionToggle = true,
}: PolicyPageProps) {
  const locale = useLocale();
  const copy = COPY[locale];
  const [region, setRegion] = useState<Region>('UK');
  const [active, setActive] = useState<string | null>(sections?.[0]?.id ?? null);
  const contentRef = useRef<HTMLDivElement>(null);

  const headings: Heading[] = useMemo(
    () => (sections || []).map((s) => ({ id: s.id, title: s.title })),
    [sections],
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
      { root: null, rootMargin: '0px 0px -70% 0px', threshold: [0, 1] },
    );
    const nodes = contentRef.current.querySelectorAll('section[id]');
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [sections]);

  const lawText = region === 'UK' ? copy.lawUk : copy.lawEu;

  const onJump = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActive(id);
  };

  return (
    <main className="bg-slate-50 min-h-screen">
      <Section className="py-10">
        <motion.div className="text-center space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2">
            <span className="rounded-full bg-emerald-100 text-emerald-600 px-3 py-1 text-xs font-semibold">{copy.updated}</span>
            <span className="rounded-full bg-indigo-100 text-indigo-600 px-3 py-1 text-xs font-semibold">{copy.effective}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900">{title}</h1>
          <p className="max-w-2xl mx-auto text-slate-600 text-lg">{copy.intro}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {!showRegionToggle ? null : (
              <div className="inline-flex rounded-xl border border-black/10 bg-white p-1">
                {(['UK', 'EU'] as Region[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRegion(r)}
                    className={`px-3 py-1.5 text-sm rounded-lg ${region === r ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
            <Button variant="outline" onClick={() => window.print()}>{copy.print}</Button>
          </div>
        </motion.div>

        <div className="mt-10 grid lg:grid-cols-[260px,1fr,300px] gap-6 items-start">
          <motion.div className="hidden lg:block" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <Card className="p-5 sticky top-24" padding="md">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">{copy.toc}</h3>
              <PolicyTOC headings={headings} current={active} onJump={onJump} />
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <PolicyMeta effectiveDate={effectiveDate} lastUpdated={lastUpdated} version={version} lawText={lawText} />
            <Card className="mt-6 p-6" padding="md">
              <div className="space-y-3 text-sm text-slate-600">
                <PolicySummaryItem marker="S" title={copy.scope} body={copy.scopeBody} className="bg-emerald-100 text-emerald-600" />
                <PolicySummaryItem marker="T" title={copy.tokens} body={copy.tokensBody} className="bg-indigo-100 text-indigo-600" />
                <PolicySummaryItem marker="D" title={copy.data} body={copy.dataBody} className="bg-purple-100 text-purple-600" />
              </div>
            </Card>
            <div className="mt-6" />
            <div ref={contentRef as any} className="space-y-10">
              <PolicyContent sections={sections} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="space-y-6">
              <Card className="p-6" padding="md">
                <h3 className="text-base font-semibold">{copy.needHelp}</h3>
                <p className="text-slate-600 text-sm mt-1">
                  Email <a className="underline" href={`mailto:${helpEmail}`}>{helpEmail}</a> {copy.helpText}
                </p>
                <div className="mt-4 h-px bg-black/10" />
                <h4 className="text-sm font-medium mt-4">{copy.quickAccess}</h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li><Button href={localizePath('/help/billing-tokens', locale)} variant="outline" size="sm">{copy.billing}</Button></li>
                  <li><Button href={localizePath('/help/troubleshooting', locale)} variant="outline" size="sm">{copy.troubleshooting}</Button></li>
                  <li><Button href={localizePath('/refund', locale)} variant="outline" size="sm">{copy.refund}</Button></li>
                </ul>
              </Card>

              <Card className="p-6" padding="md">
                <h3 className="text-base font-semibold">{copy.changeLog}</h3>
                <ul className="mt-3 text-sm text-slate-700 space-y-3">
                  <li>
                    <div className="font-medium text-slate-900">06.10.2025</div>
                    <div>{copy.change}</div>
                  </li>
                </ul>
              </Card>
            </div>
          </motion.div>
        </div>
      </Section>
    </main>
  );
}

function PolicySummaryItem({ marker, title, body, className }: { marker: string; title: string; body: string; className: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${className}`}>{marker}</div>
      <div>
        <div className="font-semibold text-slate-900">{title}</div>
        <div>{body}</div>
      </div>
    </div>
  );
}
