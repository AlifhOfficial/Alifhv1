/**
 * Intellectual Property & Copyright Notice Page - Revvup
 * Legal documentation
 */

import { Metadata } from 'next';
import { IntellectualProperty } from '@/components/pages/legal';
import { REVVUP_META_DESCRIPTION } from '@/lib/brand-messaging';

export const metadata: Metadata = {
  title: 'Intellectual Property & Copyright Notice - Revvup',
  description: REVVUP_META_DESCRIPTION,
  openGraph: {
    title: 'Intellectual Property & Copyright Notice - Revvup',
    description: REVVUP_META_DESCRIPTION,
    type: 'website',
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
