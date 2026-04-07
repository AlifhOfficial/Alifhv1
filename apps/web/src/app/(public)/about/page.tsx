/**
 * About Us Page - Revvup
 * Philosophical. Clean. Mystique.
 */

import { Metadata } from 'next';
const ABOUT_META_DESCRIPTION =
  'Learn how Revvup is building a fair UAE car marketplace—free listings, unbiased rankings, and better buying and selling.';
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
  description: ABOUT_META_DESCRIPTION,
  keywords: 'about revvup, car marketplace uae, free car listing dubai, zero commission car sales, automotive marketplace uae, sell car dubai free',
  openGraph: {
    title: 'About Us — Free Car Marketplace in UAE | Revvup',
    description: ABOUT_META_DESCRIPTION,
    type: 'website',
    url: 'https://revvup.ae/about',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us — Free Car Marketplace in UAE | Revvup',
    description: ABOUT_META_DESCRIPTION,
    images: ['/twitter-image'],
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
