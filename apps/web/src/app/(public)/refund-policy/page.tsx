/**
 * Refund & Cancellation Policy Page - Revvup
 * Legal documentation
 */

import { Metadata } from 'next';
import { RefundPolicy } from '@/components/pages/legal';
import { REVVUP_META_DESCRIPTION } from '@/lib/brand-messaging';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy - Revvup',
  description: REVVUP_META_DESCRIPTION,
  openGraph: {
    title: 'Refund & Cancellation Policy - Revvup',
    description: REVVUP_META_DESCRIPTION,
    type: 'website',
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
