/**
 * Brand Manifesto Page
 * Revvup brand identity, values, and visual language
 */

import type { Metadata } from 'next';
import { BrandManifesto } from '@/components/pages/brand/brand-manifesto';
const BRAND_META_DESCRIPTION =
  'Download Revvup brand assets, logos, and guidelines for partners, press, and approved marketing use.';

export const metadata: Metadata = {
  title: 'Brand | Revvup',
  description: BRAND_META_DESCRIPTION,
  openGraph: {
    title: 'Brand | Revvup',
    description: BRAND_META_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brand | Revvup',
    description: BRAND_META_DESCRIPTION,
    images: ['/twitter-image'],
  },
};

// ISR: Static page, cached until redeploy

export default function BrandPage() {
  return <BrandManifesto />;
}
