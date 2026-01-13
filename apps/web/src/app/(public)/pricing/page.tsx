/**
 * Pricing Page - Alifh
 * Simple. Transparent. No games.
 */

import {
  PricingHeroSection,
  PricingTiersSection,
  PricingCompareSection,
  PricingFaqSection,
  PricingClosingSection,
} from '@/components/pages/pricing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - Alifh',
  description: 'Simple, transparent pricing. Two options. Same platform. Same features. Different levels of attention. Zero commission. Unlimited listings.',
  openGraph: {
    title: 'Pricing - Alifh',
    description: 'Simple, transparent pricing. Two options. Same platform. Same features. Different levels of attention. Zero commission. Unlimited listings.',
    type: 'website',
  },
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <PricingHeroSection />
      <PricingTiersSection />
      <PricingCompareSection />
      <PricingFaqSection />
      <PricingClosingSection />
    </div>
  );
}
