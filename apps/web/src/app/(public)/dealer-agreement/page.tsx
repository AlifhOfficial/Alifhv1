/**
 * Dealer Agreement Page - Revvup
 * Legal documentation
 */

import { Metadata } from 'next';
import { DealerAgreement } from '@/components/pages/legal';

export const metadata: Metadata = {
  title: 'Dealer Agreement - Revvup',
  description: 'Dealer Agreement for REVVUP platform operated by AISH CAPITALS FZCO. Comprehensive terms governing dealer access and platform usage.',
  openGraph: {
    title: 'Dealer Agreement - Revvup',
    description: 'Dealer Agreement for REVVUP platform operated by AISH CAPITALS FZCO.',
    type: 'website',
  },
};

// ISR: Static page, cached until redeploy
export const revalidate = false;

export default function DealerAgreementPage() {
  return (
    <div className="min-h-screen bg-background">
      <DealerAgreement />
    </div>
  );
}
