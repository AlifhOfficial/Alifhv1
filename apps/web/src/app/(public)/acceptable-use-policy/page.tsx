/**
 * Acceptable Use Policy Page - Revvup
 * Legal documentation
 */

import { Metadata } from 'next';
import { AcceptableUsePolicy } from '@/components/pages/legal';

export const metadata: Metadata = {
  title: 'Acceptable Use Policy - Revvup',
  description: 'Acceptable Use Policy for REVVUP platform. Guidelines for permitted and prohibited conduct when using our services.',
  openGraph: {
    title: 'Acceptable Use Policy - Revvup',
    description: 'Acceptable Use Policy for REVVUP platform operated by AISH CAPITALS FZCO.',
    type: 'website',
  },
};

// ISR: Static page, cached until redeploy

export default function AcceptableUsePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <AcceptableUsePolicy />
    </div>
  );
}
