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

export const metadata: Metadata = {
  title: 'Pricing — Zero Commission, Unlimited Listings | Revvup',
  description: 'Simple, transparent pricing. Two options. Same platform. Same features. Different levels of attention. Zero commission. Unlimited listings for dealers and showrooms.',
  keywords: 'zero commission car marketplace, no commission car sales dubai, dealer pricing uae, car dealer subscription uae, unlimited car listings dubai, dealer partner pricing',
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

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
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
