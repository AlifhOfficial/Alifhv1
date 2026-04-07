/**
 * FAQ Layout
 * Provides metadata and JSON-LD structured data for SEO
 */

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { faqData } from '@/data/faq-data';
const FAQ_META_DESCRIPTION =
  'Answers to common questions about buying, selling, fees, rankings, and test drives on Revvup.';

export const metadata: Metadata = {
  title: 'FAQ | Revvup - Help Center',
  description: FAQ_META_DESCRIPTION,
  keywords: [
    'Revvup FAQ',
    'car marketplace help',
    'free car listing UAE',
    'sell car Dubai',
    'car dealer platform',
    'test drive booking',
  ],
  alternates: {
    canonical: '/faq',
  },
  openGraph: {
    title: 'FAQ | Revvup Help Center',
    description: FAQ_META_DESCRIPTION,
    type: 'website',
    url: '/faq',
    siteName: 'Revvup',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ | Revvup Help Center',
    description: FAQ_META_DESCRIPTION,
  },
};

// Generate JSON-LD structured data for FAQPage schema
function generateFAQSchema() {
  const allQuestions = faqData.flatMap((category) =>
    category.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
      url: `https://revvup.ae/faq#${item.id}`,
    }))
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allQuestions,
  };
}

interface FAQLayoutProps {
  children: ReactNode;
}

export default function FAQLayout({ children }: FAQLayoutProps) {
  const faqSchema = generateFAQSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
