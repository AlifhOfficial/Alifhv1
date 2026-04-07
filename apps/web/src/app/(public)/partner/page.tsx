/**
 * Partner Page - Revvup Marketing
 * Public-facing partner page with compelling value proposition
 * One flat fee. Everything included. No games.
 */

import {
  PartnerHeroSection,
  PartnerPainPointSection,
  PartnerFlatFeeSection,
  PartnerToolsSection,
  PartnerRolesSection,
  PartnerBrandSection,
  PartnerClosingSection,
} from '@/components/pages/partner';
import { Metadata } from 'next';
import { BRAND_LOGO_SCHEMA_URL } from '@/lib/brand-assets';
import { REVVUP_META_DESCRIPTION } from '@/lib/brand-messaging';

export const metadata: Metadata = {
  title: 'Dealer Partner Program — 0% Commission, Unlimited Listings | Revvup',
  description: REVVUP_META_DESCRIPTION,
  keywords: 'zero commission car marketplace, no commission car sales dubai, dealer car marketplace subscription uae, car dealer dubai, car dealership platform uae, automotive marketplace dubai, dealer partner program uae, dubizzle for dealers, dubicars dealer, yallmotors dealers, shoofi dealers, ayeshi alternative, alternative dealer platform, flat fee car listing',
  openGraph: {
    title: 'Dealer Partner Program — 0% Commission, Unlimited Listings | Revvup',
    description: REVVUP_META_DESCRIPTION,
    type: 'website',
    url: 'https://revvup.ae/partner',
  },
  alternates: {
    canonical: 'https://revvup.ae/partner',
  },
};

// Service Schema for SEO
const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Revvup Dealer Partner Program',
  description: 'Zero commission car dealer platform with unlimited listings, staff accounts, analytics, test drive booking, lead management, and full brand presence. Flat monthly fee, no pay-per-listing.',
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
  serviceType: 'Car Dealer Marketplace Platform',
  offers: {
    '@type': 'Offer',
    price: '7000',
    priceCurrency: 'AED',
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: '7000',
      priceCurrency: 'AED',
      unitText: 'month',
      description: 'Per showroom, unlimited listings',
    },
  },
};

// ISR: Static page, cached until redeploy

export default function PartnerPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <PartnerHeroSection />
      <PartnerPainPointSection />
      <PartnerFlatFeeSection />
      <PartnerToolsSection />
      <PartnerRolesSection />
      <PartnerBrandSection />
      <PartnerClosingSection />
    </div>
  );
}
