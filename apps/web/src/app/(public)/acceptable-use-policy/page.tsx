/**
 * Acceptable Use Policy Page - Revvup
 * Legal documentation
 */

import { Metadata } from 'next';
import { AcceptableUsePolicy } from '@/components/pages/legal';
const AUP_META_DESCRIPTION =
  'Acceptable Use Policy for Revvup. Learn what’s allowed when listing and messaging on the platform.';

export const metadata: Metadata = {
  title: 'Acceptable Use Policy - Revvup',
  description: AUP_META_DESCRIPTION,
  openGraph: {
    title: 'Acceptable Use Policy - Revvup',
    description: AUP_META_DESCRIPTION,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Acceptable Use Policy - Revvup',
    description: AUP_META_DESCRIPTION,
    images: ['/twitter-image'],
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
