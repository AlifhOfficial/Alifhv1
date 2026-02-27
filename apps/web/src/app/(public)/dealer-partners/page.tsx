/**
 * Dealer Partners Page - Car Dealer Partnership Program
 * SEO landing page targeting car dealers looking for marketplace platforms
 * Heavy keyword targeting for dealer/partner search intent
 */

import { Metadata } from 'next';
import { DealerPartnersView } from '@/components/pages/dealer-partners/dealer-partners-view';
import { faqData } from '@/data/faq-data';

// Get partner FAQ items for schema
const partnerFaqItems = faqData.find((cat) => cat.id === 'partners')?.items || [];
const pricingFaqItems = faqData.find((cat) => cat.id === 'pricing')?.items || [];
const dealerFaqItems = [...partnerFaqItems, ...pricingFaqItems];

export const metadata: Metadata = {
  title: 'Car Dealer Partnership Program Dubai UAE — Zero Commission | Revvup',
  description: 'Join the only car marketplace that works FOR you, not against you. Zero commission, flat subscription, unlimited listings. We don\'t sell cars — we help YOU sell more. Founding Dealer Program now open.',
  keywords: [
    // High-intent dealer search terms
    'car dealer platform dubai',
    'automotive dealer software uae',
    'car dealership marketplace',
    'sell cars dubai dealer',
    'zero commission car platform',
    'car dealer subscription dubai',
    'dealer partner program uae',
    'automotive dealer partnership',
    'car showroom listing dubai',
    'used car dealer platform uae',
    'car dealer leads dubai',
    'dealership management software',
    'automotive sales platform uae',
    'car dealer advertising dubai',
    'dealer marketing platform',
    'car sales CRM dubai',
    'car dealer inventory management',
    'automotive dealer tools',
    'dealership growth platform dubai',
    'car trading platform uae',
    'sell more cars dubai',
    'dealer listing site uae',
    'car marketplace for dealers',
    'automotive showroom platform',
    'car dealer network uae',
    'flat fee car platform',
    'unlimited car listings dubai',
    'dealer lead generation uae',
    // Competitor alternative terms
    'dubizzle alternative dealers',
    'yallamotors alternative',
    'cars24 alternative dealers',
    'carswitch alternative uae',
    // Business model terms
    'no commission car dealer platform',
    'flat rate dealer subscription',
    'unlimited inventory listing uae',
    'car dealer software dubai',
    'automotive CRM uae',
    'showroom management system',
    'dealer inventory software dubai',
    'car sales platform emirates',
    // Intent-based terms
    'best car dealer platform dubai',
    'top automotive marketplace uae',
    'how to sell more cars dubai',
    'increase car sales dealership',
    'dealer leads automotive uae',
    'car dealership marketing dubai',
    'automotive dealer advertising',
    'showroom listing platform',
    'car dealer website alternative',
    'dealership digital marketing uae',
    // Location terms
    'car dealer abu dhabi',
    'automotive dealer sharjah',
    'car showroom ajman',
    'used car dealer ras al khaimah',
    'car trading fujairah',
  ].join(', '),
  openGraph: {
    title: 'Car Dealer Partnership Program Dubai UAE — Zero Commission',
    description: 'The only platform that works FOR you. Zero commission. Unlimited listings. We don\'t compete with you — we help you sell more.',
    type: 'website',
    url: 'https://revvup.ae/dealer-partners',
  },
  alternates: {
    canonical: 'https://revvup.ae/dealer-partners',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Car Dealer Partnership Program Dubai UAE',
    description: 'Zero commission. Unlimited listings. We help YOU sell more cars.',
  },
};

// FAQ Schema for SEO - uses faq-data as source of truth
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: dealerFaqItems.slice(0, 15).map((item) => ({
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
  name: 'Revvup Car Dealer Partnership Program',
  description: 'Zero commission car marketplace for dealers in Dubai and UAE. Flat subscription fee, unlimited listings, no pay-to-rank. We don\'t sell cars — we help dealers sell more.',
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
    sameAs: [
      'https://revvup.ae/partner',
      'https://revvup.ae/pricing',
    ],
  },
  areaServed: {
    '@type': 'Country',
    name: 'United Arab Emirates',
  },
  serviceType: 'Automotive Dealer Marketplace Platform',
  audience: {
    '@type': 'Audience',
    audienceType: 'Car Dealers, Automotive Showrooms, Used Car Dealers',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Dealer Partnership Plans',
    itemListElement: [
      {
        '@type': 'Offer',
        name: 'Flow',
        description: 'Unlimited listings, full analytics, lead management, staff accounts, test drive booking, and all platform tools.',
        price: '7000',
        priceCurrency: 'AED',
        availability: 'https://schema.org/InStock',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '7000',
          priceCurrency: 'AED',
          unitText: 'month',
        },
      },
      {
        '@type': 'Offer',
        name: 'Black',
        description: 'Everything in Flow, plus premium branding and dedicated support.',
        price: '21000',
        priceCurrency: 'AED',
        availability: 'https://schema.org/LimitedAvailability',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '21000',
          priceCurrency: 'AED',
          unitText: 'month',
        },
      },
    ],
  },
};

// ISR: Static page, cached until redeploy
export const revalidate = false;

export default function DealerPartnersPage() {
  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <DealerPartnersView />
    </>
  );
}
