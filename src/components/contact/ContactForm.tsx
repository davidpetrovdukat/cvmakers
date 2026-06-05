'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Label from '@/components/ui/Label';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { CURRENCY_BY_COUNTRY } from '@/lib/constants';
import { useLocale } from '@/i18n/LocaleProvider';

const COPY = {
  en: {
    title: 'Send a message',
    intro: 'Fill the form and we will reply by email.',
    name: 'Name',
    email: 'Email',
    company: 'Company',
    country: 'Country',
    topic: 'Topic',
    topics: ['Sales', 'Support', 'Billing', 'Privacy'],
    message: 'Message',
    messagePlaceholder: 'How can we help?',
    consent: 'I agree to be contacted about my request.',
    sending: 'Sending...',
    send: 'Send',
    replyTime: 'Avg. reply within 1 business day',
    failed: 'Failed to send',
    success: 'Thanks! Your request {id} has been received.',
  },
  tr: {
    title: 'Mesaj gönderin',
    intro: 'Formu doldurun; size e-posta ile dönüş yapacağız.',
    name: 'Ad Soyad',
    email: 'E-posta',
    company: 'Şirket',
    country: 'Ülke',
    topic: 'Konu',
    topics: ['Satış', 'Destek', 'Faturalandırma', 'Gizlilik'],
    message: 'Mesaj',
    messagePlaceholder: 'Size nasıl yardımcı olabiliriz?',
    consent: 'Talebim hakkında benimle iletişime geçilmesini kabul ediyorum.',
    sending: 'Gönderiliyor...',
    send: 'Gönder',
    replyTime: 'Ortalama yanıt süresi 1 iş günü',
    failed: 'Gönderilemedi',
    success: 'Teşekkürler! Talebiniz {id} alındı.',
  },
  ja: {
    title: 'メッセージを送信',
    intro: 'フォームにご記入いただければ、メールでご返信いたします。',
    name: 'お名前',
    email: 'メールアドレス',
    company: '会社名',
    country: '国',
    topic: '件名',
    topics: ['営業', 'サポート', '請求', 'プライバシー'],
    message: 'メッセージ',
    messagePlaceholder: 'どのようなご用件でしょうか？',
    consent: 'ご依頼内容についてご連絡いただくことに同意します。',
    sending: '送信中です...',
    send: '送信',
    replyTime: '平均1営業日以内に返信いたします',
    failed: '送信に失敗しました',
    success: 'ありがとうございます。お問い合わせ{id}を受け付けました。',
  },
} as const;

export default function ContactForm() {
  const locale = useLocale();
  const copy = COPY[locale];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [country, setCountry] = useState('United Kingdom');
  const [topic, setTopic] = useState('Sales');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState<null | { id: string }>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const countries = useMemo(() => Object.keys(CURRENCY_BY_COUNTRY), []);
  const canSubmit = Boolean(name.trim() && email.includes('@') && message.trim() && consent);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    setSubmitted(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company, country, topic, message }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: copy.failed }));
        throw new Error(j.error || copy.failed);
      }
      const { id } = await res.json();
      setSubmitted({ id });
      setName('');
      setEmail('');
      setCompany('');
      setMessage('');
      setConsent(false);
    } catch (e: any) {
      setError(e?.message || copy.failed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
      <Card className="p-6" padding="md">
        <h2 className="text-lg font-semibold">{copy.title}</h2>
        <p className="text-slate-600 text-sm mt-1">{copy.intro}</p>
        <form onSubmit={onSubmit} className="mt-4 grid gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{copy.name}</Label>
              <Input id="name" placeholder="Alex Johnson" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">{copy.email}</Label>
              <Input id="email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="company">{copy.company}</Label>
              <Input id="company" placeholder="Acme Ltd" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="country">{copy.country}</Label>
              <Select id="country" value={country} onChange={(e) => setCountry(e.target.value)}>
                {countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="topic">{copy.topic}</Label>
            <Select id="topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
              {copy.topics.map((item, index) => (
                <option key={item} value={COPY.en.topics[index]}>{item}</option>
              ))}
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">{copy.message}</Label>
            <Textarea id="message" rows={6} placeholder={copy.messagePlaceholder} value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
            <span>{copy.consent}</span>
          </label>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={!canSubmit || busy}>{busy ? copy.sending : copy.send}</Button>
            <span className="text-xs text-slate-500">{copy.replyTime}</span>
          </div>
          {error && <Alert variant="error">{error}</Alert>}
          {submitted && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
              <Alert variant="success">{copy.success.replace('{id}', submitted.id)}</Alert>
            </motion.div>
          )}
        </form>
      </Card>
    </motion.div>
  );
}
