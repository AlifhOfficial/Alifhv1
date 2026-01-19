/**
 * Acceptable Use Policy Page - Alifh
 * Legal documentation
 */

import { Metadata } from 'next';
import { AcceptableUsePolicy } from '@/components/pages/legal';

export const metadata: Metadata = {
  title: 'Acceptable Use Policy - Alifh',
  description: 'Acceptable Use Policy for ALIFH platform. Guidelines for permitted and prohibited conduct when using our services.',
  openGraph: {
    title: 'Acceptable Use Policy - Alifh',
    description: 'Acceptable Use Policy for ALIFH platform operated by AISH CAPITALS FZCO.',
    type: 'website',
  },
};

export default function AcceptableUsePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <AcceptableUsePolicy />
    </div>
  );
}
