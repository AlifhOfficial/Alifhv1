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

export const metadata: Metadata = {
  title: 'Badges — Trust & Recognition | Revvup',
  description: 'Honours and recognition at Revvup. Badges are hand-picked and curated by Team Revvup. Earned, not bought. Verified sellers and dealers in UAE.',
  keywords: 'revvup badges, verified sellers uae, trusted dealers dubai, car seller verification, dealer recognition uae',
  openGraph: {
    title: 'Badges — Trust & Recognition | Revvup',
    description: 'Honours and recognition at Revvup. Badges are hand-picked and curated by Team Revvup. Earned, not bought.',
    type: 'website',
    url: 'https://revvup.ae/badges',
  },
  alternates: {
    canonical: 'https://revvup.ae/badges',
  },
};

// ISR: Static page, cached until redeploy
export const revalidate = false;

export default function BadgesPage() {
  return (
    <div className="min-h-screen bg-background">
      <BadgesHeroSection />
      <BadgesListSection />
      <BadgesClosingSection />
    </div>
  );
}
