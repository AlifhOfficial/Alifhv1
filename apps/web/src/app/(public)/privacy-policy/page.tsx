/**
 * Privacy Policy Page - Alifh
 * Legal documentation
 */

import { Metadata } from 'next';
import { PrivacyPolicy } from '@/components/pages/legal';

export const metadata: Metadata = {
  title: 'Privacy Policy - Alifh',
  description: 'Privacy Policy for ALIFH platform operated by AISH CAPITALS FZCO. Learn how we collect, use, and protect your personal data.',
  openGraph: {
    title: 'Privacy Policy - Alifh',
    description: 'Privacy Policy for ALIFH platform operated by AISH CAPITALS FZCO.',
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <PrivacyPolicy />
    </div>
  );
}
