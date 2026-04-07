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
import { JsonLd } from '@/components/seo/json-ld';
import { faqData, type FAQItem } from '@/data/faq-data';
const PARTNER_META_DESCRIPTION =
  'Revvup partner platform for dealers: unlimited listings, lead management, analytics, and fair ranking with no boosts.';

export const metadata: Metadata = {
  title: 'Dealer Partner Program — 0% Commission, Unlimited Listings | Revvup',
  description: PARTNER_META_DESCRIPTION,
  keywords: 'zero commission car marketplace, no commission car sales dubai, dealer car marketplace subscription uae, car dealer dubai, car dealership platform uae, automotive marketplace dubai, dealer partner program uae, dubizzle for dealers, dubicars dealer, yallmotors dealers, shoofi dealers, ayeshi alternative, alternative dealer platform, flat fee car listing',
  openGraph: {
    title: 'Dealer Partner Program — 0% Commission, Unlimited Listings | Revvup',
    description: PARTNER_META_DESCRIPTION,
    type: 'website',
    url: 'https://revvup.ae/partner',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dealer Partner Program — 0% Commission, Unlimited Listings | Revvup',
    description: PARTNER_META_DESCRIPTION,
    images: ['/twitter-image'],
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

const faqPool = faqData.flatMap((category) => category.items);
const partnerFaqs: FAQItem[] = [
  'partners-no-commission',
  'partners-revvup-sells-cars',
  'partners-visibility',
  'partners-pricing',
]
  .map((id) => faqPool.find((item) => item.id === id))
  .filter((item): item is FAQItem => Boolean(item));

const partnerFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: partnerFaqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
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
      <JsonLd data={partnerFaqSchema} />

      <div className="sr-only">
        Dealer partnership summary: We don’t sell cars, we don’t take commission, and we don’t sell boosts.
        Dealers pay a flat subscription, keep margins, and listings rank by quality.
      </div>

      <PartnerHeroSection />
      <PartnerPainPointSection />
      <PartnerFlatFeeSection />
      <PartnerToolsSection />
      <PartnerRolesSection />
      <PartnerBrandSection />
      <PartnerClosingSection />

      {/* FAQ */}
      <section className="pb-20 px-4 compact:px-6 large:px-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <h2 className="text-title3 font-semibold">Common Partner Questions</h2>
          {partnerFaqs.map((faq) => (
            <div key={faq.question} className="rounded-xl border border-border/40 bg-sidebar p-5">
              <h3 className="text-subhead font-semibold">{faq.question}</h3>
              <p className="text-subhead text-muted-foreground mt-2">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
