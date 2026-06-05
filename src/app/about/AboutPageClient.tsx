"use client";

import { motion } from 'framer-motion';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { THEME } from '@/lib/theme';
import { localizePath } from '@/i18n/config';
import { useLocale } from '@/i18n/LocaleProvider';
import { ScaledA4, ResumeTemplates, sampleResumeData, sampleCVData } from '@/components/resume';
import type { Locale } from '@/i18n/config';
import type { ResumeTemplateKey } from '@/components/resume';

const TEMPLATE_KEYS: ResumeTemplateKey[] = ['classic', 'split', 'serif', 'tech'];

const ICONS = {
  document: (
    <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414A1 1 0 0 1 19 9.414V19a2 2 0 0 1-2 2z" />
    </svg>
  ),
  writing: (
    <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8M8 11h8M8 15h5M5 4h14v16H5z" />
    </svg>
  ),
  preview: (
    <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    </svg>
  ),
  tokens: (
    <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.343-4 3s1.79 3 4 3 4 1.343 4 3-1.79 3-4 3-4-1.343-4-3M12 4v4m0 10v2" />
    </svg>
  ),
};

const COPY = {
  en: {
    hero: {
      title: 'We help people land interviews with better CVs and resumes.',
      body: 'CV Makers turns your experience into a clear, ATS-friendly document you can create, edit, and export in minutes. You pay only for the actions you use with simple tokens.',
      primary: 'Get started',
      secondary: 'View pricing',
    },
    whatWeDo: {
      title: 'What we do',
      items: [
        ['Create quality documents in minutes', 'Modern templates that read well for hiring teams and pass applicant tracking systems.', 'bg-indigo-100', ICONS.document],
        ['Guided writing', 'Friendly prompts and ready-made phrasing keep your experience concise and professional.', 'bg-emerald-100', ICONS.writing],
        ['Edit, preview, export', 'Work in your dashboard, preview on A4, then download PDF or DOCX when you are ready.', 'bg-purple-100', ICONS.preview],
        ['Fair pricing with tokens', 'Top up once and spend only on actions you need: create, improve, translate, and export.', 'bg-amber-100', ICONS.tokens],
      ],
    },
    approach: {
      title: 'Our approach',
      body: 'Short, practical, and transparent. We focus on the parts that actually impact outcomes: structure, wording, and clarity.',
      items: [
        ['Structure first', 'Clean visual rhythm, consistent spacing, and a hierarchy recruiters can scan quickly.'],
        ['Measurable results', 'Prompts help you add numbers, outcomes, and concrete achievements.'],
        ['Frictionless export', 'Live A4 previews and print-safe typography keep downloads predictable.'],
      ],
    },
    trust: {
      title: 'Trust and security',
      items: [
        ['Data protection', 'Data in transit is encrypted and our infrastructure is designed for GDPR-conscious workflows.'],
        ['Minimal collection', 'We store what is needed to deliver the service and do not keep full card data on our servers.'],
        ['Account controls', 'You can manage saved documents and request account or data deletion.'],
        ['No lock-in', 'Tokens instead of subscriptions, with exports available in standard formats.'],
      ],
    },
    company: {
      title: 'Company details',
      lines: [
        'WORKING AGENT LTD',
        'Company number: 15957326',
        'Academy House, 11 Dunraven Place, Bridgend, Mid Glamorgan, CF31 1JF',
        'General enquiries: info@cv-makers.co.uk',
      ],
    },
    templates: {
      title: 'Resume and CV templates',
      body: 'Explore clean, ATS-friendly layouts that keep your achievements front and center.',
      resumeTitle: 'Resume templates',
      resumeBody: 'Optimised for concise, achievement-led resumes.',
      cvTitle: 'CV templates',
      cvBody: 'Extended CV layouts with space for research, publications, and detailed history.',
      meta: 'Printable A4 | ATS ready | Multi-language',
      use: 'Use template',
      labels: {
        classic: 'Classic ATS',
        split: 'Modern Split',
        serif: 'Elegant Serif',
        tech: 'Tech Compact',
      },
    },
    contact: {
      title: 'Questions? We are here to help',
      body: 'Contact our team for support, partnerships, billing, or media enquiries.',
      primary: 'Contact us',
      secondary: 'View pricing',
    },
  },
  tr: {
    hero: {
      title: 'Daha iyi CV ve özgeçmişlerle mülakat şansınızı artırıyoruz.',
      body: 'CV Makers, deneyiminizi dakikalar içinde oluşturabileceğiniz, düzenleyebileceğiniz ve dışa aktarabileceğiniz net ve ATS uyumlu belgelere dönüştürür. Yalnızca kullandığınız işlemler için token ile ödeme yaparsınız.',
      primary: 'Başlayın',
      secondary: 'Fiyatları görüntüle',
    },
    whatWeDo: {
      title: 'Ne yapıyoruz',
      items: [
        ['Dakikalar içinde kaliteli belgeler', 'İşe alım ekiplerinin kolayca okuyabileceği ve ATS sistemlerinden geçebilecek modern şablonlar.', 'bg-indigo-100', ICONS.document],
        ['Yönlendirmeli yazım', 'Profesyonel, kısa ve net anlatım için hazır ifadeler ve pratik yönlendirmeler.', 'bg-emerald-100', ICONS.writing],
        ['Düzenle, önizle, dışa aktar', 'Kontrol panelinde çalışın, A4 önizlemesini görün ve hazır olduğunuzda PDF veya DOCX indirin.', 'bg-purple-100', ICONS.preview],
        ['Token ile adil fiyatlandırma', 'Bir kez bakiye yükleyin; yalnızca oluşturma, iyileştirme, çeviri ve dışa aktarma gibi ihtiyaç duyduğunuz işlemlerde harcayın.', 'bg-amber-100', ICONS.tokens],
      ],
    },
    approach: {
      title: 'Yaklaşımımız',
      body: 'Kısa, uygulanabilir ve şeffaf. Sonucu etkileyen noktalara odaklanırız: yapı, ifade kalitesi ve netlik.',
      items: [
        ['Önce yapı', 'Düzenli aralıklar, okunabilir görsel ritim ve işe alım uzmanlarının hızlı tarayabileceği hiyerarşi.'],
        ['Ölçülebilir sonuçlar', 'Yönlendirmeler; sayı, çıktı ve somut başarı eklemenize yardımcı olur.'],
        ['Sorunsuz dışa aktarma', 'Canlı A4 önizleme ve baskıya uygun tipografi, indirme sonucunu öngörülebilir kılar.'],
      ],
    },
    trust: {
      title: 'Güven ve güvenlik',
      items: [
        ['Veri koruma', 'Aktarım sırasındaki veriler şifrelenir; altyapımız GDPR odaklı iş akışları için tasarlanmıştır.'],
        ['Minimum veri toplama', 'Hizmeti sunmak için gereken verileri saklarız; tam kart bilgileri sunucularımızda tutulmaz.'],
        ['Hesap kontrolleri', 'Kaydedilen belgeleri yönetebilir, hesap veya veri silme talebinde bulunabilirsiniz.'],
        ['Bağımlılık yok', 'Abonelik yerine token modeli; standart formatlarda dışa aktarma desteği.'],
      ],
    },
    company: {
      title: 'Şirket bilgileri',
      lines: [
        'WORKING AGENT LTD',
        'Şirket numarası: 15957326',
        'Academy House, 11 Dunraven Place, Bridgend, Mid Glamorgan, CF31 1JF',
        'Genel iletişim: info@cv-makers.co.uk',
      ],
    },
    templates: {
      title: 'Özgeçmiş ve CV şablonları',
      body: 'Başarılarınızı öne çıkaran, temiz ve ATS uyumlu düzenleri inceleyin.',
      resumeTitle: 'Özgeçmiş şablonları',
      resumeBody: 'Kısa ve başarı odaklı özgeçmişler için optimize edilmiştir.',
      cvTitle: 'CV şablonları',
      cvBody: 'Araştırma, yayınlar ve detaylı kariyer geçmişi için daha geniş CV düzenleri.',
      meta: 'A4 baskıya uygun | ATS uyumlu | Çok dilli',
      use: 'Şablonu kullan',
      labels: {
        classic: 'Klasik ATS',
        split: 'Modern Bölmeli',
        serif: 'Zarif Serif',
        tech: 'Teknik Kompakt',
      },
    },
    contact: {
      title: 'Sorularınız mı var? Yardım etmeye hazırız',
      body: 'Destek, iş birlikleri, faturalandırma veya medya talepleri için ekibimizle iletişime geçin.',
      primary: 'Bize ulaşın',
      secondary: 'Fiyatları görüntüle',
    },
  },
  ja: {
    hero: {
      title: 'より良いCVと職務経歴書で面接の機会を増やします。',
      body: 'CV Makersは、あなたの経験を明確でATS対応のドキュメントに変換します。数分で作成・編集・エクスポートが可能です。シンプルなトークンで、使った分だけお支払い。',
      primary: '始める',
      secondary: '料金を見る',
    },
    whatWeDo: {
      title: '私たちのサービス',
      items: [
        ['数分で高品質なドキュメントを作成', '採用担当者が読みやすく、ATSを通過できるモダンなテンプレート。', 'bg-indigo-100', ICONS.document],
        ['ガイド付きライティング', '親しみやすいプロンプトと定型フレーズで、経験を簡潔かつプロフェッショナルにまとめます。', 'bg-emerald-100', ICONS.writing],
        ['編集・プレビュー・エクスポート', 'ダッシュボードで作業し、A4プレビューを確認し、準備ができたらPDFまたはDOCXをダウンロード。', 'bg-purple-100', ICONS.preview],
        ['トークンによる公平な料金', '一度チャージして、作成・改善・翻訳・エクスポートなど必要な操作だけに使えます。', 'bg-amber-100', ICONS.tokens],
      ],
    },
    approach: {
      title: '私たちのアプローチ',
      body: 'シンプルで実用的、そして透明性のあるサービス。結果に影響する要素——構成、表現、明確さ——に集中します。',
      items: [
        ['構成を最優先', 'クリーンな視覚リズム、一貫した余白、採用担当者が素早くスキャンできる階層構造。'],
        ['測定可能な成果', 'プロンプトが数値、成果、具体的な実績の追加をサポートします。'],
        ['スムーズなエクスポート', 'ライブA4プレビューと印刷対応のタイポグラフィで、ダウンロード結果を予測可能に。'],
      ],
    },
    trust: {
      title: '信頼とセキュリティ',
      items: [
        ['データ保護', '転送中のデータは暗号化され、GDPRを意識したワークフロー向けに設計されたインフラ。'],
        ['最小限のデータ収集', 'サービス提供に必要なデータのみを保存し、カード情報の全文はサーバーに保持しません。'],
        ['アカウント管理', '保存したドキュメントの管理や、アカウント・データの削除リクエストが可能です。'],
        ['ロックインなし', 'サブスクリプションではなくトークン制。標準フォーマットでのエクスポートに対応。'],
      ],
    },
    company: {
      title: '会社情報',
      lines: [
        'WORKING AGENT LTD',
        '会社番号: 15957326',
        'Academy House, 11 Dunraven Place, Bridgend, Mid Glamorgan, CF31 1JF',
        'お問い合わせ: info@cv-makers.co.uk',
      ],
    },
    templates: {
      title: '職務経歴書とCVテンプレート',
      body: '実績を前面に出す、クリーンでATS対応のレイアウトをご覧ください。',
      resumeTitle: '職務経歴書テンプレート',
      resumeBody: '簡潔で成果重視の職務経歴書向けに最適化。',
      cvTitle: 'CVテンプレート',
      cvBody: '研究、出版物、詳細な経歴に対応した拡張CVレイアウト。',
      meta: 'A4印刷対応 | ATS対応 | 多言語',
      use: 'テンプレートを使う',
      labels: {
        classic: 'クラシックATS',
        split: 'モダンスプリット',
        serif: 'エレガントセリフ',
        tech: 'テックコンパクト',
      },
    },
    contact: {
      title: 'ご質問がありますか？お気軽にどうぞ',
      body: 'サポート、パートナーシップ、請求、メディアに関するお問い合わせはこちらから。',
      primary: 'お問い合わせ',
      secondary: '料金を見る',
    },
  },
} as const satisfies Record<Locale, Record<string, unknown>>;

export default function AboutPageClient() {
  const locale = useLocale();
  const copy = COPY[locale];
  const href = (path: string) => localizePath(path, locale);

  return (
    <div className="min-h-screen">
      <Section className="pt-12 pb-20">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className={`text-4xl font-bold leading-tight sm:text-5xl ${THEME.text}`}>{copy.hero.title}</h1>
          <p className={`mt-6 text-lg ${THEME.muted}`}>{copy.hero.body}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href={href('/create-cv')} size="lg">{copy.hero.primary}</Button>
            <Button href={href('/pricing')} variant="outline" size="lg">{copy.hero.secondary}</Button>
          </div>
        </motion.div>
      </Section>

      <Section className="bg-slate-50/60 py-20">
        <motion.div className="mx-auto max-w-5xl" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          <h2 className={`text-center text-3xl font-bold ${THEME.text}`}>{copy.whatWeDo.title}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {copy.whatWeDo.items.map(([title, description, iconBg, icon], index) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08, duration: 0.4 }} viewport={{ once: true }}>
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBg}`}>{icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                      <p className="mt-2 text-sm text-slate-600">{description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Section>

      <Section className="py-20">
        <motion.div className="mx-auto max-w-5xl" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          <div className="text-center">
            <h2 className={`text-3xl font-bold ${THEME.text}`}>{copy.approach.title}</h2>
            <p className={`mt-4 text-base ${THEME.muted}`}>{copy.approach.body}</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {copy.approach.items.map(([title, description], index) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08, duration: 0.4 }} viewport={{ once: true }}>
                <Card className="h-full p-6">
                  <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Section>

      <Section className="bg-slate-50/60 py-20">
        <motion.div className="mx-auto max-w-5xl" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          <h2 className={`text-center text-3xl font-bold ${THEME.text}`}>{copy.trust.title}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {copy.trust.items.map(([title, description], index) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08, duration: 0.4 }} viewport={{ once: true }}>
                <Card className="h-full p-6">
                  <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Section>

      <Section className="py-20">
        <motion.div className="mx-auto max-w-3xl" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          <h2 className={`text-center text-3xl font-bold ${THEME.text}`}>{copy.company.title}</h2>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
            {copy.company.lines.map((line) => (
              <div key={line} className="py-1 text-center">{line}</div>
            ))}
          </div>
        </motion.div>
      </Section>

      <Section className="bg-slate-50/60 py-20">
        <motion.div className="mx-auto max-w-6xl" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          <div className="mb-12 text-center">
            <h2 className={`text-3xl font-bold ${THEME.text}`}>{copy.templates.title}</h2>
            <p className={`mt-3 text-base ${THEME.muted}`}>{copy.templates.body}</p>
          </div>
          <div className="space-y-12">
            <TemplateGroup
              title={copy.templates.resumeTitle}
              description={copy.templates.resumeBody}
              cta={copy.templates.use}
              meta={copy.templates.meta}
              labels={copy.templates.labels}
              data={sampleResumeData}
              hrefFor={(key) => `${href('/create-resume')}?template=${key}`}
            />
            <TemplateGroup
              title={copy.templates.cvTitle}
              description={copy.templates.cvBody}
              cta={copy.templates.use}
              meta={copy.templates.meta}
              labels={copy.templates.labels}
              data={sampleCVData}
              hrefFor={(key) => `${href('/create-cv')}?template=${key}`}
            />
          </div>
        </motion.div>
      </Section>

      <Section className="py-20">
        <motion.div className="mx-auto max-w-4xl text-center" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          <h2 className={`text-3xl font-bold ${THEME.text}`}>{copy.contact.title}</h2>
          <p className={`mt-4 text-base ${THEME.muted}`}>{copy.contact.body}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href={href('/contact')} size="lg">{copy.contact.primary}</Button>
            <Button href={href('/pricing')} variant="outline" size="lg">{copy.contact.secondary}</Button>
          </div>
        </motion.div>
      </Section>
    </div>
  );
}

function TemplateGroup({
  title,
  description,
  cta,
  meta,
  labels,
  data,
  hrefFor,
}: {
  title: string;
  description: string;
  cta: string;
  meta: string;
  labels: Record<ResumeTemplateKey, string>;
  data: typeof sampleResumeData;
  hrefFor: (key: ResumeTemplateKey) => string;
}) {
  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {TEMPLATE_KEYS.map((key, index) => {
          const Template = ResumeTemplates[key];
          return (
            <motion.div key={key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08, duration: 0.4 }} viewport={{ once: true }}>
              <Card className="border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold text-slate-900">{labels[key]}</div>
                <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white p-2">
                  <ScaledA4>
                    <Template data={data} />
                  </ScaledA4>
                </div>
                <div className="mt-3 text-xs text-slate-500">{meta}</div>
                <Button href={hrefFor(key)} variant="outline" className="mt-3 w-full">{cta}</Button>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
