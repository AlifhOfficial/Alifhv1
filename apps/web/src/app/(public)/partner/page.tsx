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
  PartnerClosingSection,
} from '@/components/pages/partner';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Car Dealers Dubai | Zero Commission Platform | Alifh',
  description: 'Sell more cars. Keep more profit. Zero commission, flat monthly fee, unlimited listings. We never compete with you. The car dealer platform built for UAE dealerships.',
  keywords: 'car dealer dubai, sell cars uae, dealer platform dubai, zero commission car sales, car dealership uae, automotive marketplace dubai',
  openGraph: {
    title: 'Car Dealers Dubai | Zero Commission Platform | Alifh',
    description: 'Sell more cars. Keep more profit. Zero commission, flat monthly fee, unlimited listings. We never compete with you.',
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
      <PartnerClosingSection />
    </div>
  );
}
