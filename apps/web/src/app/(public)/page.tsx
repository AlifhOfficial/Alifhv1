/**
 * Home Page - Alifh Landing
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
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Buy and Sell Cars in Dubai | Free Forever | Alifh',
  description: 'Buy and sell new and used cars in Dubai. Free for private sellers. No fees, no ads, no paid boosts. VIN verified cars. Book test drives online. The UAE car marketplace done right.',
  keywords: 'buy cars dubai, sell cars dubai, used cars uae, new cars dubai, free car listing uae, car marketplace dubai, cars for sale uae, sell my car dubai, buy used car uae',
  openGraph: {
    title: 'Buy and Sell Cars in Dubai | Free Forever | Alifh',
    description: 'Buy and sell new and used cars in Dubai. Free for private sellers. No fees, no ads. VIN verified. Book test drives online.',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <ProblemSection />
      <DifferentiatorsSection />
      <ComparisonSection />
      <FeaturesSection />
      <ClosingSection />
    </div>
  );
}
