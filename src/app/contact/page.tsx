'use client';

import { motion } from 'framer-motion';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import ContactForm from '@/components/contact/ContactForm';
import { useLocale } from '@/i18n/LocaleProvider';

const COPY = {
  en: {
    title: 'Contact us',
    subtitle: "We're here to help with sales, support, and billing.",
    details: 'Contact details',
    support: 'Support',
    phone: 'Phone',
    hours: 'Hours: Mon-Fri, 09:00-18:00 (UK). Limited support on UK public holidays.',
    offices: 'Offices',
    uk: 'United Kingdom (Primary)',
    cards: [
      { title: 'Sales', desc: 'Demos, quotes, volume pricing.' },
      { title: 'Support', desc: 'Product questions & bug reports.' },
      { title: 'Billing', desc: 'Invoices, VAT, refunds.' },
    ],
  },
  tr: {
    title: 'Bize ulaşın',
    subtitle: 'Satış, destek ve faturalandırma konularında yardımcı olmak için buradayız.',
    details: 'İletişim bilgileri',
    support: 'Destek',
    phone: 'Telefon',
    hours: 'Saatler: Pazartesi-Cuma, 09:00-18:00 (UK). UK resmi tatillerinde sınırlı destek.',
    offices: 'Ofisler',
    uk: 'Birleşik Krallık (Ana)',
    cards: [
      { title: 'Satış', desc: 'Demolar, teklifler, hacimli fiyatlandırma.' },
      { title: 'Destek', desc: 'Ürün soruları ve hata bildirimleri.' },
      { title: 'Faturalandırma', desc: 'Faturalar, KDV, iadeler.' },
    ],
  },
} as const;

export default function ContactPage() {
  const locale = useLocale();
  const copy = COPY[locale];

  return (
    <main className="bg-slate-50 min-h-screen">
      <Section className="py-10">
        <motion.div className="text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-slate-900">{copy.title}</h1>
          <p className="mt-3 text-slate-600 text-lg">{copy.subtitle}</p>
        </motion.div>

        <div className="mt-10 grid lg:grid-cols-3 gap-6">
          <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
            <ContactForm />
          </motion.div>

          <motion.div className="space-y-6" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
            <Card className="p-6" padding="md">
              <h3 className="text-base font-semibold">{copy.details}</h3>
              <div className="mt-3 grid gap-3 text-sm text-slate-700">
                <div className="flex items-center justify-between"><div>{copy.support}</div><a className="underline" href="mailto:info@cv-makers.co.uk">info@cv-makers.co.uk</a></div>
                <div className="flex items-center justify-between"><div>{copy.phone}</div><a className="underline" href="tel:+447418601001">+44 7418 601001</a></div>
              </div>
              <div className="mt-4 text-xs text-slate-500">{copy.hours}</div>
            </Card>

            <Card className="p-6" padding="md">
              <h3 className="text-base font-semibold">{copy.offices}</h3>
              <div className="mt-3 grid gap-4 text-sm text-slate-700">
                <div>
                  <div className="font-medium">{copy.uk}</div>
                  <div>WORKING AGENT LTD</div>
                  <div>Academy House, 11 Dunraven Place, Bridgend, Mid Glamorgan, CF31 1JF</div>
                </div>
              </div>
              <div className="mt-4 h-40 rounded-xl overflow-hidden border border-black/10">
                <iframe
                  title="CV Makers Office Location"
                  width="100%"
                  height="100%"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps?q=Academy%20House%2C%2011%20Dunraven%20Place%2C%20Bridgend%2C%20Mid%20Glamorgan%2C%20CF31%201JF&output=embed"
                />
              </div>
            </Card>
          </motion.div>
        </div>

        <motion.div className="mt-10 grid md:grid-cols-3 gap-4" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
          {copy.cards.map((item, index) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, duration: 0.4 }} viewport={{ once: true }} whileHover={{ y: -4, scale: 1.02 }}>
              <Card className="p-4" padding="sm">
                <div className="text-sm font-medium">{item.title}</div>
                <div className="text-slate-600 text-sm mt-1">{item.desc}</div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Section>
    </main>
  );
}
