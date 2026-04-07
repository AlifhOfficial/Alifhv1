/**
 * Refund & Cancellation Policy Page - Revvup
 * Legal documentation
 */

import { Metadata } from 'next';
import { RefundPolicy } from '@/components/pages/legal';
const REFUND_META_DESCRIPTION =
  'Revvup refund policy for dealer subscriptions and services. Learn eligibility, timelines, and cancellations.';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy - Revvup',
  description: REFUND_META_DESCRIPTION,
  openGraph: {
    title: 'Refund & Cancellation Policy - Revvup',
    description: REFUND_META_DESCRIPTION,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Refund & Cancellation Policy - Revvup',
    description: REFUND_META_DESCRIPTION,
    images: ['/twitter-image'],
  },
};

// ISR: Static page, cached until redeploy

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <RefundPolicy />
    </div>
  );
}
