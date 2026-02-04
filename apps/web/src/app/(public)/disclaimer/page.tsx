/**
 * Disclaimer Page - Revvup
 * Legal documentation
 */

import { Metadata } from 'next';
import { Disclaimer } from '@/components/pages/legal';

export const metadata: Metadata = {
  title: 'Disclaimer - Revvup',
  description: 'Disclaimer for REVVUP platform operated by AISH CAPITALS FZCO. Important information about platform role and user responsibilities.',
  openGraph: {
    title: 'Disclaimer - Revvup',
    description: 'Disclaimer for REVVUP platform operated by AISH CAPITALS FZCO.',
    type: 'website',
  },
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-background">
      <Disclaimer />
    </div>
  );
}
