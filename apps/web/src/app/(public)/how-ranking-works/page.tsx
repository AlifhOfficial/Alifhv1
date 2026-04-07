/**
 * How Ranking Works - Revvup
 * Principles-based explainer, not algorithm documentation
 */

import { Metadata } from 'next';
import { HowRankingWorksPage } from '@/components/pages/how-ranking-works/how-ranking-works-page';
import { REVVUP_META_DESCRIPTION } from '@/lib/brand-messaging';

export const metadata: Metadata = {
  title: 'How Ranking Works — No Paid Boosts | Revvup',
  description: REVVUP_META_DESCRIPTION,
  keywords: 'car listing ranking, no paid boosts, fair marketplace uae, how listings rank, car marketplace transparency',
  openGraph: {
    title: 'How Ranking Works — No Paid Boosts | Revvup',
    description: REVVUP_META_DESCRIPTION,
    type: 'website',
    url: 'https://revvup.ae/how-ranking-works',
  },
  alternates: {
    canonical: 'https://revvup.ae/how-ranking-works',
  },
};

// ISR: Static page, cached until redeploy

export default function Page() {
  return <HowRankingWorksPage />;
}
