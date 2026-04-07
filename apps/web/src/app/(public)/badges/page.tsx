/**
 * Badges Page - Revvup
 * Honours & Recognition
 */

import {
  BadgesHeroSection,
  BadgesListSection,
  BadgesClosingSection,
} from '@/components/pages/badges';
import { Metadata } from 'next';
const BADGES_META_DESCRIPTION =
  'Revvup badges explained. Learn how quality, trust, and transparency badges help buyers choose the right cars.';

export const metadata: Metadata = {
  title: 'Badges — Trust & Recognition | Revvup',
  description: BADGES_META_DESCRIPTION,
  keywords: 'revvup badges, verified sellers uae, trusted dealers dubai, car seller verification, dealer recognition uae',
  openGraph: {
    title: 'Badges — Trust & Recognition | Revvup',
    description: BADGES_META_DESCRIPTION,
    type: 'website',
    url: 'https://revvup.ae/badges',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Badges — Trust & Recognition | Revvup',
    description: BADGES_META_DESCRIPTION,
    images: ['/twitter-image'],
  },
  alternates: {
    canonical: 'https://revvup.ae/badges',
  },
};

// ISR: Static page, cached until redeploy

export default function BadgesPage() {
  return (
    <div className="min-h-screen bg-background">
      <BadgesHeroSection />
      <BadgesListSection />
      <BadgesClosingSection />
    </div>
  );
}
