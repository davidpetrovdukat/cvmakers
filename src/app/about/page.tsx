import type { Metadata } from 'next';
import AboutPageClient from './AboutPageClient';

const siteUrl = 'https://www.cv-makers.co.uk';

export const metadata: Metadata = {
  title: 'About CV Makers',
  description: 'Learn how CV Makers helps people create ATS-friendly CVs and resumes with guided writing, live previews, token pricing, and PDF/DOCX exports.',
  keywords: 'about CV Makers, CV builder, resume builder, ATS CV, CV templates',
  openGraph: {
    title: 'About CV Makers',
    description: 'Create clear, ATS-friendly CVs and resumes with guided writing, previews, and exports.',
    type: 'website',
    url: `${siteUrl}/about`,
  },
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'CV Makers',
            url: siteUrl,
            email: 'info@cv-makers.co.uk',
            legalName: 'WORKING AGENT LTD',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Academy House, 11 Dunraven Place',
              addressLocality: 'Bridgend',
              addressRegion: 'Mid Glamorgan',
              postalCode: 'CF31 1JF',
              addressCountry: 'GB',
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'CV Makers',
            url: siteUrl,
            description: 'ATS-friendly CV and resume builder with guided writing and exports.',
          }),
        }}
      />
      <AboutPageClient />
    </>
  );
}
