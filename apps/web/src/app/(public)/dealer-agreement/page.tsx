/**
 * Dealer Agreement Page - Revvup
 * Legal documentation
 */

import { Metadata } from 'next';
import { DealerAgreement } from '@/components/pages/legal';
const DEALER_AGREEMENT_META_DESCRIPTION =
  'Dealer agreement for Revvup partners: terms for subscriptions, listings, and platform use.';

export const metadata: Metadata = {
  title: 'Dealer Agreement - Revvup',
  description: DEALER_AGREEMENT_META_DESCRIPTION,
  openGraph: {
    title: 'Dealer Agreement - Revvup',
    description: DEALER_AGREEMENT_META_DESCRIPTION,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dealer Agreement - Revvup',
    description: DEALER_AGREEMENT_META_DESCRIPTION,
    images: ['/twitter-image'],
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
