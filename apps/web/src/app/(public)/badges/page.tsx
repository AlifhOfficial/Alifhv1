/**
 * Badges Page - Alifh
 * Honours & Recognition
 */

import {
  BadgesHeroSection,
  BadgesListSection,
  BadgesClosingSection,
} from '@/components/pages/badges';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Badges - Alifh',
  description: 'Honours and recognition at Alifh. Badges are hand-picked and curated by Team Alifh. Earned, not bought.',
  openGraph: {
    title: 'Badges - Alifh',
    description: 'Honours and recognition at Alifh. Badges are hand-picked and curated by Team Alifh. Earned, not bought.',
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
