/**
 * About Us Page - Revvup
 * Philosophical. Clean. Mystique.
 */

import { Metadata } from 'next';
import { REVVUP_META_DESCRIPTION } from '@/lib/brand-messaging';
import {
  AboutHeroSection,
  AboutTeamSection,
  AboutStorySection,
  AboutPrinciplesSection,
  AboutVisionSection,
  AboutClosingSection,
} from '@/components/pages/about';

export const metadata: Metadata = {
  title: 'About Us — Free Car Marketplace in UAE | Revvup',
  description: REVVUP_META_DESCRIPTION,
  keywords: 'about revvup, car marketplace uae, free car listing dubai, zero commission car sales, automotive marketplace uae, sell car dubai free',
  openGraph: {
    title: 'About Us — Free Car Marketplace in UAE | Revvup',
    description: REVVUP_META_DESCRIPTION,
    type: 'website',
    url: 'https://revvup.ae/about',
  },
  alternates: {
    canonical: 'https://revvup.ae/about',
  },
};

// ISR: Static page, cached until redeploy

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <AboutHeroSection />
      <AboutTeamSection />
      <AboutStorySection />
      <AboutPrinciplesSection />
      <AboutVisionSection />
      <AboutClosingSection />
    </div>
  );
}
