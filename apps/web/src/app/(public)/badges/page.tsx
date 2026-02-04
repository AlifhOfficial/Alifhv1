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
  title: 'Badges - Revvup',
  description: 'Honours and recognition at Revvup. Badges are hand-picked and curated by Team Revvup. Earned, not bought.',
  openGraph: {
    title: 'Badges - Revvup',
    description: 'Honours and recognition at Revvup. Badges are hand-picked and curated by Team Revvup. Earned, not bought.',
    type: 'website',
  },
};

export default function BadgesPage() {
  return (
    <div className="min-h-screen bg-background">
      <BadgesHeroSection />
      <BadgesListSection />
      <BadgesClosingSection />
    </div>
  );
}
