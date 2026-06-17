import { Plus_Jakarta_Sans, Manrope, JetBrains_Mono, Noto_Sans_JP } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthProvider from '@/components/providers/AuthProvider';
import LocaleProvider from '@/i18n/LocaleProvider';
import { Locale } from '@/i18n/config';
import { getRequestLocale, getTranslator } from '@/i18n/server';

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin', 'latin-ext'], variable: '--font-plus-jakarta-sans', display: 'swap' });
const manrope = Manrope({ subsets: ['latin', 'latin-ext'], variable: '--font-manrope', display: 'swap' });
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin', 'latin-ext'], variable: '--font-jetbrains-mono', display: 'swap' });
const notoSansJp = Noto_Sans_JP({ subsets: ['latin'], variable: '--font-noto-sans-jp', display: 'swap' });

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cv-makers.co.uk';

const OG_LOCALE: Record<Locale, string> = {
  en: 'en_GB',
  tr: 'tr_TR',
  ja: 'ja_JP',
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getTranslator(locale);

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
    keywords: 'cv, resume, cv builder, resume creator, ats friendly, professional cv, job application, career, cv makers, resume builder uk',
    authors: [{ name: 'CV Makers' }],
    alternates: {
      canonical: `${appUrl}/${locale}`,
      languages: {
        en: `${appUrl}/en`,
        tr: `${appUrl}/tr`,
        ja: `${appUrl}/ja`,
      },
    },
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
        { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      ],
      shortcut: ['/favicon.ico'],
      apple: [
        { url: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' },
      ],
      other: [
        { rel: 'android-chrome-192x192', url: '/android-chrome-192x192.png', type: 'image/png', sizes: '192x192' },
        { rel: 'android-chrome-512x512', url: '/android-chrome-512x512.png', type: 'image/png', sizes: '512x512' },
      ],
    },
    openGraph: {
      title: t('metadata.title'),
      description: t('metadata.description'),
      type: 'website',
      locale: OG_LOCALE[locale],
      url: `${appUrl}/${locale}`,
      siteName: 'CV Makers',
      images: [
        {
          url: '/logo.png',
          width: 1200,
          height: 630,
          alt: t('metadata.imageAlt'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('metadata.title'),
      description: t('metadata.shortDescription'),
      images: ['/logo.png'],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getRequestLocale();

  return (
    <html lang={locale} className={`${plusJakartaSans.variable} ${manrope.variable} ${jetBrainsMono.variable} ${notoSansJp.variable}`}>
      <body className={locale === 'ja' ? 'font-japanese antialiased' : 'font-sans antialiased'}>
        <LocaleProvider locale={locale}>
          <AuthProvider>
            <Header />
            {children}
            <Footer />
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
