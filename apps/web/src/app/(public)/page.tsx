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
  title: 'Alifh - Free Car Listings UAE | Buy & Sell Used Cars Dubai',
  description: 'List and sell used cars in UAE with zero listing fees. Best car marketplace in Dubai, Abu Dhabi, Sharjah. VIN required on every car. Book test drives online. Trusted platform for buying and selling cars in UAE. No ads, no hidden charges.',
  keywords: 'cars uae, used cars dubai, car marketplace uae, sell car uae, buy used car dubai, cars for sale uae, dubai cars, uae car listings, trusted car marketplace uae, car classifieds uae',
  openGraph: {
    title: 'Alifh - Free Car Listings UAE | Buy & Sell Used Cars Dubai',
    description: 'The trusted car marketplace in UAE. List for free, VIN required, book test drives online. Find used cars in Dubai, Abu Dhabi, Sharjah.',
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
