/**
 * Privacy Policy Page - Revvup
 * Legal documentation
 */

import { Metadata } from 'next';
import { PrivacyPolicy } from '@/components/pages/legal';
const PRIVACY_META_DESCRIPTION =
  'Read Revvup’s Privacy Policy for how we collect, use, and protect data on the UAE car marketplace.';

export const metadata: Metadata = {
  title: 'Privacy Policy - Revvup',
  description: PRIVACY_META_DESCRIPTION,
  openGraph: {
    title: 'Privacy Policy - Revvup',
    description: PRIVACY_META_DESCRIPTION,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy - Revvup',
    description: PRIVACY_META_DESCRIPTION,
    images: ['/twitter-image'],
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
