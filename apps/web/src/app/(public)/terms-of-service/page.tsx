/**
 * Terms of Service Page - Revvup
 * Legal documentation
 */

import { Metadata } from 'next';
import { TermsOfService } from '@/components/pages/legal';
const TERMS_META_DESCRIPTION =
  'Revvup Terms of Service for buyers, sellers, and dealers using our UAE car marketplace.';

export const metadata: Metadata = {
  title: 'Terms of Service - Revvup',
  description: TERMS_META_DESCRIPTION,
  openGraph: {
    title: 'Terms of Service - Revvup',
    description: TERMS_META_DESCRIPTION,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service - Revvup',
    description: TERMS_META_DESCRIPTION,
    images: ['/twitter-image'],
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
