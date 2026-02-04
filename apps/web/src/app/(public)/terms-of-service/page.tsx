/**
 * Terms of Service Page - Revvup
 * Legal documentation
 */

import { Metadata } from 'next';
import { TermsOfService } from '@/components/pages/legal';

export const metadata: Metadata = {
  title: 'Terms of Service - Revvup',
  description: 'Terms of Service for REVVUP platform operated by AISH CAPITALS FZCO. Read our legal terms and conditions for using the platform.',
  openGraph: {
    title: 'Terms of Service - Revvup',
    description: 'Terms of Service for REVVUP platform operated by AISH CAPITALS FZCO.',
    type: 'website',
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <TermsOfService />
    </div>
  );
}
