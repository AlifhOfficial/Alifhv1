/**
 * Dealer Agreement Page - Revvup
 * Legal documentation
 */

import { Metadata } from 'next';
import { DealerAgreement } from '@/components/pages/legal';
import { REVVUP_META_DESCRIPTION } from '@/lib/brand-messaging';

export const metadata: Metadata = {
  title: 'Dealer Agreement - Revvup',
  description: REVVUP_META_DESCRIPTION,
  openGraph: {
    title: 'Dealer Agreement - Revvup',
    description: REVVUP_META_DESCRIPTION,
    type: 'website',
  },
};

// ISR: Static page, cached until redeploy

export default function DealerAgreementPage() {
  return (
    <div className="min-h-screen bg-background">
      <DealerAgreement />
    </div>
  );
}
