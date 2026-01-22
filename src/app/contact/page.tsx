'use client';

import { motion } from 'framer-motion';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import Pill from '@/components/policy/Pill';
import ContactForm from '@/components/contact/ContactForm';

export default function ContactPage() {
  return (
    <main className="bg-slate-50 min-h-screen">
      <Section className="py-10">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-slate-900">Contact us</h1>
          <p className="mt-3 text-slate-600 text-lg">We're here to help with sales, support, and billing.</p>
        </motion.div>

        <div className="mt-10 grid lg:grid-cols-3 gap-6">
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <ContactForm />
          </motion.div>

            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                viewport={{ once: true }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
              >
                <Card className="p-6" padding="md">
                <h3 className="text-base font-semibold">Contact details</h3>
                <div className="mt-3 grid gap-3 text-sm text-slate-700">
                  <div className="flex items-center justify-between"><div>Support</div><a className="underline" href="mailto:info@cv-makers.co.uk">info@cv-makers.co.uk</a></div>
                  <div className="flex items-center justify-between"><div>Phone</div><a className="underline" href="tel:+447418601001">+44 7418 601001</a></div>
                </div>
                <div className="mt-4 text-xs text-slate-500">Hours: Mon-Fri, 09:00-18:00 (UK). Limited support on UK public holidays..</div>
              </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                viewport={{ once: true }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
              >
                <Card className="p-6" padding="md">
                <h3 className="text-base font-semibold">Offices</h3>
                <div className="mt-3 grid gap-4 text-sm text-slate-700">
                  <div>
                    <div className="font-medium">United Kingdom (Primary)</div>
                    <div>WORKING AGENT LTD</div>
                    <div>31 Auctioneers Way, Northampton, United Kingdom, NN1 1HF</div>
                  </div>
                </div>
                <div className="mt-4 h-40 rounded-xl overflow-hidden border border-black/10">
                  <iframe
                    title="CV Makers Office Location"
                    width="100%"
                    height="100%"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps?q=31%20Auctioneers%20Way%2C%20Northampton%2C%20United%20Kingdom%2C%20NN1%201HF&output=embed"
                  />
                </div>
              </Card>
              </motion.div>
            </motion.div>
        </div>

        <motion.div 
          className="mt-10 grid md:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          {[
            { title: 'Sales', desc: 'Demos, quotes, volume pricing.' },
            { title: 'Support', desc: 'Product questions & bug reports.' },
            { title: 'Billing', desc: 'Invoices, VAT, refunds.' }
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
            >
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
