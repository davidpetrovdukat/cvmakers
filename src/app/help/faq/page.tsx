'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { SERVICE_COSTS } from '@/lib/currency';

type FAQCategory = 'creation' | 'tools' | 'tokens' | 'export' | 'account' | 'troubleshooting';
type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
  top?: boolean;
};

const FAQ_DATA: FAQItem[] = [
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
    answer: `Pay-as-you-go with tokens. 1.00 GBP or 1.00 EUR equals 100 tokens. Actions: Create - ${SERVICE_COSTS.CREATE_DRAFT}, Create & Export PDF - ${SERVICE_COSTS.CREATE_DRAFT + SERVICE_COSTS.EXPORT_PDF}, Improve with AI - ${SERVICE_COSTS.AI_IMPROVE}, Send to personal manager - ${SERVICE_COSTS.PERSONAL_MANAGER}.`,
    category: 'tokens',
    top: true,
  },
  {
    id: 'top-drafting-cost',
    question: 'Is drafting free?',
    answer: `Create costs ${SERVICE_COSTS.CREATE_DRAFT} tokens and adds a draft to your Dashboard. You can edit it any time.`,
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
    answer: 'Yes. Choose from several professional templates (classic, split, serif, compact) and switch styles anytime before export.',
    category: 'creation',
  },
  {
    id: 'create-photo',
    question: 'Can I add a photo?',
    answer: 'Photo is optional. Each template includes a photo slot you can keep or remove.',
    category: 'creation',
  },
  {
    id: 'create-duplicate',
    question: 'Can I duplicate or version my document?',
    answer: 'Yes. Use Duplicate in the Dashboard to branch a new version without losing the original.',
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
    id: 'tools-combine',
    question: 'Can I use both: AI and personal manager?',
    answer: 'Yes. Many users create a draft, run Improve with AI, then request the personal manager for final polish.',
    category: 'tools',
  },
  {
    id: 'tokens-expire',
    question: 'Do tokens expire?',
    answer: 'No. Tokens never expire.',
    category: 'tokens',
  },
  {
    id: 'tokens-packages',
    question: 'Which top-up packages are available?',
    answer: 'Examples: 5 EUR = 500 tokens, 15 EUR = 1500 tokens, 30 EUR = 3000 tokens, plus Custom. GBP follows the same rate: 1 GBP = 100 tokens.',
    category: 'tokens',
  },
  {
    id: 'tokens-payment-methods',
    question: 'Which payment methods do you support?',
    answer: 'We accept major cards (Visa, Mastercard, Amex) and popular wallets (Apple Pay and Google Pay). Bank transfer is available for larger orders on request.',
    category: 'tokens',
  },
  {
    id: 'tokens-taxes',
    question: 'Are taxes included?',
    answer: 'Prices are shown excluding VAT. UK and EU VAT or local taxes are added at checkout based on your billing details.',
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
    answer: `PDF (print-ready) and DOCX. Create & Export PDF - ${SERVICE_COSTS.CREATE_DRAFT + SERVICE_COSTS.EXPORT_PDF} tokens generates a final PDF immediately. You can also create first, then export later.`,
    category: 'export',
  },
  {
    id: 'export-preview',
    question: 'Will the export match the preview?',
    answer: 'Yes. The A4 live preview uses print-safe spacing and fonts so the exported PDF matches exactly.',
    category: 'export',
  },
  {
    id: 'export-share',
    question: 'Can I share my CV online?',
    answer: 'Yes. Generate a private share link from your Dashboard.',
    category: 'export',
  },
  {
    id: 'account-data-storage',
    question: 'Where is my data stored?',
    answer: 'In the UK and EU with encryption in transit and at rest. We store only what is needed to provide the service and follow GDPR principles.',
    category: 'account',
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
    answer: 'From Settings -> Account you can request deletion. We remove personal data except what we must keep for accounting and tax records.',
    category: 'account',
  },
  {
    id: 'troubleshooting-pdf',
    question: 'My PDF looks different than expected.',
    answer: 'Switch to 100 percent scale in your PDF viewer and set printer margins to None. If it persists, try another template or contact support.',
    category: 'troubleshooting',
  },
  {
    id: 'troubleshooting-ai',
    question: 'The AI suggestions do not match my role.',
    answer: 'Select the section, add more context such as industry, seniority, or keywords, then run Improve with AI again. You can also request the personal manager for tailored edits.',
    category: 'troubleshooting',
  },
  {
    id: 'troubleshooting-out-of-tokens',
    question: 'I\'m out of tokens. What now?',
    answer: 'Top up from the Top-up page. The calculator will show how many tokens you need for your selected actions.',
    category: 'troubleshooting',
  },
];

const CATEGORIES = [
  { id: 'creation', label: 'Creating your CV/Resume', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'tools', label: 'Writing tools, AI & manager', color: 'bg-purple-100 text-purple-800' },
  { id: 'tokens', label: 'Tokens & payments', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'export', label: 'Export & sharing', color: 'bg-amber-100 text-amber-800' },
  { id: 'account', label: 'Account & privacy', color: 'bg-orange-100 text-orange-800' },
  { id: 'troubleshooting', label: 'Troubleshooting', color: 'bg-rose-100 text-rose-800' },
] as const;

function FAQContent() {
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

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== searchParams.get('q')) {
        const params = new URLSearchParams(searchParams);
        if (searchQuery) {
          params.set('q', searchQuery);
        } else {
          params.delete('q');
        }
        router.replace(`/help/faq?${params.toString()}`, { scroll: false });
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, searchParams, router]);

  // Filter and search FAQ items
  const filteredFAQs = useMemo(() => {
    let filtered = FAQ_DATA;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  const topQuestions = filteredFAQs.filter(item => item.top);
  const categorizedFAQs = filteredFAQs.filter(item => !item.top);

  // Group by category
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
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleHelpfulVote = (id: string, helpful: boolean) => {
    setHelpfulVotes(prev => new Set([...prev, id]));
    
    // Track analytics event
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.gtag?.('event', 'faq_vote_helpful', {
        question_id: id,
        helpful: helpful,
      });
    }

    if (!helpful) {
      setShowContactForm(id);
    }
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/help/faq#${id}`;
    navigator.clipboard.writeText(url);
    
    // Track analytics event
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.gtag?.('event', 'faq_copy_link', {
        question_id: id,
      });
    }
  };

  const submitContactForm = async (questionId: string) => {
    if (!contactMessage.trim()) return;

    // Track analytics event
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.gtag?.('event', 'faq_open_contact', {
        question_id: questionId,
        has_email: !!contactEmail,
      });
    }

    // Here you would typically send to your support system
    console.log('Contact form submitted:', { questionId, email: contactEmail, message: contactMessage });
    
    setShowContactForm(null);
    setContactEmail('');
    setContactMessage('');
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

  return (
    <main className="bg-slate-50 min-h-screen">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Frequently asked questions
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Pay-as-you-go tokens; UK & EU VAT-ready
          </p>
          
          {/* Search Bar */}
          <motion.div 
            className="max-w-2xl mx-auto mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Input
              ref={searchInputRef}
              placeholder="Search FAQs (e.g. reverse charge, tokens)"
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
                  Try: 'reverse charge', 'tokens', 'VAT', 'refund'
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Category Chips */}
          <motion.div 
            className="flex flex-wrap justify-center gap-2 mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <motion.button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              All
            </motion.button>
            {CATEGORIES.map((category, index) => (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category.label}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* Top Questions */}
        {topQuestions.length > 0 && (
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Top questions</h2>
            <div className="grid gap-4">
              {topQuestions.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  viewport={{ once: true }}
                >
                  <FAQCard
                    item={item}
                    isExpanded={expandedItems.has(item.id)}
                    onToggle={() => toggleExpanded(item.id)}
                    onCopyLink={() => copyLink(item.id)}
                    onHelpfulVote={(helpful) => handleHelpfulVote(item.id, helpful)}
                    hasVoted={helpfulVotes.has(item.id)}
                    showContactForm={showContactForm === item.id}
                    contactEmail={contactEmail}
                    contactMessage={contactMessage}
                    onContactEmailChange={setContactEmail}
                    onContactMessageChange={setContactMessage}
                    onSubmitContact={() => submitContactForm(item.id)}
                    onCloseContact={() => setShowContactForm(null)}
                    highlightQuery={searchQuery}
                    highlightText={highlightText}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Categorized FAQs */}
        {Object.entries(groupedFAQs).map(([categoryId, items]) => {
          if (items.length === 0) return null;
          
          const category = CATEGORIES.find(c => c.id === categoryId);
          if (!category) return null;

          return (
            <motion.div 
              key={categoryId} 
              id={categoryId} 
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${category.color}`}>
                  {category.label}
                </span>
              </h2>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    viewport={{ once: true }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                  >
                    <FAQCard
                      item={item}
                      isExpanded={expandedItems.has(item.id)}
                      onToggle={() => toggleExpanded(item.id)}
                      onCopyLink={() => copyLink(item.id)}
                      onHelpfulVote={(helpful) => handleHelpfulVote(item.id, helpful)}
                      hasVoted={helpfulVotes.has(item.id)}
                      showContactForm={showContactForm === item.id}
                      contactEmail={contactEmail}
                      contactMessage={contactMessage}
                      onContactEmailChange={setContactEmail}
                      onContactMessageChange={setContactMessage}
                      onSubmitContact={() => submitContactForm(item.id)}
                      onCloseContact={() => setShowContactForm(null)}
                      highlightQuery={searchQuery}
                      highlightText={highlightText}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}

        {/* No Results */}
        {filteredFAQs.length === 0 && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No results found</h3>
            <p className="text-slate-600 mb-6">
              Try different keywords or browse by category
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}>
              Clear filters
            </Button>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <motion.div 
            className="bg-white rounded-xl p-8 border border-slate-200"
            whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              Still need help?
            </h3>
            <p className="text-slate-600 mb-6">
              Can't find what you're looking for? We're here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/create-cv" size="lg">
                Open invoice generator
              </Button>
              <Button href="/pricing" size="lg" variant="outline">
                Top up tokens
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}

export default function FAQPage() {
  return (
    <Suspense fallback={
      <main className="bg-slate-50 min-h-screen">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Frequently asked questions</h1>
            <p className="text-lg text-slate-600">Loading...</p>
          </div>
        </section>
      </main>
    }>
      <FAQContent />
    </Suspense>
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
}) {
  return (
    <Card className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left p-6 hover:bg-slate-50 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-900 pr-4">
            {highlightText(item.question, highlightQuery)}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopyLink();
              }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="Copy link"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 border-t border-slate-200">
              <div className="pt-4 text-slate-700 leading-relaxed">
                {highlightText(item.answer, highlightQuery)}
              </div>

              {/* Helpful Vote */}
              {!hasVoted && (
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-600 mb-3">Did this help?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onHelpfulVote(true)}
                      className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => onHelpfulVote(false)}
                      className="px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                    >
                      No
                    </button>
                  </div>
                </div>
              )}

              {/* Contact Form */}
              <AnimatePresence>
                {showContactForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 pt-4 border-t border-slate-100"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-slate-900">Still need help?</h4>
                        <button
                          onClick={onCloseContact}
                          className="p-1 hover:bg-slate-100 rounded"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="space-y-3">
                        <Input
                          type="email"
                          placeholder="Your email (optional)"
                          value={contactEmail}
                          onChange={(e) => onContactEmailChange(e.target.value)}
                        />
                        <textarea
                          placeholder="What can we help you with?"
                          value={contactMessage}
                          onChange={(e) => onContactMessageChange(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={onSubmitContact}
                            disabled={!contactMessage.trim()}
                            size="sm"
                          >
                            Send message
                          </Button>
                          <Button
                            href="/contact"
                            variant="outline"
                            size="sm"
                          >
                            Contact support
                          </Button>
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








