/**
 * How Ranking Works - Revvup
 * Principles-based explainer, not algorithm documentation
 */

import { Metadata } from 'next';
import { HowRankingWorksPage } from '@/components/pages/how-ranking-works/how-ranking-works-page';

export const metadata: Metadata = {
  title: 'How Ranking Works — No Paid Boosts | Revvup',
  description: 'Revvup does not sell boosts or promoted listings. Listings rank based on quality, transparency, and genuine buyer interest — not payment. Fair marketplace for all.',
  keywords: 'car listing ranking, no paid boosts, fair marketplace uae, how listings rank, car marketplace transparency',
  openGraph: {
    title: 'How Ranking Works — No Paid Boosts | Revvup',
    description: 'Listings rank based on quality, transparency, and genuine buyer interest — not payment.',
    type: 'website',
    url: 'https://revvup.ae/how-ranking-works',
  },
  alternates: {
    canonical: 'https://revvup.ae/how-ranking-works',
  },
};

// ISR: Static page, cached until redeploy
export const revalidate = false;

export default function Page() {
  return <HowRankingWorksPage />;
}
