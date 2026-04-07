/**
 * Privacy Policy Page - Revvup
 * Legal documentation
 */

import { Metadata } from 'next';
import { PrivacyPolicy } from '@/components/pages/legal';
import { REVVUP_META_DESCRIPTION } from '@/lib/brand-messaging';

export const metadata: Metadata = {
  title: 'Privacy Policy - Revvup',
  description: REVVUP_META_DESCRIPTION,
  openGraph: {
    title: 'Privacy Policy - Revvup',
    description: REVVUP_META_DESCRIPTION,
    type: 'website',
  },
};

// ISR: Static page, cached until redeploy

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <PrivacyPolicy />
    </div>
  );
}
