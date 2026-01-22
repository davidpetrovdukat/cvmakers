import { Plus_Jakarta_Sans, Manrope, JetBrains_Mono } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthProvider from '@/components/providers/AuthProvider';

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin', 'latin-ext'], variable: '--font-plus-jakarta-sans', display: 'swap' });
const manrope = Manrope({ subsets: ['latin', 'latin-ext'], variable: '--font-manrope', display: 'swap' });
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin', 'latin-ext'], variable: '--font-jetbrains-mono', display: 'swap' });

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cv-makers.co.uk';

export const metadata: Metadata = {
  title: 'CV Makers - Professional CV & Resume Creator',
  description: 'Create professional CVs and resumes in minutes with CV Makers. Choose from ATS-friendly templates, use AI-powered improvements, and export to PDF or DOCX. Token-based pricing - pay only for what you use. Start building your perfect CV today.',
  keywords: 'cv, resume, cv builder, resume creator, ats friendly, professional cv, job application, career, cv makers, resume builder uk',
  authors: [{ name: 'CV Makers' }],
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
    title: 'CV Makers - Professional CV & Resume Creator',
    description: 'Create professional CVs and resumes in minutes with CV Makers. Choose from ATS-friendly templates, use AI-powered improvements, and export to PDF or DOCX. Token-based pricing - pay only for what you use.',
    type: 'website',
    locale: 'en_GB',
    url: appUrl,
    siteName: 'CV Makers',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'CV Makers - Professional CV & Resume Creator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CV Makers - Professional CV & Resume Creator',
    description: 'Create professional CVs and resumes in minutes with CV Makers. Choose from ATS-friendly templates, use AI-powered improvements, and export to PDF or DOCX.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${manrope.variable} ${jetBrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
