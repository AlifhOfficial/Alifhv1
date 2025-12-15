/**
 * Home Page - Alifh Landing
 * Public-facing homepage with hero and key sections
 */

import { HeroSection } from '@/components/home/hero-section';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alifh - The UAE\'s Most Transparent Car Marketplace',
  description: 'Buy and sell cars in the UAE with confidence. No confusion, no games—just trust, clarity, and passion for automotive excellence.',
  openGraph: {
    title: 'Alifh - The UAE\'s Most Transparent Car Marketplace',
    description: 'Buy and sell cars in the UAE with confidence. No confusion, no games—just trust, clarity, and passion for automotive excellence.',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      
      {/* Future sections can be added here */}
      {/* <FeaturedListings /> */}
      {/* <HowItWorks /> */}
      {/* <PartnerShowcase /> */}
      {/* <Testimonials /> */}
    </div>
  );
}
