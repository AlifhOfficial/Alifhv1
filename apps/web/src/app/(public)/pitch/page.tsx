/**
 * Pitch Page - Dealer Presentation
 * Clean pitch deck for presenting to dealers (potential clients)
 * Designed for screenshots - each section is a screenshottable slide
 */

import { DealerPitch } from '@/components/pages/pitch';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Partner with Revvup | A Marketplace That Works for Dealers',
  description: 'No commission. No games. Just a fair platform to connect you with buyers. Try it free.',
  keywords: 'car dealer partnership, automotive marketplace, dealer platform dubai, zero commission platform, car dealership uae',
  openGraph: {
    title: 'Partner with Revvup | A Marketplace That Works for Dealers',
    description: 'No commission. No games. Just a fair platform to connect you with buyers.',
    type: 'website',
  },
  robots: {
    index: false, // Keep pitch page unlisted for direct sharing
    follow: false,
  },
};

export default function PitchPage() {
  return (
    <div className="min-h-screen bg-background">
      <DealerPitch />
    </div>
  );
}
