/**
 * Brand Manifesto Page
 * Revvup brand identity, values, and visual language
 */

import type { Metadata } from 'next';
import { BrandManifesto } from '@/components/pages/brand/brand-manifesto';
import { REVVUP_META_DESCRIPTION } from '@/lib/brand-messaging';

export const metadata: Metadata = {
  title: 'Brand | Revvup',
  description: REVVUP_META_DESCRIPTION,
  openGraph: {
    title: 'Brand | Revvup',
    description: REVVUP_META_DESCRIPTION,
  },
};

// ISR: Static page, cached until redeploy

export default function BrandPage() {
  return <BrandManifesto />;
}
