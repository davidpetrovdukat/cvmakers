'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { SERVICE_COSTS } from '@/lib/currency';
import { useLocale } from '@/i18n/LocaleProvider';
import { localizePath } from '@/i18n/config';

type IssueCategory = 'payments' | 'tokens' | 'pdf-email' | 'login' | 'generator';

interface TroubleshootingIssue {
  id: string;
  title: string;
  category: IssueCategory;
  description: string;
  steps: readonly string[];
  links: readonly { text: string; href: string }[];
  tags: readonly string[];
}

const CATEGORY_COLORS: Record<IssueCategory | 'all', string> = {
  all: 'bg-slate-100 text-slate-800',
  payments: 'bg-green-100 text-green-800',
  tokens: 'bg-indigo-100 text-indigo-800',
  'pdf-email': 'bg-purple-100 text-purple-800',
  login: 'bg-red-100 text-red-800',
  generator: 'bg-indigo-100 text-indigo-800',
};

const COPY = {
  en: {
    title: 'Troubleshooting',
    subtitle: 'Quick solutions to common problems. Find and fix issues in minutes.',
    searchPlaceholder: 'Search problems (e.g. payment failed, PDF issues)',
    noIssuesTitle: 'No issues found',
    noIssuesBody: 'Try different keywords or browse by category',
    clearFilters: 'Clear filters',
    stillStuck: 'Still stuck?',
    stillStuckBody: "Can't find a solution? Our support team is here to help.",
    openTicket: 'Open a ticket',
    emailSupport: 'Email support',
    solved: 'Solved',
    solutionSteps: 'Solution steps:',
    markSolved: 'Mark as solved',
    didSolve: 'Did this solve your problem?',
    categories: {
      all: 'All Issues',
      payments: 'Payments',
      tokens: 'Tokens',
      'pdf-email': 'PDF/Email',
      login: 'Login',
      generator: 'Generator',
    },
    issues: [
      {
        id: 'payment-failed',
        title: 'Payment failed',
        category: 'payments',
        description: 'Your payment was declined or tokens were not added to your account.',
        steps: ['Check your billing address matches your card', 'Try a different payment method', 'Wait 2-3 minutes for processing', "If charged but no tokens: we'll add them automatically within 10 minutes", 'If still no tokens after 10 minutes: contact support with receipt'],
        links: [{ text: 'Try again', href: '/pricing' }, { text: 'Contact support', href: '/contact' }],
        tags: ['payment', 'declined', 'billing'],
      },
      {
        id: 'not-enough-tokens',
        title: 'Not enough tokens',
        category: 'tokens',
        description: "You don't have enough tokens to create a CV or resume.",
        steps: ['Check your token balance in Dashboard', 'Drafting and previewing CVs or resumes is free', 'Tokens are deducted only when you create, improve, export or send', 'Top up your account with more tokens', `Create and export PDF costs ${SERVICE_COSTS.CREATE_DRAFT + SERVICE_COSTS.EXPORT_PDF} tokens`],
        links: [{ text: 'View balance', href: '/dashboard' }, { text: 'Buy tokens', href: '/pricing' }],
        tags: ['tokens', 'balance', 'insufficient'],
      },
      {
        id: 'pdf-looks-wrong',
        title: 'PDF looks wrong',
        category: 'pdf-email',
        description: 'The generated PDF has formatting issues or missing elements.',
        steps: ['Check name, surname, email and phone number in your settings', 'Verify your photo format (PNG/JPG recommended)', 'For printing, disable shrink-to-fit in browser', 'Try another template if the layout is too dense', 'Ensure all required fields are filled'],
        links: [{ text: 'Create CV', href: '/create-cv' }, { text: 'Your settings', href: '/dashboard' }],
        tags: ['pdf', 'formatting', 'layout'],
      },
      {
        id: 'login-issues',
        title: 'Login issues',
        category: 'login',
        description: 'Cannot log in or access your account.',
        steps: ['Check that your email and password are correct', 'Clear browser cookies and cache', 'Do not block strictly necessary cookies', 'Try resetting your password', 'Contact support if you still cannot access the account'],
        links: [{ text: 'Sign in', href: '/auth/signin' }, { text: 'Account recovery', href: '/contact' }],
        tags: ['login', 'password', 'account'],
      },
      {
        id: 'slow-or-stuck',
        title: 'Slow or stuck',
        category: 'generator',
        description: 'The application is running slowly or appears frozen.',
        steps: ['Clear your browser cache and cookies', 'Disable browser extensions temporarily', 'Check your internet connection', 'Refresh the page', 'If the issue repeats, contact support with the page URL'],
        links: [{ text: 'Report issue', href: '/contact' }],
        tags: ['slow', 'performance', 'frozen'],
      },
    ] satisfies TroubleshootingIssue[],
  },
  tr: {
    title: 'Sorun giderme',
    subtitle: 'Yaygın sorunlar için hızlı çözümler. Sorunları dakikalar içinde bulun ve düzeltin.',
    searchPlaceholder: 'Sorun ara (örn. ödeme başarısız, PDF sorunu)',
    noIssuesTitle: 'Sorun bulunamadı',
    noIssuesBody: 'Farklı anahtar kelimeler deneyin veya kategoriye göre gezinin',
    clearFilters: 'Filtreleri temizle',
    stillStuck: 'Hâlâ takıldınız mı?',
    stillStuckBody: 'Çözüm bulamadıysanız destek ekibimiz yardımcı olabilir.',
    openTicket: 'Talep aç',
    emailSupport: 'Destek e-postası',
    solved: 'Çözüldü',
    solutionSteps: 'Çözüm adımları:',
    markSolved: 'Çözüldü olarak işaretle',
    didSolve: 'Bu sorununuzu çözdü mü?',
    categories: {
      all: 'Tüm Sorunlar',
      payments: 'Ödemeler',
      tokens: 'Tokenlar',
      'pdf-email': 'PDF/E-posta',
      login: 'Giriş',
      generator: 'Oluşturucu',
    },
    issues: [
      {
        id: 'payment-failed',
        title: 'Ödeme başarısız',
        category: 'payments',
        description: 'Ödemeniz reddedildi veya tokenlar hesabınıza eklenmedi.',
        steps: ['Fatura adresinizin kartınızla eşleştiğini kontrol edin', 'Farklı bir ödeme yöntemi deneyin', 'İşlem için 2-3 dakika bekleyin', 'Ücret alındı ancak token yoksa 10 dakika içinde otomatik eklenir', '10 dakika sonra hâlâ token yoksa makbuzla destekle iletişime geçin'],
        links: [{ text: 'Tekrar dene', href: '/pricing' }, { text: 'Destekle iletişime geç', href: '/contact' }],
        tags: ['ödeme', 'reddedildi', 'fatura'],
      },
      {
        id: 'not-enough-tokens',
        title: 'Yeterli token yok',
        category: 'tokens',
        description: 'CV veya özgeçmiş oluşturmak için yeterli tokenınız yok.',
        steps: ['Dashboard üzerinden token bakiyenizi kontrol edin', 'CV veya özgeçmiş taslağı hazırlama ve önizleme ücretsizdir', 'Tokenlar yalnızca oluşturma, iyileştirme, dışa aktarma veya gönderme sırasında düşülür', 'Hesabınıza daha fazla token yükleyin', `PDF oluşturma ve dışa aktarma ${SERVICE_COSTS.CREATE_DRAFT + SERVICE_COSTS.EXPORT_PDF} token tutar`],
        links: [{ text: 'Bakiyeyi görüntüle', href: '/dashboard' }, { text: 'Token satın al', href: '/pricing' }],
        tags: ['token', 'bakiye', 'yetersiz'],
      },
      {
        id: 'pdf-looks-wrong',
        title: 'PDF yanlış görünüyor',
        category: 'pdf-email',
        description: 'Oluşturulan PDF’de biçimlendirme sorunları veya eksik öğeler var.',
        steps: ['Ayarlarınızdaki ad, soyad, e-posta ve telefon numarasını kontrol edin', 'Fotoğraf formatınızı doğrulayın (PNG/JPG önerilir)', 'Yazdırma için tarayıcıda shrink-to-fit seçeneğini kapatın', 'Düzen çok yoğunsa başka bir şablon deneyin', 'Tüm gerekli alanların doldurulduğundan emin olun'],
        links: [{ text: 'CV oluştur', href: '/create-cv' }, { text: 'Ayarlarınız', href: '/dashboard' }],
        tags: ['pdf', 'biçimlendirme', 'düzen'],
      },
      {
        id: 'login-issues',
        title: 'Giriş sorunları',
        category: 'login',
        description: 'Giriş yapamıyor veya hesabınıza erişemiyorsunuz.',
        steps: ['E-posta ve şifrenizin doğru olduğunu kontrol edin', 'Tarayıcı çerezlerini ve önbelleği temizleyin', 'Zorunlu çerezleri engellemeyin', 'Şifrenizi sıfırlamayı deneyin', 'Hâlâ erişemiyorsanız destekle iletişime geçin'],
        links: [{ text: 'Giriş yap', href: '/auth/signin' }, { text: 'Hesap kurtarma', href: '/contact' }],
        tags: ['giriş', 'şifre', 'hesap'],
      },
      {
        id: 'slow-or-stuck',
        title: 'Yavaş veya takılı kaldı',
        category: 'generator',
        description: 'Uygulama yavaş çalışıyor veya donmuş gibi görünüyor.',
        steps: ['Tarayıcı önbelleğini ve çerezleri temizleyin', 'Tarayıcı eklentilerini geçici olarak devre dışı bırakın', 'İnternet bağlantınızı kontrol edin', 'Sayfayı yenileyin', 'Sorun tekrarlanırsa sayfa URL’si ile destekle iletişime geçin'],
        links: [{ text: 'Sorun bildir', href: '/contact' }],
        tags: ['yavaş', 'performans', 'donma'],
      },
    ] satisfies TroubleshootingIssue[],
  },
} as const;

export default function TroubleshootingPage() {
  const locale = useLocale();
  const copy = COPY[locale];
  const href = (path: string) => localizePath(path, locale);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | 'all'>('all');
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());
  const [solvedIssues, setSolvedIssues] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.gtag?.('event', 'ts_page_view', { page_title: 'Troubleshooting' });
    }
  }, []);

  const filteredIssues = useMemo(() => {
    let filtered: readonly TroubleshootingIssue[] = copy.issues;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(issue => issue.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(issue =>
        issue.title.toLowerCase().includes(query) ||
        issue.description.toLowerCase().includes(query) ||
        issue.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    return filtered;
  }, [copy.issues, selectedCategory, searchQuery]);

  const toggleExpanded = (issueId: string) => {
    setExpandedIssues(prev => {
      const next = new Set(prev);
      if (next.has(issueId)) next.delete(issueId);
      else next.add(issueId);
      return next;
    });
  };

  const categories = Object.keys(copy.categories) as Array<IssueCategory | 'all'>;

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">{copy.title}</h1>
          <p className="text-lg text-slate-600 mb-8">{copy.subtitle}</p>
          <motion.div className="max-w-2xl mx-auto mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Input placeholder={copy.searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full text-lg py-3" />
          </motion.div>
          <motion.div className="flex flex-wrap justify-center gap-2 mb-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {copy.categories[category]}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        <div className="grid gap-6">
          {filteredIssues.map((issue, index) => (
            <motion.div key={issue.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} viewport={{ once: true }} whileHover={{ y: -2 }}>
              <IssueCard
                issue={issue}
                categoryLabel={copy.categories[issue.category]}
                categoryColor={CATEGORY_COLORS[issue.category]}
                isExpanded={expandedIssues.has(issue.id)}
                isSolved={solvedIssues.has(issue.id)}
                copy={copy}
                href={href}
                onToggle={() => toggleExpanded(issue.id)}
                onMarkSolved={() => setSolvedIssues(prev => new Set([...prev, issue.id]))}
              />
            </motion.div>
          ))}
        </div>

        {filteredIssues.length === 0 && (
          <motion.div className="text-center py-12" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">{copy.noIssuesTitle}</h3>
            <p className="text-slate-600 mb-6">{copy.noIssuesBody}</p>
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}>{copy.clearFilters}</Button>
          </motion.div>
        )}

        <motion.div className="mt-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
            <div className="p-8 text-center">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">{copy.stillStuck}</h3>
              <p className="text-slate-600 mb-6">{copy.stillStuckBody}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button href={href('/contact')} size="lg">{copy.openTicket}</Button>
                <Button href="mailto:info@cv-makers.co.uk" variant="outline" size="lg">{copy.emailSupport}</Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}

function IssueCard({
  issue,
  categoryLabel,
  categoryColor,
  isExpanded,
  isSolved,
  copy,
  href,
  onToggle,
  onMarkSolved,
}: {
  issue: TroubleshootingIssue;
  categoryLabel: string;
  categoryColor: string;
  isExpanded: boolean;
  isSolved: boolean;
  copy: typeof COPY.en | typeof COPY.tr;
  href: (path: string) => string;
  onToggle: () => void;
  onMarkSolved: () => void;
}) {
  return (
    <Card className={`overflow-hidden ${isSolved ? 'opacity-60' : ''}`}>
      <button onClick={onToggle} className="w-full text-left p-6 hover:bg-slate-50 transition-colors" aria-expanded={isExpanded}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-slate-900">{issue.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColor}`}>{categoryLabel}</span>
              {isSolved && <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">✓ {copy.solved}</span>}
            </div>
            <p className="text-slate-600 text-sm">{issue.description}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {issue.tags.map(tag => <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">{tag}</span>)}
            </div>
          </div>
          <svg className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-6 pb-6 border-t border-slate-200">
              <div className="pt-4">
                <h4 className="font-semibold text-slate-900 mb-3">{copy.solutionSteps}</h4>
                <ol className="space-y-2 mb-6">
                  {issue.steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">{index + 1}</span>
                      <span className="text-slate-700 text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
                <div className="flex flex-wrap gap-2 mb-4">
                  {issue.links.map((link) => <Button key={link.text} href={href(link.href)} variant="outline" size="sm">{link.text}</Button>)}
                </div>
                {!isSolved && (
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    <Button onClick={onMarkSolved} size="sm" className="bg-green-600 hover:bg-green-700">✓ {copy.markSolved}</Button>
                    <span className="text-xs text-slate-500">{copy.didSolve}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
