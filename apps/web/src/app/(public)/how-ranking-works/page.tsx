/**
 * How Ranking Works - Revvup
 * Principles-based explainer, not algorithm documentation
 */

import { Metadata } from 'next';
import { HowRankingWorksPage } from '@/components/pages/how-ranking-works/how-ranking-works-page';
const RANKING_META_DESCRIPTION =
  'See how listings rank on Revvup. No paid boosts—photos, pricing, and listing quality determine visibility.';

export const metadata: Metadata = {
  title: 'How Ranking Works — No Paid Boosts | Revvup',
  description: RANKING_META_DESCRIPTION,
  keywords: 'car listing ranking, no paid boosts, fair marketplace uae, how listings rank, car marketplace transparency',
  openGraph: {
    title: 'How Ranking Works — No Paid Boosts | Revvup',
    description: RANKING_META_DESCRIPTION,
    type: 'website',
    url: 'https://revvup.ae/how-ranking-works',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How Ranking Works — No Paid Boosts | Revvup',
    description: RANKING_META_DESCRIPTION,
    images: ['/twitter-image'],
  },
  alternates: {
    canonical: 'https://revvup.ae/how-ranking-works',
  },
};

// ISR: Static page, cached until redeploy

export default function Page() {
  return <HowRankingWorksPage />;
}
