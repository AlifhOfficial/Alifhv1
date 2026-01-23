/**
 * How Ranking Works - Alifh
 * Principles-based explainer, not algorithm documentation
 */

import { Metadata } from 'next';
import { HowRankingWorksPage } from '@/components/pages/how-ranking-works/how-ranking-works-page';

export const metadata: Metadata = {
  title: 'How Ranking Works | Alifh',
  description: 'Alifh does not sell boosts or promoted listings. Listings rank based on quality, transparency, and genuine buyer interest — not payment.',
};

export default function Page() {
  return <HowRankingWorksPage />;
}
