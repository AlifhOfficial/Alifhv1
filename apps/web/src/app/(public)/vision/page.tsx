/**
 * Vision Page - Revvup
 * Aligned with We the UAE 2031
 */

import {
  VisionHeroSection,
  VisionPillarsSection,
  VisionCommitmentSection,
} from '@/components/pages/vision';
import { Metadata } from 'next';
const VISION_META_DESCRIPTION =
  'Revvup’s vision for a transparent UAE car market: fair ranking, no fees for sellers, and better experiences for buyers.';

export const metadata: Metadata = {
  title: 'Our Vision — Building UAE\'s Car Marketplace | Revvup',
  description: VISION_META_DESCRIPTION,
  keywords: 'revvup vision, uae car marketplace, dubai automotive future, we the uae 2031, car marketplace innovation uae',
  openGraph: {
    title: 'Our Vision — Building UAE\'s Car Marketplace | Revvup',
    description: VISION_META_DESCRIPTION,
    type: 'website',
    url: 'https://revvup.ae/vision',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Our Vision — Building UAE\'s Car Marketplace | Revvup',
    description: VISION_META_DESCRIPTION,
    images: ['/twitter-image'],
  },
  alternates: {
    canonical: 'https://revvup.ae/vision',
  },
};

// ISR: Static page, cached until redeploy

export default function VisionPage() {
  return (
    <div className="min-h-screen bg-background">
      <VisionHeroSection />
      <VisionPillarsSection />
      <VisionCommitmentSection />
    </div>
  );
}
