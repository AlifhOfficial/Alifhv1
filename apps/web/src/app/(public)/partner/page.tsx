/**
 * Partner Page - Alifh Marketing
 * Public-facing partner page with value proposition
 */

import { PartnerHeroSection } from '@/components/partner/partner-hero-section';
import { PartnerValueSection } from '@/components/partner/partner-value-section';
import { PartnerClosingSection } from '@/components/partner/partner-closing-section';
import { Footer } from '@/components/home/footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Partner With Us - Alifh',
  description: 'Join the UAE\'s most transparent automotive marketplace. We don\'t compete with you—we help you grow. No commissions. No games. Just results.',
  openGraph: {
    title: 'Partner With Us - Alifh',
    description: 'Join the UAE\'s most transparent automotive marketplace. We don\'t compete with you—we help you grow. No commissions. No games. Just results.',
    type: 'website',
  },
};

export default function PartnerPage() {
  return (
    <div className="min-h-screen bg-background">
      <PartnerHeroSection />
      <PartnerValueSection />
      <PartnerClosingSection />
      <Footer />
    </div>
  );
}
