/**
 * Brand Manifesto Page
 * Revvup brand identity, values, and visual language
 */

import type { Metadata } from 'next';
import { BrandManifesto } from '@/components/pages/brand/brand-manifesto';

export const metadata: Metadata = {
  title: 'Brand | Revvup',
  description: 'The Revvup brand manifesto. Our identity, values, and visual language.',
  openGraph: {
    title: 'Brand | Revvup',
    description: 'The Revvup brand manifesto. Our identity, values, and visual language.',
  },
};

// ISR: Static page, cached until redeploy
export const revalidate = false;

export default function BrandPage() {
  return <BrandManifesto />;
}
