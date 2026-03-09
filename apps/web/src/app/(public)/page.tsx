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
  title: 'Buy and Sell Cars in Dubai | Free Forever | Revvup',
  description: 'Buy and sell new and used cars in Dubai. Free for private sellers. No fees, no ads, no paid boosts. Book test drives online. A better alternative car marketplace.',
  keywords: 'sell my car dubai, sell car uae, used cars for sale dubai, buy used car dubai, second hand cars dubai, free car listing uae, list car free dubai, car marketplace dubai, cars for sale uae, buying used car dubai, dubai used cars, best place to sell car dubai, dubizzle alternative, dubicars alternative, yallmotors alternative, cars24 alternative, shoofi alternative, ayeshi alternative, car marketplace uae, automotive classifieds dubai',
  openGraph: {
    title: 'Buy and Sell Cars in Dubai | Free Forever | Revvup',
    description: 'Buy and sell new and used cars in Dubai. Free for private sellers. No fees, no ads. Book test drives online.',
    type: 'website',
    url: 'https://revvup.ae',
  },
  alternates: {
    canonical: 'https://revvup.ae',
  },
};

// ISR: Cache homepage for 1 day - content is static, rarely changes
export const revalidate = 86400;

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
