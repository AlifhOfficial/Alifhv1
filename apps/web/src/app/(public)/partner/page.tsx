/**
 * Partner Page - Revvup Marketing
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
  PartnerClosingSection,
} from '@/components/pages/partner';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dealer Partner Program — 0% Commission, Unlimited Listings | Revvup',
  description: 'Flat fee. Unlimited listings. No pay-to-rank. Full brand page, staff accounts, analytics, and trust tools. The car dealer platform built for UAE dealerships. Better than pay-per-listing.',
  keywords: 'zero commission car marketplace, no commission car sales dubai, dealer car marketplace subscription uae, car dealer dubai, car dealership platform uae, automotive marketplace dubai, dealer partner program uae, dubizzle for dealers, dubicars dealer, yallmotors dealers, shoofi dealers, ayeshi alternative, alternative dealer platform, flat fee car listing',
  openGraph: {
    title: 'Dealer Partner Program — 0% Commission, Unlimited Listings | Revvup',
    description: 'Flat fee. Unlimited listings. No pay-to-rank. Full brand page, staff accounts, analytics, and trust tools.',
    type: 'website',
    url: 'https://revvup.ae/partner',
  },
  alternates: {
    canonical: 'https://revvup.ae/partner',
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
      <PartnerClosingSection />
    </div>
  );
}
