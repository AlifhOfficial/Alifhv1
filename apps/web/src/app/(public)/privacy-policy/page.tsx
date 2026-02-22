/**
 * Privacy Policy Page - Revvup
 * Legal documentation
 */

import { Metadata } from 'next';
import { PrivacyPolicy } from '@/components/pages/legal';

export const metadata: Metadata = {
  title: 'Privacy Policy - Revvup',
  description: 'Privacy Policy for REVVUP platform operated by AISH CAPITALS FZCO. Learn how we collect, use, and protect your personal data.',
  openGraph: {
    title: 'Privacy Policy - Revvup',
    description: 'Privacy Policy for REVVUP platform operated by AISH CAPITALS FZCO.',
    type: 'website',
  },
};

// ISR: Static page, cached until redeploy
export const revalidate = false;

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <PrivacyPolicy />
    </div>
  );
}
