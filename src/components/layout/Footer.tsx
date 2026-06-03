'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { localizePath, stripLocaleFromPath } from '@/i18n/config';
import { useI18n } from '@/i18n/LocaleProvider';

const PRODUCT_LINKS = [
  { key: 'nav.createCv', href: '/create-cv' },
  { key: 'nav.createResume', href: '/create-resume' },
  { key: 'nav.pricing', href: '/pricing' },
  { key: 'nav.tokenCalculator', href: '/token-calculator' },
];

const HELP_LINKS = [
  { key: 'footer.about', href: '/about' },
  { key: 'footer.faq', href: '/help/faq' },
  { key: 'footer.gettingStarted', href: '/help/getting-started' },
  { key: 'footer.billingTokens', href: '/help/billing-tokens' },
  { key: 'footer.troubleshooting', href: '/help/troubleshooting' },
  { key: 'footer.contact', href: '/contact' },
];

const LEGAL_LINKS = [
  { key: 'footer.privacy', href: '/privacy' },
  { key: 'footer.terms', href: '/terms' },
  { key: 'footer.cookies', href: '/cookies' },
  { key: 'footer.refund', href: '/refund' },
];

const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://www.instagram.com/cvmakers.uk/' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/112488156' },
];

const COMPANY_DETAILS = [
  { text: 'WORKING AGENT LTD', type: 'text' },
  { text: 'Company number 15957326', type: 'text' },
  { text: 'Academy House, 11 Dunraven Place, Bridgend, Mid Glamorgan, CF31 1JF', type: 'text' },
  { text: '+44 7418 601001', type: 'tel', href: 'tel:+447418601001' },
  { text: 'info@cv-makers.co.uk', type: 'mailto', href: 'mailto:info@cv-makers.co.uk' },
];

export default function Footer() {
  const pathname = usePathname();
  const { locale, t } = useI18n();
  const normalizedPath = stripLocaleFromPath(pathname);
  const href = (target: string) => localizePath(target, locale);

  if (normalizedPath.startsWith('/print-resume')) {
    return null;
  }

  const year = new Date().getFullYear();

  return (
    <motion.footer
      className="border-t border-[#E2E8F0] mt-10 py-12"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 text-sm md:grid-cols-5">
          <FooterColumn title={t('footer.product')} links={PRODUCT_LINKS.map((item) => ({ ...item, label: t(item.key) }))} href={href} />
          <FooterColumn title={t('footer.help')} links={HELP_LINKS.map((item) => ({ ...item, label: t(item.key) }))} href={href} />
          <FooterColumn title={t('footer.legal')} links={LEGAL_LINKS.map((item) => ({ ...item, label: t(item.key) }))} href={href} />

          <div>
            <div className="font-semibold text-slate-900">{t('footer.company')}</div>
            <ul className="mt-3 grid gap-2 text-slate-700">
              {COMPANY_DETAILS.map((item, index) => (
                <motion.li
                  key={item.text}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  viewport={{ once: true }}
                  whileHover={{ x: 4, transition: { duration: 0.2 } }}
                >
                  {item.type === 'text' ? (
                    item.text
                  ) : (
                    <a href={item.href} className="hover:underline">
                      {item.text}
                    </a>
                  )}
                </motion.li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-semibold text-slate-900">{t('footer.socials')}</div>
            <ul className="mt-3 grid gap-2 text-slate-700">
              {SOCIAL_LINKS.map((item, index) => (
                <motion.li
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  viewport={{ once: true }}
                  whileHover={{ x: 4, transition: { duration: 0.2 } }}
                >
                  <Link href={item.href} className="hover:underline">
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 text-xs text-slate-600 sm:flex-row">
          <div>© {year} WORKING AGENT LTD. {t('footer.rights')}</div>
          <div className="text-center">{t('footer.registered')}</div>
          <div className="flex items-center gap-4">
            <Image src="/visa-logo.svg" alt="Visa" width={60} height={24} className="h-6 w-auto" />
            <Image src="/mastercard-logo.svg" alt="MasterCard" width={60} height={24} className="h-10 w-auto" />
            <Image
              src="/pci-dss-compliant-logo-vector.svg"
              alt="PCI DSS compliant"
              width={120}
              height={50}
              className="h-20 w-auto"
            />
          </div>
        </div>
      </section>
    </motion.footer>
  );
}

function FooterColumn({
  title,
  links,
  href,
}: {
  title: string;
  links: { label: string; href: string }[];
  href: (target: string) => string;
}) {
  return (
    <div>
      <div className="font-semibold text-slate-900">{title}</div>
      <ul className="mt-3 grid gap-2 text-slate-700">
        {links.map((item, index) => (
          <motion.li
            key={item.href}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            viewport={{ once: true }}
            whileHover={{ x: 4, transition: { duration: 0.2 } }}
          >
            <Link href={href(item.href)} className="hover:underline">
              {item.label}
            </Link>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
