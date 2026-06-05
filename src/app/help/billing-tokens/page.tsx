'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { CURRENCY_OPTIONS, Currency, getMinimumTopUpAmount, SERVICE_COSTS } from '@/lib/currency';
import { formatInteger } from '@/lib/format';
import { useLocale } from '@/i18n/LocaleProvider';
import { localizePath } from '@/i18n/config';

const TOKENS_PER_CURRENCY_UNIT = 100;
const TOKENS_PER_DOCUMENT = SERVICE_COSTS.CREATE_DRAFT + SERVICE_COSTS.EXPORT_PDF;
const COST_PER_DOCUMENT = (TOKENS_PER_DOCUMENT / TOKENS_PER_CURRENCY_UNIT).toFixed(2);

const TOKEN_PACKAGES = [
  { amount: 10, currency: 'GBP', tokens: 1000 },
  { amount: 50, currency: 'GBP', tokens: 5000 },
  { amount: 100, currency: 'GBP', tokens: 10000 },
  { amount: 10, currency: 'EUR', tokens: 1000 },
  { amount: 50, currency: 'EUR', tokens: 5000 },
  { amount: 100, currency: 'EUR', tokens: 10000 },
  { amount: 10, currency: 'USD', tokens: 1000 },
  { amount: 50, currency: 'USD', tokens: 5000 },
  { amount: 100, currency: 'USD', tokens: 10000 },
  { amount: 10, currency: 'TRY', tokens: 1000 },
  { amount: 50, currency: 'TRY', tokens: 5000 },
  { amount: 100, currency: 'TRY', tokens: 10000 },
  { amount: 1000, currency: 'JPY', tokens: 1000 },
  { amount: 5000, currency: 'JPY', tokens: 5000 },
  { amount: 10000, currency: 'JPY', tokens: 10000 },
];

const LEDGER_SAMPLE = [
  { date: '2024-01-15', type: 'topup', delta: 1000, balance: 1000 },
  { date: '2024-01-15', type: 'cv', delta: -TOKENS_PER_DOCUMENT, balance: 1000 - TOKENS_PER_DOCUMENT },
  { date: '2024-01-16', type: 'resume', delta: -TOKENS_PER_DOCUMENT, balance: 1000 - 2 * TOKENS_PER_DOCUMENT },
  { date: '2024-01-17', type: 'ai', delta: -SERVICE_COSTS.AI_IMPROVE, balance: 1000 - 2 * TOKENS_PER_DOCUMENT - SERVICE_COSTS.AI_IMPROVE },
  { date: '2024-01-18', type: 'topup', delta: 5000, balance: 1000 - 2 * TOKENS_PER_DOCUMENT - SERVICE_COSTS.AI_IMPROVE + 5000 },
  { date: '2024-01-19', type: 'manager', delta: -SERVICE_COSTS.PERSONAL_MANAGER, balance: 1000 - 2 * TOKENS_PER_DOCUMENT - SERVICE_COSTS.AI_IMPROVE + 5000 - SERVICE_COSTS.PERSONAL_MANAGER },
  { date: '2024-01-20', type: 'draft', delta: -SERVICE_COSTS.CREATE_DRAFT, balance: 1000 - 2 * TOKENS_PER_DOCUMENT - SERVICE_COSTS.AI_IMPROVE + 5000 - SERVICE_COSTS.PERSONAL_MANAGER - SERVICE_COSTS.CREATE_DRAFT },
];

const COPY = {
  en: {
    title: 'Billing & Tokens',
    subtitle: 'Understand our pay-as-you-go model, token pricing, and billing system.',
    howItWorks: 'How it works',
    modelCards: [
      { icon: '£', title: 'Pay-as-you-go', desc: 'No subscriptions or monthly fees', bg: 'bg-emerald-100' },
      { icon: 'T', title: '1 {currency} = 100 tokens', desc: 'Simple conversion rate', bg: 'bg-indigo-100' },
      { icon: 'PDF', title: `1 document = ${TOKENS_PER_DOCUMENT} tokens`, desc: 'Fixed cost per document', bg: 'bg-purple-100' },
    ],
    note: 'Note - your tokens never expire.',
    calculator: 'Token Calculator',
    amount: 'Amount',
    tokens: 'Tokens',
    documents: "CV's or resumes",
    costPerDocument: 'Cost per document',
    topUpTitle: 'How to top up',
    customAmounts: 'Custom amounts',
    customAmountsText: 'You can top up any amount from {currency}5 to {currency}10,000.',
    receiptsTitle: 'Receipts & Records',
    receipts: [
      { title: 'Downloadable receipts', body: 'Each top-up generates a receipt you can download from your dashboard for bookkeeping.' },
      { title: 'Ledger history', body: 'Track every token movement: top-ups, AI usage, drafts and exports in a searchable ledger.' },
      { title: 'Export options', body: 'Need an audit trail? Export ledger data as CSV or request a detailed statement from support.' },
    ],
    ledgerTitle: 'Token Ledger Sample',
    ledgerHeaders: ['Date', 'Type', 'Delta', 'Balance'],
    ledgerTypes: {
      topup: 'Top-up',
      cv: 'CV',
      resume: 'Resume',
      ai: 'AI Assist',
      manager: 'Manager Assist',
      draft: 'Draft',
    },
    refundsTitle: 'Refunds',
    refundsBody: 'Unused tokens can be refunded within 14 days of purchase. Used tokens are non-refundable. All refunds are processed to the original payment method within 5-10 business days.',
    refundPolicy: 'View Refund Policy',
    methodsTitle: 'Payment Methods & Limits',
    acceptedMethods: 'Accepted Methods',
    acceptedItems: ['Credit/Debit cards (Visa, Mastercard, Amex)', 'Apple Pay', 'Google Pay', 'Bank transfer (for large amounts)'],
    limitsTitle: 'Limits',
    limits: ['Minimum: {currency}5 per transaction', 'Maximum: {currency}10,000 per transaction', 'Daily limit: {currency}25,000', 'Fraud protection: automatic monitoring'],
    paymentIssues: 'Payment Issues',
    paymentIssuesText: 'If your payment is declined, check your card details and billing address. For large amounts, contact support for bank transfer options.',
    quickActions: 'Quick Actions',
    topUpTokens: 'Top up tokens',
    openCalculator: 'Open Token Calculator',
    needHelp: 'Need Help?',
    faq: 'View FAQ',
    contact: 'Contact Support',
    troubleshooting: 'Troubleshooting',
  },
  tr: {
    title: 'Faturalandırma ve Tokenlar',
    subtitle: 'Kullandıkça öde modelimizi, token fiyatlandırmasını ve faturalandırma sistemini anlayın.',
    howItWorks: 'Nasıl çalışır',
    modelCards: [
      { icon: '£', title: 'Kullandıkça öde', desc: 'Abonelik veya aylık ücret yok', bg: 'bg-emerald-100' },
      { icon: 'T', title: '1 {currency} = 100 token', desc: 'Basit dönüşüm oranı', bg: 'bg-indigo-100' },
      { icon: 'PDF', title: `1 belge = ${TOKENS_PER_DOCUMENT} token`, desc: 'Belge başına sabit maliyet', bg: 'bg-purple-100' },
    ],
    note: 'Not - tokenlarınızın süresi dolmaz.',
    calculator: 'Token Hesaplayıcı',
    amount: 'Tutar',
    tokens: 'Tokenlar',
    documents: 'CV veya özgeçmiş',
    costPerDocument: 'Belge başına maliyet',
    topUpTitle: 'Nasıl token yüklenir',
    customAmounts: 'Özel tutarlar',
    customAmountsText: '{currency}5 ile {currency}10.000 arasında istediğiniz tutarda yükleme yapabilirsiniz.',
    receiptsTitle: 'Makbuzlar ve Kayıtlar',
    receipts: [
      { title: 'İndirilebilir makbuzlar', body: 'Her token yüklemesi, muhasebe için dashboard üzerinden indirebileceğiniz bir makbuz oluşturur.' },
      { title: 'Hareket geçmişi', body: 'Token yüklemeleri, yapay zekâ kullanımı, taslaklar ve dışa aktarımlar dahil tüm hareketleri aranabilir kayıt üzerinden takip edin.' },
      { title: 'Dışa aktarma seçenekleri', body: 'Denetim kaydı mı gerekiyor? Hareket verilerini CSV olarak dışa aktarın veya destekten ayrıntılı hesap özeti isteyin.' },
    ],
    ledgerTitle: 'Token Hareket Örneği',
    ledgerHeaders: ['Tarih', 'Tür', 'Değişim', 'Bakiye'],
    ledgerTypes: {
      topup: 'Yükleme',
      cv: 'CV',
      resume: 'Özgeçmiş',
      ai: 'Yapay zekâ',
      manager: 'Yönetici desteği',
      draft: 'Taslak',
    },
    refundsTitle: 'İadeler',
    refundsBody: 'Kullanılmamış tokenlar satın alma tarihinden itibaren 14 gün içinde iade edilebilir. Kullanılmış tokenlar iade edilmez. Tüm iadeler 5-10 iş günü içinde orijinal ödeme yöntemine yapılır.',
    refundPolicy: 'İade Politikasını Görüntüle',
    methodsTitle: 'Ödeme Yöntemleri ve Limitler',
    acceptedMethods: 'Kabul Edilen Yöntemler',
    acceptedItems: ['Kredi/Banka kartları (Visa, Mastercard, Amex)', 'Apple Pay', 'Google Pay', 'Banka havalesi (yüksek tutarlar için)'],
    limitsTitle: 'Limitler',
    limits: ['Minimum: işlem başına {currency}5', 'Maksimum: işlem başına {currency}10.000', 'Günlük limit: {currency}25.000', 'Dolandırıcılık koruması: otomatik izleme'],
    paymentIssues: 'Ödeme Sorunları',
    paymentIssuesText: 'Ödemeniz reddedilirse kart bilgilerinizi ve fatura adresinizi kontrol edin. Yüksek tutarlar için banka havalesi seçenekleri hakkında destekle iletişime geçin.',
    quickActions: 'Hızlı İşlemler',
    topUpTokens: 'Token yükle',
    openCalculator: 'Token Hesaplayıcıyı Aç',
    needHelp: 'Yardıma mı ihtiyacınız var?',
    faq: 'SSS Görüntüle',
    contact: 'Destekle İletişime Geç',
    troubleshooting: 'Sorun Giderme',
  },
  ja: {
    title: 'お支払いとトークン',
    subtitle: '従量課金モデル、トークン料金、請求システムについてご説明します。',
    howItWorks: '仕組み',
    modelCards: [
      { icon: '£', title: '従量課金', desc: 'サブスクリプションや月額料金はありません', bg: 'bg-emerald-100' },
      { icon: 'T', title: '1 {currency} = 100トークン', desc: 'シンプルな換算レート', bg: 'bg-indigo-100' },
      { icon: 'PDF', title: `1件のドキュメント = ${TOKENS_PER_DOCUMENT}トークン`, desc: 'ドキュメントあたりの固定コスト', bg: 'bg-purple-100' },
    ],
    note: '注意 — トークンに有効期限はありません。',
    calculator: 'トークン計算機',
    amount: '金額',
    tokens: 'トークン',
    documents: 'CVまたは職務経歴書',
    costPerDocument: 'ドキュメントあたりのコスト',
    topUpTitle: 'チャージ方法',
    customAmounts: '任意の金額',
    customAmountsText: '{currency}5から{currency}10,000まで任意の金額でチャージできます。',
    receiptsTitle: '領収書と記録',
    receipts: [
      { title: 'ダウンロード可能な領収書', body: '各チャージで領収書が発行され、ダッシュボードからダウンロードして経理にご利用いただけます。' },
      { title: '利用履歴', body: 'チャージ、AI利用、下書き、エクスポートなど、すべてのトークン変動を検索可能な履歴で追跡できます。' },
      { title: 'エクスポートオプション', body: '監査用の記録が必要ですか？履歴データをCSVでエクスポートするか、サポートに詳細な明細をご依頼ください。' },
    ],
    ledgerTitle: 'トークン履歴の例',
    ledgerHeaders: ['日付', '種類', '変動', '残高'],
    ledgerTypes: {
      topup: 'チャージ',
      cv: 'CV',
      resume: '職務経歴書',
      ai: 'AIアシスト',
      manager: 'マネージャーアシスト',
      draft: '下書き',
    },
    refundsTitle: '返金',
    refundsBody: '未使用のトークンは購入から14日以内に返金できます。使用済みのトークンは返金できません。すべての返金は5〜10営業日以内に元のお支払い方法に処理されます。',
    refundPolicy: '返金ポリシーを見る',
    methodsTitle: 'お支払い方法と上限',
    acceptedMethods: '対応している方法',
    acceptedItems: ['クレジット/デビットカード（Visa、Mastercard、Amex）', 'Apple Pay', 'Google Pay', '銀行振込（大口の場合）'],
    limitsTitle: '上限',
    limits: ['最低：1回あたり{currency}5', '最高：1回あたり{currency}10,000', '1日の上限：{currency}25,000', '不正防止：自動モニタリング'],
    paymentIssues: 'お支払いの問題',
    paymentIssuesText: 'お支払いが拒否された場合は、カード情報と請求先住所をご確認ください。大口の場合は、銀行振込のオプションについてサポートまでご連絡ください。',
    quickActions: 'クイックアクション',
    topUpTokens: 'トークンをチャージ',
    openCalculator: 'トークン計算機を開く',
    needHelp: 'お困りですか？',
    faq: 'FAQを見る',
    contact: 'サポートに連絡',
    troubleshooting: 'トラブルシューティング',
  },
} as const;

export default function BillingTokensPage() {
  const locale = useLocale();
  const copy = COPY[locale];
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('GBP');
  const [customAmount, setCustomAmount] = useState<number>(10);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.gtag?.('event', 'billing_view', {
        page_title: 'Billing & Tokens',
      });
    }
  }, []);

  const handleTopUpClick = (amount?: number) => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.gtag?.('event', 'billing_click_topup', {
        amount: amount || customAmount,
        currency: selectedCurrency,
      });
    }
  };

  const calculateTokens = (amount: number) => Math.max(0, Math.round(amount * TOKENS_PER_CURRENCY_UNIT));
  const calculateDocuments = (tokens: number) => tokens / TOKENS_PER_DOCUMENT;
  const filteredPackages = TOKEN_PACKAGES.filter(pkg => pkg.currency === selectedCurrency);
  const minimumTopUp = getMinimumTopUpAmount(selectedCurrency);
  const href = (path: string) => localizePath(path, locale);

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-4">{copy.title}</h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">{copy.subtitle}</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <SectionCard>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">{copy.howItWorks}</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {copy.modelCards.map((item, index) => (
                  <motion.div
                    key={item.title}
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                  >
                    <div className={`w-16 h-16 ${item.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <span className="text-sm font-bold text-slate-800">{item.icon}</span>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">{item.title.replace('{currency}', selectedCurrency)}</h3>
                    <p className="text-sm text-slate-600">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-700">{copy.note}</p>
              </div>
            </SectionCard>

            <SectionCard>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">{copy.calculator}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {copy.amount} ({selectedCurrency})
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={minimumTopUp}
                      step="1"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(Number(e.target.value))}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value as Currency)}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      {CURRENCY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  <Metric label={copy.tokens} value={formatInteger(calculateTokens(customAmount))} />
                  <Metric label={copy.documents} value={`≈${calculateDocuments(calculateTokens(customAmount)).toFixed(2)}`} />
                  <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                    <span className="text-sm text-emerald-700">{copy.costPerDocument}</span>
                    <span className="font-semibold text-emerald-900">{selectedCurrency} {COST_PER_DOCUMENT}</span>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">{copy.topUpTitle}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredPackages.map((pkg, index) => (
                  <motion.div
                    key={`${pkg.currency}-${pkg.amount}`}
                    className="border border-slate-200 rounded-lg p-4 hover:border-emerald-300 transition-colors"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-900 mb-1">
                        {pkg.currency} {pkg.amount}
                      </div>
                      <div className="text-sm text-slate-600">
                        {formatInteger(pkg.tokens)} {copy.tokens}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-indigo-600 font-semibold text-sm">{copy.customAmounts}</div>
                  <p className="text-indigo-700 text-sm">
                    {copy.customAmountsText.replace(/\{currency\}/g, selectedCurrency)}
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">{copy.receiptsTitle}</h2>
              <div className="space-y-4">
                {copy.receipts.map((item) => (
                  <div key={item.title}>
                    <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-700 text-sm mb-3">{item.body}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">{copy.ledgerTitle}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {copy.ledgerHeaders.map((header, index) => (
                        <th key={header} className={`${index > 1 ? 'text-right' : 'text-left'} px-3 py-2 font-semibold text-slate-700`}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {LEDGER_SAMPLE.map((entry, index) => (
                      <tr key={index} className="border-t border-slate-200">
                        <td className="px-3 py-2 text-slate-600">{entry.date}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            entry.type === 'topup'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {copy.ledgerTypes[entry.type as keyof typeof copy.ledgerTypes]}
                          </span>
                        </td>
                        <td className={`px-3 py-2 text-right font-medium ${
                          entry.delta > 0 ? 'text-emerald-600' : entry.delta < 0 ? 'text-rose-600' : 'text-slate-900'
                        }`}>
                          {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
                        </td>
                        <td className="px-3 py-2 text-right font-medium">{formatInteger(entry.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">{copy.refundsTitle}</h2>
              <p className="text-slate-700 mb-4">{copy.refundsBody}</p>
              <Button href={href('/refund')} variant="outline" size="sm">
                {copy.refundPolicy}
              </Button>
            </SectionCard>

            <SectionCard>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">{copy.methodsTitle}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <ListBlock title={copy.acceptedMethods} items={copy.acceptedItems} />
                <ListBlock title={copy.limitsTitle} items={copy.limits.map((item) => item.replace(/\{currency\}/g, selectedCurrency))} />
              </div>
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-amber-600 font-semibold text-sm">{copy.paymentIssues}</div>
                  <p className="text-amber-800 text-sm">{copy.paymentIssuesText}</p>
                </div>
              </div>
            </SectionCard>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <Card>
                <div className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">{copy.quickActions}</h3>
                  <div className="space-y-3">
                    <Button
                      href={`${href('/pricing')}?amount=${customAmount}&currency=${selectedCurrency}`}
                      className="w-full"
                      onClick={() => handleTopUpClick()}
                    >
                      {copy.topUpTokens}
                    </Button>
                    <Button href={href('/token-calculator')} variant="outline" className="w-full">
                      {copy.openCalculator}
                    </Button>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">{copy.needHelp}</h3>
                  <div className="space-y-3 text-sm">
                    <Link href={href('/help/faq')} className="block text-slate-600 hover:text-slate-900">
                      {copy.faq}
                    </Link>
                    <Link href={href('/contact')} className="block text-slate-600 hover:text-slate-900">
                      {copy.contact}
                    </Link>
                    <Link href={href('/help/troubleshooting')} className="block text-slate-600 hover:text-slate-900">
                      {copy.troubleshooting}
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <Card>
        <div className="p-8">{children}</div>
      </Card>
    </motion.div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div>
      <h3 className="font-semibold text-slate-900 mb-3">{title}</h3>
      <ul className="text-sm text-slate-600 space-y-2">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
