/**
 * Disclaimer Page - Revvup
 * Legal documentation
 */

import { Metadata } from 'next';
import { Disclaimer } from '@/components/pages/legal';
import { REVVUP_META_DESCRIPTION } from '@/lib/brand-messaging';

export const metadata: Metadata = {
  title: 'Disclaimer - Revvup',
  description: REVVUP_META_DESCRIPTION,
  openGraph: {
    title: 'Disclaimer - Revvup',
    description: REVVUP_META_DESCRIPTION,
    type: 'website',
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
