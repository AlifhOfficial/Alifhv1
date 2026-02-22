/**
 * Pricing Page - Revvup
 * Simple. Transparent. No games.
 */

import {
  PricingHeroSection,
  PricingTiersSection,
  PricingFeaturesSection,
  PricingFaqSection,
} from '@/components/pages/pricing';
import { Metadata } from 'next';
import { faqData } from '@/data/faq-data';

// Get pricing FAQ items for schema
const pricingFaqItems = faqData.find((cat) => cat.id === 'pricing')?.items || [];

export const metadata: Metadata = {
  title: 'Pricing — Zero Commission, Unlimited Listings | Revvup',
  description: 'Simple, transparent pricing. Two options. Same platform. Same features. Different levels of attention. Zero commission. Unlimited listings for dealers and showrooms.',
  keywords: [
    'zero commission car marketplace',
    'no commission car sales dubai',
    'dealer pricing uae',
    'car dealer subscription uae',
    'unlimited car listings dubai',
    'dealer partner pricing',
    'car dealer platform cost',
    'automotive marketplace pricing',
    'dealership software pricing',
    'car listing subscription dubai',
    'flat fee car dealer platform',
    'no boost fees car marketplace',
    'dealer marketing cost dubai',
    'car sales platform pricing uae',
  ].join(', '),
  openGraph: {
    title: 'Pricing — Zero Commission, Unlimited Listings | Revvup',
    description: 'Simple, transparent pricing. Two options. Same platform. Zero commission. Unlimited listings.',
    type: 'website',
    url: 'https://revvup.ae/pricing',
  },
  alternates: {
    canonical: 'https://revvup.ae/pricing',
  },
};

// FAQ Schema for SEO - uses faq-data pricing section as source of truth
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: pricingFaqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

// Service Schema for SEO
const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Revvup Car Dealer Partnership',
  description: 'Zero commission car marketplace subscription for dealers. Unlimited listings, full analytics, lead management, staff accounts, and all platform tools.',
  provider: {
    '@type': 'Organization',
    name: 'Revvup',
    url: 'https://revvup.ae',
    logo: 'https://revvup.ae/icons/icon-512x512.png',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'AE',
      addressRegion: 'Dubai',
    },
  },
  areaServed: {
    '@type': 'Country',
    name: 'United Arab Emirates',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Dealer Partnership Plans',
    itemListElement: [
      {
        '@type': 'Offer',
        name: 'Flow',
        description: 'Unlimited listings, full analytics, lead management, staff accounts, and all platform tools.',
        price: '7000',
        priceCurrency: 'AED',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '7000',
          priceCurrency: 'AED',
          unitText: 'month',
          referenceQuantity: {
            '@type': 'QuantitativeValue',
            value: 1,
            unitCode: 'MON',
          },
        },
      },
      {
        '@type': 'Offer',
        name: 'Black',
        description: 'Everything in Flow, plus premium branding and dedicated support.',
        price: '21000',
        priceCurrency: 'AED',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '21000',
          priceCurrency: 'AED',
          unitText: 'month',
          referenceQuantity: {
            '@type': 'QuantitativeValue',
            value: 1,
            unitCode: 'MON',
          },
        },
      },
    ],
  },
};

// ISR: Static page, cached until redeploy
export const revalidate = false;

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* 1. Hero - Hook with core value props */}
      <PricingHeroSection />
      
      {/* 2. Tiers - Flow vs Black pricing with quick features */}
      <PricingTiersSection />
      
      {/* 3. Features - Detailed breakdown for those who want to dig deeper */}
      <PricingFeaturesSection />
      
      {/* 5. FAQ - Address objections */}
      <PricingFaqSection />
    </div>
  );
}
