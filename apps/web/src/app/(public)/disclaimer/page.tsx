/**
 * Disclaimer Page - Revvup
 * Legal documentation
 */

import { Metadata } from 'next';
import { Disclaimer } from '@/components/pages/legal';
const DISCLAIMER_META_DESCRIPTION =
  'Revvup disclaimer covering listings, pricing, and platform information for buyers and sellers in the UAE.';

export const metadata: Metadata = {
  title: 'Disclaimer - Revvup',
  description: DISCLAIMER_META_DESCRIPTION,
  openGraph: {
    title: 'Disclaimer - Revvup',
    description: DISCLAIMER_META_DESCRIPTION,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Disclaimer - Revvup',
    description: DISCLAIMER_META_DESCRIPTION,
    images: ['/twitter-image'],
  },
};

// ISR: Static page, cached until redeploy

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-background">
      <Disclaimer />
    </div>
  );
}
