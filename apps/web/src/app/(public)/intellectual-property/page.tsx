/**
 * Intellectual Property & Copyright Notice Page - Revvup
 * Legal documentation
 */

import { Metadata } from 'next';
import { IntellectualProperty } from '@/components/pages/legal';
const IP_META_DESCRIPTION =
  'Revvup intellectual property policy for brand assets, listings, and platform content.';

export const metadata: Metadata = {
  title: 'Intellectual Property & Copyright Notice - Revvup',
  description: IP_META_DESCRIPTION,
  openGraph: {
    title: 'Intellectual Property & Copyright Notice - Revvup',
    description: IP_META_DESCRIPTION,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Intellectual Property & Copyright Notice - Revvup',
    description: IP_META_DESCRIPTION,
    images: ['/twitter-image'],
  },
};

// ISR: Static page, cached until redeploy

export default function IntellectualPropertyPage() {
  return (
    <div className="min-h-screen bg-background">
      <IntellectualProperty />
    </div>
  );
}
