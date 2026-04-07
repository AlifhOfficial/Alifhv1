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
import { REVVUP_META_DESCRIPTION } from '@/lib/brand-messaging';

export const metadata: Metadata = {
  title: 'Badges — Trust & Recognition | Revvup',
  description: REVVUP_META_DESCRIPTION,
  keywords: 'revvup badges, verified sellers uae, trusted dealers dubai, car seller verification, dealer recognition uae',
  openGraph: {
    title: 'Badges — Trust & Recognition | Revvup',
    description: REVVUP_META_DESCRIPTION,
    type: 'website',
    url: 'https://revvup.ae/badges',
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
