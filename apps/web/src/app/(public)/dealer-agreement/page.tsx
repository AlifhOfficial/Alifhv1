/**
 * Dealer Agreement Page - Alifh
 * Legal documentation
 */

import { Metadata } from 'next';
import { DealerAgreement } from '@/components/pages/legal';

export const metadata: Metadata = {
  title: 'Dealer Agreement - Alifh',
  description: 'Dealer Agreement for ALIFH platform operated by AISH CAPITALS FZCO. Comprehensive terms governing dealer access and platform usage.',
  openGraph: {
    title: 'Dealer Agreement - Alifh',
    description: 'Dealer Agreement for ALIFH platform operated by AISH CAPITALS FZCO.',
    type: 'website',
  },
};

export default function DealerAgreementPage() {
  return (
    <div className="min-h-screen bg-background">
      <DealerAgreement />
    </div>
  );
}
