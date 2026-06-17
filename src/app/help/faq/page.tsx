'use client';

import { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { SERVICE_COSTS } from '@/lib/currency';
import { useI18n, useLocale } from '@/i18n/LocaleProvider';
import { localizePath } from '@/i18n/config';

type FAQCategory = 'creation' | 'tools' | 'tokens' | 'export' | 'account' | 'troubleshooting';
type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
  top?: boolean;
};

const CATEGORY_META: Record<FAQCategory, { color: string }> = {
  creation: { color: 'bg-indigo-100 text-indigo-800' },
  tools: { color: 'bg-purple-100 text-purple-800' },
  tokens: { color: 'bg-emerald-100 text-emerald-800' },
  export: { color: 'bg-amber-100 text-amber-800' },
  account: { color: 'bg-orange-100 text-orange-800' },
  troubleshooting: { color: 'bg-rose-100 text-rose-800' },
};

const COPY = {
  en: {
    title: 'Frequently asked questions',
    subtitle: 'Pay-as-you-go tokens; UK & EU VAT-ready',
    searchPlaceholder: 'Search FAQs (e.g. tokens, refund, PDF)',
    tryText: "Try: 'tokens', 'PDF', 'refund'",
    all: 'All',
    topQuestions: 'Top questions',
    noResultsTitle: 'No results found',
    noResultsBody: 'Try different keywords or browse by category',
    clearFilters: 'Clear filters',
    stillNeedHelp: 'Still need help?',
    stillNeedHelpBody: "Can't find what you're looking for? We're here to help.",
    createCv: 'Create my CV',
    topUpTokens: 'Top up tokens',
    copyLink: 'Copy FAQ link',
    didHelp: 'Did this help?',
    yes: 'Yes',
    no: 'No',
    contactTitle: 'Still need help?',
    emailPlaceholder: 'Your email (optional)',
    messagePlaceholder: 'What can we help you with?',
    sendMessage: 'Send message',
    contactSupport: 'Contact support',
    close: 'Close',
    categories: {
      creation: 'Creating your CV/Resume',
      tools: 'Writing tools, AI & manager',
      tokens: 'Tokens & payments',
      export: 'Export & sharing',
      account: 'Account & privacy',
      troubleshooting: 'Troubleshooting',
    },
    items: [
      {
        id: 'top-what-can-i-do',
        question: 'What can I do here?',
        answer: 'Create a CV or resume from scratch, improve your draft with built-in writing tools, or request help from a personal manager who will edit your document.',
        category: 'creation',
        top: true,
      },
      {
        id: 'top-pricing-model',
        question: 'How does pricing work?',
        answer: `Pay-as-you-go with tokens. Actions include Create: ${SERVICE_COSTS.CREATE_DRAFT}, Create & Export PDF: ${SERVICE_COSTS.CREATE_DRAFT + SERVICE_COSTS.EXPORT_PDF}, Improve with AI: ${SERVICE_COSTS.AI_IMPROVE}, Send to personal manager: ${SERVICE_COSTS.PERSONAL_MANAGER}.`,
        category: 'tokens',
        top: true,
      },
      {
        id: 'top-drafting-cost',
        question: 'Is drafting free?',
        answer: `Creating a draft costs ${SERVICE_COSTS.CREATE_DRAFT} tokens and adds it to your Dashboard. You can edit it any time.`,
        category: 'creation',
        top: true,
      },
      {
        id: 'create-ats-friendly',
        question: 'Will my document be ATS-friendly?',
        answer: 'Yes. Our templates follow common ATS reading patterns with clear headings, clean layout, and no heavy graphics.',
        category: 'creation',
      },
      {
        id: 'create-templates',
        question: 'Do you have different styles/templates?',
        answer: 'Yes. Choose from several professional templates and switch styles anytime before export.',
        category: 'creation',
      },
      {
        id: 'create-photo',
        question: 'Can I add a photo?',
        answer: 'Photo is optional. Each template includes a photo slot you can keep or remove.',
        category: 'creation',
      },
      {
        id: 'tools-improve-ai',
        question: 'What does Improve with AI do?',
        answer: `It rewrites selected sections like summary, bullets, and skills to be concise and professional. Cost: ${SERVICE_COSTS.AI_IMPROVE} tokens per run.`,
        category: 'tools',
      },
      {
        id: 'tools-personal-manager',
        question: 'Who is the personal manager and what will I get?',
        answer: `A specialist reviews your content and sends personalised edits and comments. Cost: ${SERVICE_COSTS.PERSONAL_MANAGER} tokens. First response within 3-6 hours.`,
        category: 'tools',
      },
      {
        id: 'tokens-expire',
        question: 'Do tokens expire?',
        answer: 'No. Tokens never expire.',
        category: 'tokens',
      },
      {
        id: 'tokens-payment-methods',
        question: 'Which payment methods do you support?',
        answer: 'We accept major cards and popular wallets. Bank transfer is available for larger orders on request.',
        category: 'tokens',
      },
      {
        id: 'tokens-refunds',
        question: 'Refunds',
        answer: 'Top-ups are pay-as-you-go and non-refundable once completed.',
        category: 'tokens',
      },
      {
        id: 'export-formats',
        question: 'What formats can I export to?',
        answer: 'PDF and DOCX. You can create first, then export later from your Dashboard.',
        category: 'export',
      },
      {
        id: 'export-share',
        question: 'Can I share my CV online?',
        answer: 'Yes. Generate a private share link from your Dashboard.',
        category: 'export',
      },
      {
        id: 'account-card-storage',
        question: 'Do you store card details?',
        answer: 'No. Payments are processed by a PCI-DSS compliant provider. We do not store full card numbers on our servers.',
        category: 'account',
      },
      {
        id: 'account-delete',
        question: 'How do I delete my account or data?',
        answer: 'Contact support to request deletion. We remove personal data except what we must keep for accounting and tax records.',
        category: 'account',
      },
      {
        id: 'troubleshooting-pdf',
        question: 'My PDF looks different than expected.',
        answer: 'Switch to 100 percent scale in your PDF viewer and set printer margins to None. If it persists, try another template or contact support.',
        category: 'troubleshooting',
      },
      {
        id: 'troubleshooting-out-of-tokens',
        question: "I'm out of tokens. What now?",
        answer: 'Top up from the Top-up page. The calculator will show how many tokens you need for your selected actions.',
        category: 'troubleshooting',
      },
    ] satisfies FAQItem[],
  },
  tr: {
    title: 'Sık sorulan sorular',
    subtitle: 'Kullandıkça öde token sistemi; UK ve AB KDV süreçlerine hazır',
    searchPlaceholder: 'SSS içinde ara (örn. token, iade, PDF)',
    tryText: "Deneyin: 'token', 'PDF', 'iade'",
    all: 'Tümü',
    topQuestions: 'Öne çıkan sorular',
    noResultsTitle: 'Sonuç bulunamadı',
    noResultsBody: 'Farklı anahtar kelimeler deneyin veya kategoriye göre gezinin',
    clearFilters: 'Filtreleri temizle',
    stillNeedHelp: 'Hâlâ yardıma mı ihtiyacınız var?',
    stillNeedHelpBody: 'Aradığınızı bulamadıysanız size yardımcı olabiliriz.',
    createCv: 'CV oluştur',
    topUpTokens: 'Token yükle',
    copyLink: 'SSS bağlantısını kopyala',
    didHelp: 'Bu yardımcı oldu mu?',
    yes: 'Evet',
    no: 'Hayır',
    contactTitle: 'Hâlâ yardıma mı ihtiyacınız var?',
    emailPlaceholder: 'E-posta adresiniz (isteğe bağlı)',
    messagePlaceholder: 'Size nasıl yardımcı olabiliriz?',
    sendMessage: 'Mesaj gönder',
    contactSupport: 'Destekle iletişime geç',
    close: 'Kapat',
    categories: {
      creation: 'CV/Özgeçmiş oluşturma',
      tools: 'Yazım araçları, yapay zekâ ve yönetici',
      tokens: 'Tokenlar ve ödemeler',
      export: 'Dışa aktarma ve paylaşım',
      account: 'Hesap ve gizlilik',
      troubleshooting: 'Sorun giderme',
    },
    items: [
      {
        id: 'top-what-can-i-do',
        question: 'Burada ne yapabilirim?',
        answer: 'Sıfırdan CV veya özgeçmiş oluşturabilir, taslağınızı yerleşik yazım araçlarıyla iyileştirebilir ya da belgenizi düzenleyecek kişisel yöneticiden destek isteyebilirsiniz.',
        category: 'creation',
        top: true,
      },
      {
        id: 'top-pricing-model',
        question: 'Fiyatlandırma nasıl çalışır?',
        answer: `Token bazlı kullandıkça öde modeli kullanılır. İşlemler: Oluşturma: ${SERVICE_COSTS.CREATE_DRAFT}, PDF oluşturma ve dışa aktarma: ${SERVICE_COSTS.CREATE_DRAFT + SERVICE_COSTS.EXPORT_PDF}, Yapay zekâ ile iyileştirme: ${SERVICE_COSTS.AI_IMPROVE}, Kişisel yöneticiye gönderme: ${SERVICE_COSTS.PERSONAL_MANAGER}.`,
        category: 'tokens',
        top: true,
      },
      {
        id: 'top-drafting-cost',
        question: 'Taslak oluşturmak ücretsiz mi?',
        answer: `Taslak oluşturma ${SERVICE_COSTS.CREATE_DRAFT} token tutar ve belge Dashboard'a eklenir. Daha sonra istediğiniz zaman düzenleyebilirsiniz.`,
        category: 'creation',
        top: true,
      },
      {
        id: 'create-ats-friendly',
        question: 'Belgem ATS uyumlu olacak mı?',
        answer: 'Evet. Şablonlarımız net başlıklar, temiz düzen ve ağır grafik kullanmadan yaygın ATS okuma kalıplarına uygun hazırlanır.',
        category: 'creation',
      },
      {
        id: 'create-templates',
        question: 'Farklı stil veya şablonlar var mı?',
        answer: 'Evet. Birkaç profesyonel şablon arasından seçim yapabilir ve dışa aktarmadan önce stili istediğiniz zaman değiştirebilirsiniz.',
        category: 'creation',
      },
      {
        id: 'create-photo',
        question: 'Fotoğraf ekleyebilir miyim?',
        answer: 'Fotoğraf isteğe bağlıdır. Her şablonda kullanabileceğiniz veya kaldırabileceğiniz bir fotoğraf alanı bulunur.',
        category: 'creation',
      },
      {
        id: 'tools-improve-ai',
        question: 'Yapay zekâ ile iyileştirme ne yapar?',
        answer: `Özet, maddeler ve yetkinlikler gibi seçili bölümleri daha net ve profesyonel şekilde yeniden yazar. Maliyet: işlem başına ${SERVICE_COSTS.AI_IMPROVE} token.`,
        category: 'tools',
      },
      {
        id: 'tools-personal-manager',
        question: 'Kişisel yönetici kimdir ve ne alırım?',
        answer: `Bir uzman içeriğinizi inceler, kişiselleştirilmiş düzenlemeler ve yorumlar gönderir. Maliyet: ${SERVICE_COSTS.PERSONAL_MANAGER} token. İlk yanıt 3-6 saat içinde gelir.`,
        category: 'tools',
      },
      {
        id: 'tokens-expire',
        question: 'Tokenların süresi dolar mı?',
        answer: 'Hayır. Tokenların süresi dolmaz.',
        category: 'tokens',
      },
      {
        id: 'tokens-payment-methods',
        question: 'Hangi ödeme yöntemlerini destekliyorsunuz?',
        answer: 'Başlıca kartları ve popüler cüzdanları kabul ediyoruz. Daha yüksek tutarlar için talep üzerine banka havalesi kullanılabilir.',
        category: 'tokens',
      },
      {
        id: 'tokens-refunds',
        question: 'İadeler',
        answer: 'Token yüklemeleri kullandıkça öde modelindedir ve tamamlandıktan sonra iade edilmez.',
        category: 'tokens',
      },
      {
        id: 'export-formats',
        question: 'Hangi formatlarda dışa aktarabilirim?',
        answer: 'PDF ve DOCX. Önce belge oluşturabilir, daha sonra Dashboard üzerinden dışa aktarabilirsiniz.',
        category: 'export',
      },
      {
        id: 'export-share',
        question: 'CV’mi çevrimiçi paylaşabilir miyim?',
        answer: 'Evet. Dashboard üzerinden özel bir paylaşım bağlantısı oluşturabilirsiniz.',
        category: 'export',
      },
      {
        id: 'account-card-storage',
        question: 'Kart bilgilerimi saklıyor musunuz?',
        answer: 'Hayır. Ödemeler PCI-DSS uyumlu bir sağlayıcı tarafından işlenir. Sunucularımızda tam kart numarası saklamayız.',
        category: 'account',
      },
      {
        id: 'account-delete',
        question: 'Hesabımı veya verilerimi nasıl silebilirim?',
        answer: 'Silme talebi için destekle iletişime geçin. Muhasebe ve vergi kayıtları için saklamamız gerekenler dışında kişisel veriler kaldırılır.',
        category: 'account',
      },
      {
        id: 'troubleshooting-pdf',
        question: 'PDF beklediğimden farklı görünüyor.',
        answer: 'PDF görüntüleyicide ölçeği yüzde 100 yapın ve yazıcı kenar boşluklarını None olarak ayarlayın. Sorun devam ederse başka bir şablon deneyin veya destekle iletişime geçin.',
        category: 'troubleshooting',
      },
      {
        id: 'troubleshooting-out-of-tokens',
        question: 'Tokenım bitti. Ne yapmalıyım?',
        answer: 'Token yükleme sayfasından yükleme yapın. Hesaplayıcı, seçtiğiniz işlemler için kaç token gerektiğini gösterir.',
        category: 'troubleshooting',
      },
    ] satisfies FAQItem[],
  },
  ja: {
    title: 'よくある質問',
    subtitle: '従量課金のトークン制；英国・EU向けVAT対応',
    searchPlaceholder: 'FAQを検索（例：トークン、返金、PDF）',
    tryText: "検索例：「トークン」「PDF」「返金」",
    all: 'すべて',
    topQuestions: 'よくある質問',
    noResultsTitle: '検索結果が見つかりません',
    noResultsBody: '別のキーワードで検索するか、カテゴリから探してください',
    clearFilters: 'フィルターをクリア',
    stillNeedHelp: 'まだお困りですか？',
    stillNeedHelpBody: 'お探しの情報が見つからない場合は、お気軽にお問い合わせください。',
    createCv: 'CVを作成する',
    topUpTokens: 'トークンをチャージ',
    copyLink: 'FAQリンクをコピー',
    didHelp: 'お役に立ちましたか？',
    yes: 'はい',
    no: 'いいえ',
    contactTitle: 'まだお困りですか？',
    emailPlaceholder: 'メールアドレス（任意）',
    messagePlaceholder: 'お困りの内容をお聞かせください',
    sendMessage: 'メッセージを送信',
    contactSupport: 'サポートに連絡',
    close: '閉じる',
    categories: {
      creation: 'CV・職務経歴書の作成',
      tools: 'ライティングツール、AI・マネージャー',
      tokens: 'トークンとお支払い',
      export: 'エクスポートと共有',
      account: 'アカウントとプライバシー',
      troubleshooting: 'トラブルシューティング',
    },
    items: [
      {
        id: 'top-what-can-i-do',
        question: 'ここでは何ができますか？',
        answer: 'ゼロからCVや職務経歴書を作成したり、内蔵のライティングツールで下書きを改善したり、個人マネージャーに依頼してドキュメントを編集してもらうことができます。',
        category: 'creation',
        top: true,
      },
      {
        id: 'top-pricing-model',
        question: '料金体系はどのようになっていますか？',
        answer: `トークンによる従量課金制です。主な操作：作成：${SERVICE_COSTS.CREATE_DRAFT}トークン、作成とPDFエクスポート：${SERVICE_COSTS.CREATE_DRAFT + SERVICE_COSTS.EXPORT_PDF}トークン、AIで改善：${SERVICE_COSTS.AI_IMPROVE}トークン、個人マネージャーへ送信：${SERVICE_COSTS.PERSONAL_MANAGER}トークン。`,
        category: 'tokens',
        top: true,
      },
      {
        id: 'top-drafting-cost',
        question: '下書きの作成は無料ですか？',
        answer: `下書きの作成には${SERVICE_COSTS.CREATE_DRAFT}トークンが必要で、ダッシュボードに追加されます。いつでも編集できます。`,
        category: 'creation',
        top: true,
      },
      {
        id: 'create-ats-friendly',
        question: 'ドキュメントはATS対応になりますか？',
        answer: 'はい。テンプレートは明確な見出し、すっきりしたレイアウト、過度なグラフィックを使わない一般的なATSの読み取りパターンに沿って設計されています。',
        category: 'creation',
      },
      {
        id: 'create-templates',
        question: 'さまざまなスタイルやテンプレートはありますか？',
        answer: 'はい。複数のプロフェッショナルなテンプレートから選べ、エクスポート前にいつでもスタイルを変更できます。',
        category: 'creation',
      },
      {
        id: 'create-photo',
        question: '写真を追加できますか？',
        answer: '写真は任意です。各テンプレートには写真欄があり、残すことも削除することもできます。',
        category: 'creation',
      },
      {
        id: 'tools-improve-ai',
        question: 'AIで改善とは何をしますか？',
        answer: `要約、箇条書き、スキルなど選択したセクションを簡潔でプロフェッショナルな表現に書き直します。費用：1回あたり${SERVICE_COSTS.AI_IMPROVE}トークン。`,
        category: 'tools',
      },
      {
        id: 'tools-personal-manager',
        question: '個人マネージャーとは誰で、何が受け取れますか？',
        answer: `専門家が内容を確認し、パーソナライズされた編集とコメントをお送りします。費用：${SERVICE_COSTS.PERSONAL_MANAGER}トークン。初回の返信は3〜6時間以内です。`,
        category: 'tools',
      },
      {
        id: 'tokens-expire',
        question: 'トークンに有効期限はありますか？',
        answer: 'いいえ。トークンに有効期限はありません。',
        category: 'tokens',
      },
      {
        id: 'tokens-payment-methods',
        question: 'どのお支払い方法に対応していますか？',
        answer: '主要なクレジットカードや人気のウォレットに対応しています。大口のご注文については、ご要望に応じて銀行振込もご利用いただけます。',
        category: 'tokens',
      },
      {
        id: 'tokens-refunds',
        question: '返金について',
        answer: 'トークンのチャージは従量課金制であり、完了後の返金はできません。',
        category: 'tokens',
      },
      {
        id: 'export-formats',
        question: 'どの形式でエクスポートできますか？',
        answer: 'PDFとDOCXです。まず作成し、後からダッシュボードからエクスポートできます。',
        category: 'export',
      },
      {
        id: 'export-share',
        question: 'CVをオンラインで共有できますか？',
        answer: 'はい。ダッシュボードから非公開の共有リンクを生成できます。',
        category: 'export',
      },
      {
        id: 'account-card-storage',
        question: 'カード情報は保存されますか？',
        answer: 'いいえ。お支払いはPCI-DSS準拠のプロバイダーで処理されます。サーバーにカード番号の全文は保存しません。',
        category: 'account',
      },
      {
        id: 'account-delete',
        question: 'アカウントやデータを削除するにはどうすればよいですか？',
        answer: '削除をご希望の場合はサポートまでご連絡ください。会計・税務記録として保持が必要なものを除き、個人データを削除いたします。',
        category: 'account',
      },
      {
        id: 'troubleshooting-pdf',
        question: 'PDFが想定と異なる表示になります。',
        answer: 'PDFビューアで表示倍率を100%にし、印刷の余白を「なし」に設定してください。改善しない場合は別のテンプレートをお試しいただくか、サポートまでご連絡ください。',
        category: 'troubleshooting',
      },
      {
        id: 'troubleshooting-out-of-tokens',
        question: 'トークンがなくなりました。どうすればよいですか？',
        answer: 'チャージページからトークンを追加してください。計算機で選択した操作に必要なトークン数を確認できます。',
        category: 'troubleshooting',
      },
    ] satisfies FAQItem[],
  },
} as const;

function FAQContent() {
  const locale = useLocale();
  const copy = COPY[locale];
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | 'all'>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [helpfulVotes, setHelpfulVotes] = useState<Set<string>>(new Set());
  const [showContactForm, setShowContactForm] = useState<string | null>(null);
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const href = (path: string) => localizePath(path, locale);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== searchParams.get('q')) {
        const params = new URLSearchParams(searchParams);
        if (searchQuery) {
          params.set('q', searchQuery);
        } else {
          params.delete('q');
        }
        const suffix = params.toString() ? `?${params.toString()}` : '';
        router.replace(`${href('/help/faq')}${suffix}`, { scroll: false });
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, searchParams, router, locale]);

  const filteredFAQs = useMemo(() => {
    let filtered: readonly FAQItem[] = copy.items;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [copy.items, selectedCategory, searchQuery]);

  const topQuestions = filteredFAQs.filter(item => item.top);
  const categorizedFAQs = filteredFAQs.filter(item => !item.top);

  const groupedFAQs = useMemo(() => {
    const groups: Record<FAQCategory, FAQItem[]> = {
      creation: [],
      tools: [],
      tokens: [],
      export: [],
      account: [],
      troubleshooting: [],
    };
    categorizedFAQs.forEach(item => {
      groups[item.category].push(item);
    });
    return groups;
  }, [categorizedFAQs]);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}${href('/help/faq')}#${id}`;
    navigator.clipboard.writeText(url);
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark>
      ) : part
    );
  };

  const submitContactForm = () => {
    if (!contactMessage.trim()) return;
    setShowContactForm(null);
    setContactEmail('');
    setContactMessage('');
  };

  return (
    <main className="bg-slate-50 min-h-screen">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-4">{copy.title}</h1>
          <p className="text-lg text-slate-600 mb-8">{copy.subtitle}</p>

          <motion.div
            className="max-w-2xl mx-auto mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Input
              ref={searchInputRef}
              placeholder={copy.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-lg py-3"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.p
                  className="mt-2 text-sm text-slate-500"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {copy.tryText}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center gap-2 mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <CategoryButton active={selectedCategory === 'all'} onClick={() => setSelectedCategory('all')}>
              {copy.all}
            </CategoryButton>
            {(Object.keys(CATEGORY_META) as FAQCategory[]).map((category) => (
              <CategoryButton key={category} active={selectedCategory === category} onClick={() => setSelectedCategory(category)}>
                {copy.categories[category]}
              </CategoryButton>
            ))}
          </motion.div>
        </motion.div>

        {topQuestions.length > 0 && (
          <FAQGroup
            title={copy.topQuestions}
            items={topQuestions}
            expandedItems={expandedItems}
            helpfulVotes={helpfulVotes}
            showContactForm={showContactForm}
            contactEmail={contactEmail}
            contactMessage={contactMessage}
            copy={copy}
            highlightQuery={searchQuery}
            onToggle={toggleExpanded}
            onCopyLink={copyLink}
            onHelpfulVote={(id, helpful) => {
              setHelpfulVotes(prev => new Set([...prev, id]));
              if (!helpful) setShowContactForm(id);
            }}
            onContactEmailChange={setContactEmail}
            onContactMessageChange={setContactMessage}
            onSubmitContact={submitContactForm}
            onCloseContact={() => setShowContactForm(null)}
            highlightText={highlightText}
            href={href}
          />
        )}

        {(Object.keys(groupedFAQs) as FAQCategory[]).map((category) => {
          const items = groupedFAQs[category];
          if (items.length === 0) return null;
          return (
            <FAQGroup
              key={category}
              title={copy.categories[category]}
              badgeClass={CATEGORY_META[category].color}
              items={items}
              expandedItems={expandedItems}
              helpfulVotes={helpfulVotes}
              showContactForm={showContactForm}
              contactEmail={contactEmail}
              contactMessage={contactMessage}
              copy={copy}
              highlightQuery={searchQuery}
              onToggle={toggleExpanded}
              onCopyLink={copyLink}
              onHelpfulVote={(id, helpful) => {
                setHelpfulVotes(prev => new Set([...prev, id]));
                if (!helpful) setShowContactForm(id);
              }}
              onContactEmailChange={setContactEmail}
              onContactMessageChange={setContactMessage}
              onSubmitContact={submitContactForm}
              onCloseContact={() => setShowContactForm(null)}
              highlightText={highlightText}
              href={href}
            />
          );
        })}

        {filteredFAQs.length === 0 && (
          <motion.div className="text-center py-12" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">{copy.noResultsTitle}</h3>
            <p className="text-slate-600 mb-6">{copy.noResultsBody}</p>
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}>
              {copy.clearFilters}
            </Button>
          </motion.div>
        )}

        <motion.div className="mt-16 text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="bg-white rounded-xl p-8 border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">{copy.stillNeedHelp}</h3>
            <p className="text-slate-600 mb-6">{copy.stillNeedHelpBody}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href={href('/create-cv')} size="lg">{copy.createCv}</Button>
              <Button href={href('/pricing')} size="lg" variant="outline">{copy.topUpTokens}</Button>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

export default function FAQPage() {
  const locale = useLocale();
  const { t } = useI18n();
  const copy = COPY[locale];
  return (
    <Suspense fallback={
      <main className="bg-slate-50 min-h-screen">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">{copy.title}</h1>
            <p className="text-lg text-slate-600">{t('common.loading')}</p>
          </div>
        </section>
      </main>
    }>
      <FAQContent />
    </Suspense>
  );
}

function CategoryButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        active ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}

function FAQGroup(props: {
  title: string;
  badgeClass?: string;
  items: readonly FAQItem[];
  expandedItems: Set<string>;
  helpfulVotes: Set<string>;
  showContactForm: string | null;
  contactEmail: string;
  contactMessage: string;
  copy: (typeof COPY)[keyof typeof COPY];
  highlightQuery: string;
  onToggle: (id: string) => void;
  onCopyLink: (id: string) => void;
  onHelpfulVote: (id: string, helpful: boolean) => void;
  onContactEmailChange: (value: string) => void;
  onContactMessageChange: (value: string) => void;
  onSubmitContact: () => void;
  onCloseContact: () => void;
  highlightText: (text: string, query: string) => React.ReactNode;
  href: (path: string) => string;
}) {
  return (
    <motion.div className="mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        {props.badgeClass ? <span className={`px-3 py-1 rounded-full text-sm font-medium ${props.badgeClass}`}>{props.title}</span> : props.title}
      </h2>
      <div className="grid gap-4">
        {props.items.map((item, index) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05, duration: 0.4 }} viewport={{ once: true }}>
            <FAQCard
              item={item}
              isExpanded={props.expandedItems.has(item.id)}
              onToggle={() => props.onToggle(item.id)}
              onCopyLink={() => props.onCopyLink(item.id)}
              onHelpfulVote={(helpful) => props.onHelpfulVote(item.id, helpful)}
              hasVoted={props.helpfulVotes.has(item.id)}
              showContactForm={props.showContactForm === item.id}
              contactEmail={props.contactEmail}
              contactMessage={props.contactMessage}
              onContactEmailChange={props.onContactEmailChange}
              onContactMessageChange={props.onContactMessageChange}
              onSubmitContact={props.onSubmitContact}
              onCloseContact={props.onCloseContact}
              highlightQuery={props.highlightQuery}
              highlightText={props.highlightText}
              copy={props.copy}
              href={props.href}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function FAQCard({
  item,
  isExpanded,
  onToggle,
  onCopyLink,
  onHelpfulVote,
  hasVoted,
  showContactForm,
  contactEmail,
  contactMessage,
  onContactEmailChange,
  onContactMessageChange,
  onSubmitContact,
  onCloseContact,
  highlightQuery,
  highlightText,
  copy,
  href,
}: {
  item: FAQItem;
  isExpanded: boolean;
  onToggle: () => void;
  onCopyLink: () => void;
  onHelpfulVote: (helpful: boolean) => void;
  hasVoted: boolean;
  showContactForm: boolean;
  contactEmail: string;
  contactMessage: string;
  onContactEmailChange: (email: string) => void;
  onContactMessageChange: (message: string) => void;
  onSubmitContact: () => void;
  onCloseContact: () => void;
  highlightQuery: string;
  highlightText: (text: string, query: string) => React.ReactNode;
  copy: (typeof COPY)[keyof typeof COPY];
  href: (path: string) => string;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-4 p-6 hover:bg-slate-50 transition-colors">
        <button onClick={onToggle} className="flex flex-1 items-start justify-between gap-4 text-left" aria-expanded={isExpanded}>
          <h3 className="text-lg font-semibold text-slate-900 pr-4">
            {highlightText(item.question, highlightQuery)}
          </h3>
          <svg className={`mt-1 w-5 h-5 flex-shrink-0 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <button onClick={onCopyLink} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title={copy.copyLink} aria-label={copy.copyLink}>
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-6 pb-6 border-t border-slate-200">
              <div className="pt-4 text-slate-700 leading-relaxed">
                {highlightText(item.answer, highlightQuery)}
              </div>

              {!hasVoted && (
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-600 mb-3">{copy.didHelp}</p>
                  <div className="flex gap-2">
                    <button onClick={() => onHelpfulVote(true)} className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors">
                      {copy.yes}
                    </button>
                    <button onClick={() => onHelpfulVote(false)} className="px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
                      {copy.no}
                    </button>
                  </div>
                </div>
              )}

              <AnimatePresence>
                {showContactForm && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="mt-4 pt-4 border-t border-slate-100">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-slate-900">{copy.contactTitle}</h4>
                        <button onClick={onCloseContact} className="p-1 hover:bg-slate-100 rounded" aria-label={copy.close}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="space-y-3">
                        <Input type="email" placeholder={copy.emailPlaceholder} value={contactEmail} onChange={(e) => onContactEmailChange(e.target.value)} />
                        <textarea
                          placeholder={copy.messagePlaceholder}
                          value={contactMessage}
                          onChange={(e) => onContactMessageChange(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button onClick={onSubmitContact} disabled={!contactMessage.trim()} size="sm">{copy.sendMessage}</Button>
                          <Button href={href('/contact')} variant="outline" size="sm">{copy.contactSupport}</Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
