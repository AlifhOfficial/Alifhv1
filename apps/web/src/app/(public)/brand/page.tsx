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

export default function BrandPage() {
  return <BrandManifesto />;
}
