/**
 * Disclaimer Page - Alifh
 * Legal documentation
 */

import { Metadata } from 'next';
import { Disclaimer } from '@/components/pages/legal';

export const metadata: Metadata = {
  title: 'Disclaimer - Alifh',
  description: 'Disclaimer for ALIFH platform operated by AISH CAPITALS FZCO. Important information about platform role and user responsibilities.',
  openGraph: {
    title: 'Disclaimer - Alifh',
    description: 'Disclaimer for ALIFH platform operated by AISH CAPITALS FZCO.',
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
