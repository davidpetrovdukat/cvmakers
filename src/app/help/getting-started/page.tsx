'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { SERVICE_COSTS } from '@/lib/currency';
import { useLocale } from '@/i18n/LocaleProvider';
import { localizePath } from '@/i18n/config';

type Step = {
  id: string;
  title: string;
  description: string;
  details: readonly string[];
  cta: string;
  ctaLink: string;
  tip?: string;
  note?: string;
  icon: string;
};

const COPY = {
  en: {
    sidebarTitle: 'Getting Started',
    progress: 'Progress',
    of: 'of',
    step: 'Step',
    heroTitle: 'Get started in 5 minutes',
    heroBody: 'Follow these simple steps to create your first professional CV or resume',
    checklist: 'Quick checklist',
    whatYouDo: "What you'll do:",
    tip: 'Tip',
    note: 'Note',
    complete: 'Mark as complete',
    previous: 'Previous',
    next: 'Next',
    doneTitle: "Congratulations! You're all set",
    doneBody: 'You now know how to create a professional CV and resume. Need help with billing or have questions? Check out our resources below.',
    nextBilling: 'Next: Billing & Tokens',
    createCv: 'Create CV or resume',
    steps: [
      {
        id: 'create-account',
        title: 'Create your account',
        description: 'Sign up with email and password, then verify your account.',
        details: ['Enter your email address and create a secure password', 'Check your email for verification link', 'Complete your profile setup'],
        cta: 'Sign up now',
        ctaLink: '/auth/signin?mode=signup',
        tip: 'Use a business email for better organization',
        icon: '1',
      },
      {
        id: 'profile-settings',
        title: 'Add your details',
        description: 'Configure your personal information for a professional CV and resume.',
        details: ['Add your name and surname', 'Add your email address', 'Add your phone number', 'Upload a photo if you want to use one'],
        cta: 'Open your settings',
        ctaLink: '/dashboard',
        tip: 'You can update these details anytime',
        icon: '2',
      },
      {
        id: 'top-up-tokens',
        title: 'Top up tokens',
        description: 'Purchase tokens and create your CV or resume when you are ready.',
        details: ['Choose a ready-made bundle or custom amount', 'Tokens never expire', 'VAT is calculated at checkout based on your location', 'Previewing a document before final export is free'],
        cta: 'Buy tokens',
        ctaLink: '/pricing',
        tip: 'Use the token calculator if you want to estimate a workflow first',
        icon: '3',
      },
      {
        id: 'first-document',
        title: 'Create your first CV or resume',
        description: 'Build your document with structured sections.',
        details: ['Enter your personal details', 'Add summary, experience, education and skills', 'Preview your CV or resume', 'Save a draft before generating PDF or DOCX files'],
        cta: 'Create CV or resume',
        ctaLink: '/create-cv',
        tip: 'You can revisit drafts anytime before exporting.',
        icon: '4',
      },
      {
        id: 'download-edit',
        title: 'Download or edit',
        description: 'Decide whether to keep editing or export your finished document.',
        details: ['Create an editable draft', 'Generate PDF or DOCX files', 'Use AI to improve your wording', 'Use personal manager assistance for expert review'],
        cta: 'Create CV or resume',
        ctaLink: '/create-cv',
        note: `Creating and exporting a PDF deducts ${SERVICE_COSTS.CREATE_DRAFT + SERVICE_COSTS.EXPORT_PDF} tokens from your balance`,
        icon: '5',
      },
    ],
  },
  tr: {
    sidebarTitle: 'Başlangıç',
    progress: 'İlerleme',
    of: '/',
    step: 'Adım',
    heroTitle: '5 dakikada başlayın',
    heroBody: 'İlk profesyonel CV veya özgeçmişinizi oluşturmak için bu basit adımları izleyin',
    checklist: 'Hızlı kontrol listesi',
    whatYouDo: 'Yapacaklarınız:',
    tip: 'İpucu',
    note: 'Not',
    complete: 'Tamamlandı olarak işaretle',
    previous: 'Önceki',
    next: 'Sonraki',
    doneTitle: 'Tebrikler! Hazırsınız',
    doneBody: 'Artık profesyonel CV ve özgeçmiş oluşturmayı biliyorsunuz. Faturalandırma veya sorular için aşağıdaki kaynaklara bakabilirsiniz.',
    nextBilling: 'Sonraki: Faturalandırma ve Tokenlar',
    createCv: 'CV veya özgeçmiş oluştur',
    steps: [
      {
        id: 'create-account',
        title: 'Hesabınızı oluşturun',
        description: 'E-posta ve şifre ile kaydolun, ardından hesabınızı doğrulayın.',
        details: ['E-posta adresinizi girin ve güvenli bir şifre oluşturun', 'Doğrulama bağlantısı için e-postanızı kontrol edin', 'Profil kurulumunuzu tamamlayın'],
        cta: 'Şimdi kaydol',
        ctaLink: '/auth/signin?mode=signup',
        tip: 'Daha iyi düzenleme için iş e-postası kullanabilirsiniz',
        icon: '1',
      },
      {
        id: 'profile-settings',
        title: 'Bilgilerinizi ekleyin',
        description: 'Profesyonel CV ve özgeçmiş için kişisel bilgilerinizi yapılandırın.',
        details: ['Adınızı ve soyadınızı ekleyin', 'E-posta adresinizi ekleyin', 'Telefon numaranızı ekleyin', 'Kullanmak isterseniz fotoğraf yükleyin'],
        cta: 'Ayarlarınızı açın',
        ctaLink: '/dashboard',
        tip: 'Bu bilgileri istediğiniz zaman güncelleyebilirsiniz',
        icon: '2',
      },
      {
        id: 'top-up-tokens',
        title: 'Token yükleyin',
        description: 'Token satın alın ve hazır olduğunuzda CV veya özgeçmişinizi oluşturun.',
        details: ['Hazır paket veya özel tutar seçin', 'Tokenların süresi dolmaz', 'KDV konumunuza göre ödeme sırasında hesaplanır', 'Final dışa aktarımdan önce belge önizlemesi ücretsizdir'],
        cta: 'Token satın al',
        ctaLink: '/pricing',
        tip: 'Önce iş akışını tahmin etmek isterseniz token hesaplayıcıyı kullanın',
        icon: '3',
      },
      {
        id: 'first-document',
        title: 'İlk CV veya özgeçmişinizi oluşturun',
        description: 'Belgenizi yapılandırılmış bölümlerle hazırlayın.',
        details: ['Kişisel bilgilerinizi girin', 'Özet, deneyim, eğitim ve yetkinlikleri ekleyin', 'CV veya özgeçmişinizi önizleyin', 'PDF veya DOCX oluşturmadan önce taslak kaydedin'],
        cta: 'CV veya özgeçmiş oluştur',
        ctaLink: '/create-cv',
        tip: 'Taslaklara dışa aktarmadan önce istediğiniz zaman dönebilirsiniz.',
        icon: '4',
      },
      {
        id: 'download-edit',
        title: 'İndirin veya düzenleyin',
        description: 'Düzenlemeye devam edip etmeyeceğinize ya da tamamlanan belgeyi dışa aktarıp aktarmayacağınıza karar verin.',
        details: ['Düzenlenebilir taslak oluşturun', 'PDF veya DOCX dosyaları oluşturun', 'İfadelerinizi yapay zekâ ile iyileştirin', 'Uzman incelemesi için kişisel yönetici desteği kullanın'],
        cta: 'CV veya özgeçmiş oluştur',
        ctaLink: '/create-cv',
        note: `PDF oluşturup dışa aktarma bakiyenizden ${SERVICE_COSTS.CREATE_DRAFT + SERVICE_COSTS.EXPORT_PDF} token düşer`,
        icon: '5',
      },
    ],
  },
  ja: {
    sidebarTitle: 'はじめに',
    progress: '進捗',
    of: '/',
    step: 'ステップ',
    heroTitle: '5分ではじめましょう',
    heroBody: 'これらの簡単なステップに沿って、最初のプロフェッショナルなCVや職務経歴書を作成できます',
    checklist: 'クイックチェックリスト',
    whatYouDo: '行うこと：',
    tip: 'ヒント',
    note: '注意',
    complete: '完了としてマーク',
    previous: '前へ',
    next: '次へ',
    doneTitle: 'おめでとうございます！準備が整いました',
    doneBody: 'プロフェッショナルなCVと職務経歴書の作成方法をご理解いただけました。お支払いやご不明点については、下記のリソースをご確認ください。',
    nextBilling: '次へ：お支払いとトークン',
    createCv: 'CVまたは職務経歴書を作成',
    steps: [
      {
        id: 'create-account',
        title: 'アカウントを作成',
        description: 'メールアドレスとパスワードで登録し、アカウントを認証してください。',
        details: ['メールアドレスを入力し、安全なパスワードを作成する', '認証リンクのメールを確認する', 'プロフィール設定を完了する'],
        cta: '今すぐ登録',
        ctaLink: '/auth/signin?mode=signup',
        tip: '整理しやすいよう、ビジネス用メールアドレスの使用をおすすめします',
        icon: '1',
      },
      {
        id: 'profile-settings',
        title: '詳細情報を追加',
        description: 'プロフェッショナルなCVと職務経歴書のために個人情報を設定してください。',
        details: ['氏名を追加する', 'メールアドレスを追加する', '電話番号を追加する', '使用する場合は写真をアップロードする'],
        cta: '設定を開く',
        ctaLink: '/dashboard',
        tip: 'これらの情報はいつでも更新できます',
        icon: '2',
      },
      {
        id: 'top-up-tokens',
        title: 'トークンをチャージ',
        description: 'トークンを購入し、準備ができたらCVや職務経歴書を作成してください。',
        details: ['用意されたパッケージまたは任意の金額を選択する', 'トークンに有効期限はありません', 'VATはお住まいの地域に応じてチェックアウト時に計算されます', '最終エクスポート前のドキュメントプレビューは無料です'],
        cta: 'トークンを購入',
        ctaLink: '/pricing',
        tip: '先にワークフローを見積もりたい場合はトークン計算機をご利用ください',
        icon: '3',
      },
      {
        id: 'first-document',
        title: '最初のCVまたは職務経歴書を作成',
        description: '構成されたセクションでドキュメントを作成してください。',
        details: ['個人情報を入力する', '要約、経験、学歴、スキルを追加する', 'CVまたは職務経歴書をプレビューする', 'PDFやDOCXを生成する前に下書きを保存する'],
        cta: 'CVまたは職務経歴書を作成',
        ctaLink: '/create-cv',
        tip: 'エクスポート前にいつでも下書きに戻って編集できます。',
        icon: '4',
      },
      {
        id: 'download-edit',
        title: 'ダウンロードまたは編集',
        description: '編集を続けるか、完成したドキュメントをエクスポートするかを決めてください。',
        details: ['編集可能な下書きを作成する', 'PDFまたはDOCXファイルを生成する', 'AIで表現を改善する', '専門家のレビューのために個人マネージャーのサポートを利用する'],
        cta: 'CVまたは職務経歴書を作成',
        ctaLink: '/create-cv',
        note: `PDFの作成とエクスポートには残高から${SERVICE_COSTS.CREATE_DRAFT + SERVICE_COSTS.EXPORT_PDF}トークンが差し引かれます`,
        icon: '5',
      },
    ],
  },
} as const;

export default function GettingStartedPage() {
  const locale = useLocale();
  const copy = COPY[locale];
  const { data: session } = useSession();
  const href = (path: string) => localizePath(path, locale);
  const steps = useMemo<Step[]>(() => {
    const base: Step[] = copy.steps.map(step => ({ ...step }));
    base[1] = { ...base[1], ctaLink: session ? '/dashboard' : '/auth/signin?mode=login' };
    return base;
  }, [copy.steps, session]);
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.gtag?.('event', 'gs_step_view', {
        step_id: steps[activeStep].id,
        step_number: activeStep + 1,
      });
    }
  }, [activeStep, steps]);

  const progress = ((activeStep + 1) / steps.length) * 100;
  const active = steps[activeStep];

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">{copy.sidebarTitle}</h2>
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-slate-600 mb-2">
                    <span>{copy.progress}</span>
                    <span>{activeStep + 1} {copy.of} {steps.length}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <motion.div className="bg-emerald-500 h-2 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
                  </div>
                </div>
                <nav className="space-y-2">
                  {steps.map((step, index) => (
                    <button
                      key={step.id}
                      onClick={() => setActiveStep(index)}
                      className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                        activeStep === index ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold">{step.icon}</span>
                        <div>
                          <div className="font-medium">{step.title}</div>
                          <div className="text-xs text-slate-500 mt-1">{copy.step} {index + 1}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-slate-900 mb-4">{copy.heroTitle}</h1>
              <p className="text-lg text-slate-600 mb-8">{copy.heroBody}</p>
              <div className="bg-white rounded-xl p-6 border border-slate-200 max-w-2xl mx-auto">
                <h3 className="font-semibold text-slate-900 mb-4">{copy.checklist}</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${completedSteps.has(index) ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        {completedSteps.has(index) ? '✓' : index + 1}
                      </div>
                      <span className="text-slate-700">{step.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <motion.div key={activeStep} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="mb-8">
                <div className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-800">{active.icon}</div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">{active.title}</h2>
                      <p className="text-lg text-slate-600 mb-4">{active.description}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-slate-900 mb-3">{copy.whatYouDo}</h3>
                    <ul className="space-y-2">
                      {active.details.map((detail, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-slate-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {active.tip && (
                    <InfoBox label={copy.tip} className="bg-indigo-50 border-indigo-200 text-indigo-800">
                      {active.tip}
                    </InfoBox>
                  )}
                  {active.note && (
                    <InfoBox label={copy.note} className="bg-amber-50 border-amber-200 text-amber-800">
                      {active.note}
                    </InfoBox>
                  )}

                  <div className="flex gap-4">
                    <Button href={href(active.ctaLink)} size="lg">{active.cta}</Button>
                    {activeStep < steps.length - 1 && (
                      <Button variant="outline" size="lg" onClick={() => {
                        setCompletedSteps(prev => new Set([...prev, activeStep]));
                        setActiveStep(activeStep + 1);
                      }}>
                        {copy.complete}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>

            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={() => setActiveStep(Math.max(0, activeStep - 1))} disabled={activeStep === 0}>{copy.previous}</Button>
              <div className="flex gap-2">
                {steps.map((_, index) => (
                  <button key={index} onClick={() => setActiveStep(index)} className={`w-3 h-3 rounded-full transition-colors ${index === activeStep ? 'bg-emerald-500' : 'bg-slate-300 hover:bg-slate-400'}`} />
                ))}
              </div>
              <Button onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))} disabled={activeStep === steps.length - 1}>{copy.next}</Button>
            </div>

            {activeStep === steps.length - 1 && (
              <div className="mt-12 text-center">
                <Card className="bg-gradient-to-r from-emerald-50 to-indigo-50 border-emerald-200">
                  <div className="p-8">
                    <h3 className="text-xl font-semibold text-slate-900 mb-4">{copy.doneTitle}</h3>
                    <p className="text-slate-600 mb-6">{copy.doneBody}</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button href={href('/help/billing-tokens')} size="lg">{copy.nextBilling}</Button>
                      <Button href={href('/create-cv')} variant="outline" size="lg">{copy.createCv}</Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoBox({ label, children, className }: { label: string; children: React.ReactNode; className: string }) {
  return (
    <div className={`border rounded-lg p-4 mb-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="font-semibold text-sm">{label}</div>
        <p className="text-sm">{children}</p>
      </div>
    </div>
  );
}
