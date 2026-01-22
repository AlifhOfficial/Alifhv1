/**
 * Become a Partner Page
 * Simple 2-step explanation: Sign up → Apply
 */

import { Metadata } from 'next';
import { 
  BecomePartnerHeroSection,
  BecomePartnerStepsSection,
  BecomePartnerClosingSection 
} from '@/components/pages/become-partner';

export const metadata: Metadata = {
  title: 'Become a Partner - Alifh',
  description: 'Join Alifh as a partner. Two simple steps: create an account and fill out the form.',
  openGraph: {
    title: 'Become a Partner - Alifh',
    description: 'Join Alifh as a partner. Two simple steps: create an account and fill out the form.',
    type: 'website',
  },
};

export default function BecomePartnerPage() {
  return (
    <div className="min-h-screen bg-background">
      <BecomePartnerHeroSection />
      <BecomePartnerStepsSection />
      <BecomePartnerClosingSection />
    </div>
  );
}
