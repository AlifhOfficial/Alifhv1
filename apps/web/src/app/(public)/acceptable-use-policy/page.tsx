/**
 * Acceptable Use Policy Page - Revvup
 * Legal documentation
 */

import { Metadata } from 'next';
import { AcceptableUsePolicy } from '@/components/pages/legal';
import { REVVUP_META_DESCRIPTION } from '@/lib/brand-messaging';

export const metadata: Metadata = {
  title: 'Acceptable Use Policy - Revvup',
  description: REVVUP_META_DESCRIPTION,
  openGraph: {
    title: 'Acceptable Use Policy - Revvup',
    description: REVVUP_META_DESCRIPTION,
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
