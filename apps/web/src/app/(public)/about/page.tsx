/**
 * About Us Page - Alifh
 * Philosophical. Clean. Mystique.
 */

import { Metadata } from 'next';
import {
  AboutHeroSection,
  AboutTeamSection,
  AboutStorySection,
  AboutPrinciplesSection,
  AboutVisionSection,
  AboutClosingSection,
} from '@/components/pages/about';

export const metadata: Metadata = {
  title: 'About Us - Alifh',
  description: 'We got tired of complaining. So we built something. The clean, honest automotive ecosystem the UAE should have had years ago.',
  openGraph: {
    title: 'About Us - Alifh',
    description: 'We got tired of complaining. So we built something. The clean, honest automotive ecosystem the UAE should have had years ago.',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <AboutHeroSection />
      <AboutTeamSection />
      <AboutStorySection />
      <AboutPrinciplesSection />
      <AboutVisionSection />
      <AboutClosingSection />
    </div>
  );
}
