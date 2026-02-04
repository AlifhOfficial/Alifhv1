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
  title: 'Pricing - Revvup',
  description: 'Simple, transparent pricing. Two options. Same platform. Same features. Different levels of attention. Zero commission. Unlimited listings.',
  openGraph: {
    title: 'Pricing - Revvup',
    description: 'Simple, transparent pricing. Two options. Same platform. Same features. Different levels of attention. Zero commission. Unlimited listings.',
    type: 'website',
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
