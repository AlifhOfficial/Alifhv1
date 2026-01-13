/**
 * Partner Page - Alifh Marketing
 * Public-facing partner page with compelling value proposition
 * One flat fee. Everything included. No games.
 */

import {
  PartnerHeroSection,
  PartnerPainPointSection,
  PartnerFlatFeeSection,
  PartnerToolsSection,
  PartnerRolesSection,
  PartnerBrandSection,
  PartnerCompareSection,
  PartnerPhilosophySection,
  PartnerClosingSection,
} from '@/components/pages/partner';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Partner With Us - Alifh',
  description: 'One flat fee. Everything included. No commission. No credits. No per-day fees. No upsells. We don\'t compete with you—we help you grow.',
  openGraph: {
    title: 'Partner With Us - Alifh',
    description: 'One flat fee. Everything included. No commission. No credits. No per-day fees. No upsells. We don\'t compete with you—we help you grow.',
    type: 'website',
  },
};

export default function PartnerPage() {
  return (
    <div className="min-h-screen bg-background">
      <PartnerHeroSection />
      <PartnerPainPointSection />
      <PartnerFlatFeeSection />
      <PartnerToolsSection />
      <PartnerRolesSection />
      <PartnerBrandSection />
      <PartnerCompareSection />
      <PartnerPhilosophySection />
      <PartnerClosingSection />
    </div>
  );
}
