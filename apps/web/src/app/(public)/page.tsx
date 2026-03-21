/**
 * Home Page - Revvup Landing
 * Public-facing homepage with hero and key sections
 */

import { HeroSection } from '@/components/pages/home/hero-section';
import {
  ProblemSection,
  DifferentiatorsSection,
  ComparisonSection,
  FeaturesSection,
} from '@/components/pages/home';
import { ClosingSection } from '@/components/pages/home/closing-section';
import { JsonLd } from '@/components/seo/json-ld';
import { generateOrganizationSchema } from '@/lib/seo-schema';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Revvup — Buy & Sell Cars in the UAE | Free. Forever.',
  description: 'The UAE\'s car marketplace built for dealers and buyers. No commissions. No listing fees. Quality-based rankings. Free forever. revvup.ae',
  keywords: 'UAE car marketplace, buy cars Dubai, sell cars UAE, used cars Dubai, car listings UAE, no commission car platform',
  openGraph: {
    title: 'Revvup — More than a marketplace.',
    description: 'UAE\'s first flat-subscription car marketplace. Dealers pay one price, rank on quality — not payment. Free for buyers. Forever.',
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
    description: 'UAE\'s first flat-subscription car marketplace. Dealers pay one price, rank on quality — not payment. Free for buyers. Forever.',
    images: ['/twitter-image'],
  },
  alternates: {
    canonical: 'https://revvup.ae',
  },
};

// ISR: Cache homepage for 1 day - content is static, rarely changes
export const revalidate = false;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* SEO: Organization Schema */}
      <JsonLd data={generateOrganizationSchema()} />
      
      <HeroSection />
      <ProblemSection />
      <DifferentiatorsSection />
      <ComparisonSection />
      <FeaturesSection />
      <ClosingSection />
    </div>
  );
}
