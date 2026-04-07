/**
 * Home Page - Revvup Landing
 * Public-facing homepage with hero and key sections
 */

import { HeroSection } from '@/components/pages/home/hero-section';
import { revvupab2 } from '@/components/pages/marketing-image-assets';
import {
  ProblemSection,
  DifferentiatorsSection,
  ComparisonSection,
  FeaturesSection,
} from '@/components/pages/home';
import { ClosingSection } from '@/components/pages/home/closing-section';
import { JsonLd } from '@/components/seo/json-ld';
import { generateOrganizationSchema, generateWebsiteSchema } from '@/lib/seo-schema';
import { Metadata } from 'next';
const HOME_META_DESCRIPTION =
  'Fee-free UAE car marketplace. Browse quality listings, book test drives online, and sell your car free—no ads or paid boosts.';

export const metadata: Metadata = {
  title: 'Revvup — Buy & Sell Cars in the UAE | Free. Forever.',
  description: HOME_META_DESCRIPTION,
  keywords: 'UAE car marketplace, buy cars Dubai, sell cars UAE, used cars Dubai, car listings UAE, no commission car platform',
  openGraph: {
    title: 'Revvup — More than a marketplace.',
    description: HOME_META_DESCRIPTION,
    type: 'website',
    url: 'https://revvup.ae',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Revvup UAE car marketplace — buy and sell cars free',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Revvup — More than a marketplace.',
    description: HOME_META_DESCRIPTION,
    images: ['/twitter-image'],
  },
  alternates: {
    canonical: 'https://revvup.ae',
  },
};

// ISR: Cache homepage for 1 day - content is static, rarely changes

export default function HomePage() {
  return (
    <>
      {/* Preload LCP hero image — browser discovers it before parsing the body */}
      <link rel="preload" as="image" href={revvupab2} fetchPriority="high" />
      <div className="min-h-screen bg-background">
      {/* SEO: Organization Schema */}
      <JsonLd data={generateOrganizationSchema()} />
      <JsonLd data={generateWebsiteSchema()} />
      
      <HeroSection />
      <ProblemSection />
      <DifferentiatorsSection />
      <ComparisonSection />
      <FeaturesSection />
      <ClosingSection />
      <div className="sr-only">
        Best place to sell a car in the UAE: Revvup is fee-free for private sellers, doesn’t sell ads or boosts,
        and never competes with your inventory.
      </div>
    </div>
    </>
  );
}
