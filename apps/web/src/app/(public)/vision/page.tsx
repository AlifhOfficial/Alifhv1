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

export const metadata: Metadata = {
  title: 'Our Vision — Building UAE\'s Car Marketplace | Revvup',
  description: 'Revvup is built to contribute to the UAE\'s We the UAE 2031 vision. Forward society. Forward economy. Forward ecosystem. The future of car buying and selling in Dubai.',
  keywords: 'revvup vision, uae car marketplace, dubai automotive future, we the uae 2031, car marketplace innovation uae',
  openGraph: {
    title: 'Our Vision — Building UAE\'s Car Marketplace | Revvup',
    description: 'Contributing to the UAE\'s We the UAE 2031 vision. Forward society. Forward economy. Forward ecosystem.',
    type: 'website',
    url: 'https://revvup.ae/vision',
  },
  alternates: {
    canonical: 'https://revvup.ae/vision',
  },
};

export default function VisionPage() {
  return (
    <div className="min-h-screen bg-background">
      <VisionHeroSection />
      <VisionPillarsSection />
      <VisionCommitmentSection />
    </div>
  );
}
