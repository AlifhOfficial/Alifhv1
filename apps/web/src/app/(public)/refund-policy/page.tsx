/**
 * Refund & Cancellation Policy Page - Alifh
 * Legal documentation
 */

import { Metadata } from 'next';
import { RefundPolicy } from '@/components/pages/legal';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy - Alifh',
  description: 'Refund and Cancellation Policy for ALIFH platform operated by AISH CAPITALS FZCO. Learn about our subscription cancellation and refund procedures.',
  openGraph: {
    title: 'Refund & Cancellation Policy - Alifh',
    description: 'Refund and Cancellation Policy for ALIFH platform operated by AISH CAPITALS FZCO.',
    type: 'website',
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <RefundPolicy />
    </div>
  );
}
