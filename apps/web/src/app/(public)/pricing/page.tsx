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
import { faqData, type FAQItem } from '@/data/faq-data';
import { BRAND_LOGO_SCHEMA_URL } from '@/lib/brand-assets';
const PRICING_META_DESCRIPTION =
  'Zero commission dealer pricing in the UAE. Unlimited listings, analytics, and lead tools with clear monthly plans and no hidden fees.';

// Get pricing FAQ items for schema
const pricingFaqItems = faqData.find((cat) => cat.id === 'pricing')?.items || [];
const faqPool = faqData.flatMap((category) => category.items);
const pricingVisibleFaqs: FAQItem[] = [
  'partners-no-commission',
  'partners-pricing',
  'partners-hidden-fees',
]
  .map((id) => faqPool.find((item) => item.id === id))
  .filter((item): item is FAQItem => Boolean(item));
const pricingVisibleFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: pricingVisibleFaqs.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

export const metadata: Metadata = {
  title: 'Pricing — Zero Commission, Unlimited Listings | Revvup',
  description: PRICING_META_DESCRIPTION,
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
    description: PRICING_META_DESCRIPTION,
    type: 'website',
    url: 'https://revvup.ae/pricing',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing — Zero Commission, Unlimited Listings | Revvup',
    description: PRICING_META_DESCRIPTION,
    images: ['/twitter-image'],
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
    logo: BRAND_LOGO_SCHEMA_URL,
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingVisibleFaqSchema) }}
      />
      <div className="sr-only">
        Dealer pricing summary: Flat subscription, zero commission, unlimited listings, no paid boosts,
        and rankings based on quality — not payment.
      </div>
      {/* 1. Hero - Hook with core value props */}
      <PricingHeroSection />
      
      {/* 2. Tiers - Flow vs Black pricing with quick features */}
      <PricingTiersSection />
      
      {/* 3. Features - Detailed breakdown for those who want to dig deeper */}
      <PricingFeaturesSection />
      
      {/* 5. FAQ - Address objections */}
      <PricingFaqSection />

      <section className="pb-20 px-4 compact:px-6 large:px-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <h2 className="text-title3 font-semibold">Pricing FAQs</h2>
          {pricingVisibleFaqs.map((faq) => (
            <div key={faq.id} className="rounded-xl border border-border/40 bg-sidebar p-5">
              <h3 className="text-subhead font-semibold">{faq.question}</h3>
              <p className="text-subhead text-muted-foreground mt-2">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
