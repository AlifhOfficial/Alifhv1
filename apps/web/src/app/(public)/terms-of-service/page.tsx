/**
 * Terms of Service Page - Revvup
 * Legal documentation
 */

import { Metadata } from 'next';
import { TermsOfService } from '@/components/pages/legal';
import { REVVUP_META_DESCRIPTION } from '@/lib/brand-messaging';

export const metadata: Metadata = {
  title: 'Terms of Service - Revvup',
  description: REVVUP_META_DESCRIPTION,
  openGraph: {
    title: 'Terms of Service - Revvup',
    description: REVVUP_META_DESCRIPTION,
    type: 'website',
  },
};

// ISR: Static page, cached until redeploy

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <TermsOfService />
    </div>
  );
}
