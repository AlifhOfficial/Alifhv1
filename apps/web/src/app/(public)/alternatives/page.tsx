/**
 * Alternatives Guide - Why Choose Revvup
 * SEO landing page for competitor comparison traffic
 * Legal-safe: No competitor names in visible content, only in meta keywords
 */

import { Metadata } from 'next';
import { AlternativesView } from '@/components/pages/alternatives/alternatives-view';
import { faqData } from '@/data/faq-data';

// Get user FAQ items that are relevant to alternatives/comparison
const userFaqItems = faqData.find((cat) => cat.id === 'users')?.items || [];
const generalFaqItems = faqData.find((cat) => cat.id === 'general')?.items || [];
// Filter for comparison-relevant questions
const alternativesFaqItems = [
  ...userFaqItems.filter((item) =>
    item.keywords?.some((k) =>
      ['free', 'best', 'alternative', 'compare', 'dubizzle', 'cars24', 'commission', 'boost', 'verified'].includes(k)
    )
  ),
  ...generalFaqItems.filter((item) =>
    item.keywords?.some((k) =>
      ['different', 'compare', 'vs', 'boost', 'ads', 'why'].includes(k)
    )
  ),
];

export const metadata: Metadata = {
  title: 'Best Free Car Marketplace in Dubai UAE — Complete Guide 2026 | Revvup',
  description: 'Complete guide to selling and buying cars in Dubai without fees. Learn why thousands switched to free car listings, no paid boosts, and honest rankings. Compare all features and make the right choice for your car sale.',
  keywords: [
    // Competitor alternatives
    'dubizzle alternative',
    'dubicars alternative',
    'yallamotors alternative',
    'cars24 alternative',
    'shoofi alternative',
    'ayeshi alternative',
    // Free listing intent
    'free car listing dubai',
    'best place to sell car dubai',
    'car marketplace dubai',
    'alternative car marketplace uae',
    'no commission car sales',
    'free car classifieds dubai',
    'automotive marketplace uae',
    'sell car online dubai free',
    'where to list car free uae',
    // Best/comparison intent
    'best car website dubai',
    'car marketplace comparison dubai',
    'free vs paid car listing',
    'how to sell car dubai 2026',
    'best way to sell used car dubai',
    'car selling tips dubai',
    // Value prop intent
    'avoid car listing fees dubai',
    'zero commission car marketplace',
    'car listing guide dubai',
    'sell car without fees uae',
    'no boost fees car marketplace',
    'transparent car marketplace uae',
    // Location specific
    'sell car abu dhabi free',
    'car marketplace sharjah',
    'list car ajman free',
  ].join(', '),
  openGraph: {
    title: 'Best Free Car Marketplace in Dubai UAE — Complete Guide 2026',
    description: 'Complete guide to selling cars in Dubai without fees. Free forever. No listing fees. No paid boosts.',
    type: 'article',
    url: 'https://revvup.ae/alternatives',
  },
  alternates: {
    canonical: 'https://revvup.ae/alternatives',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Free Car Marketplace in Dubai UAE — Complete Guide 2026',
    description: 'Complete guide to selling cars in Dubai without fees. Free forever.',
  },
};

// FAQ Schema for SEO
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: alternativesFaqItems.slice(0, 15).map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

// Article Schema for SEO
const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Best Free Car Marketplace in Dubai UAE — Complete Guide 2026',
  description: 'Complete guide to selling and buying cars in Dubai without fees.',
  author: {
    '@type': 'Organization',
    name: 'Revvup',
    url: 'https://revvup.ae',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Revvup',
    logo: {
      '@type': 'ImageObject',
      url: 'https://revvup.ae/icons/icon-512x512.png',
    },
  },
  datePublished: '2026-01-15',
  dateModified: '2026-02-06',
  mainEntityOfPage: 'https://revvup.ae/alternatives',
};

// ISR: Static page, cached until redeploy
export const revalidate = false;

export default function AlternativesPage() {
  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <AlternativesView />
    </>
  );
}
