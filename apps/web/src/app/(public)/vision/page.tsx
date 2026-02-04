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
  title: 'Our Vision - Revvup',
  description: 'Revvup is built to contribute to the UAE\'s We the UAE 2031 vision. Forward society. Forward economy. Forward ecosystem.',
  openGraph: {
    title: 'Our Vision - Revvup',
    description: 'Revvup is built to contribute to the UAE\'s We the UAE 2031 vision. Forward society. Forward economy. Forward ecosystem.',
    type: 'website',
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
