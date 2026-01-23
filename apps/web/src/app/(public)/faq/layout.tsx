/**
 * FAQ Layout
 * Provides metadata and JSON-LD structured data for SEO
 */

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { faqData } from '@/data/faq-data';

export const metadata: Metadata = {
  title: 'FAQ | Alifh - Help Center',
  description: 'Find answers to frequently asked questions about Alifh. Learn about free car listings, partner pricing, VIN verification, test drive booking, and more.',
  keywords: [
    'Alifh FAQ',
    'car marketplace help',
    'free car listing UAE',
    'sell car Dubai',
    'car dealer platform',
    'VIN verification',
    'test drive booking',
  ],
  alternates: {
    canonical: '/faq',
  },
  openGraph: {
    title: 'FAQ | Alifh Help Center',
    description: 'Find answers to frequently asked questions about buying and selling cars on Alifh.',
    type: 'website',
    url: '/faq',
    siteName: 'Alifh',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ | Alifh Help Center',
    description: 'Find answers to frequently asked questions about buying and selling cars on Alifh.',
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
      url: `https://alifh.ae/faq#${item.id}`,
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
