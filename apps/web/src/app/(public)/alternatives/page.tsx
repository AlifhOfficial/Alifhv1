/**
 * Alternatives Guide - Why Choose Revvup
 * SEO landing page for competitor comparison traffic
 * Legal-safe: No competitor names in visible content, only in meta keywords
 */

import { Metadata } from 'next';
import { AlternativesView } from '@/components/pages/alternatives/alternatives-view';

export const metadata: Metadata = {
  title: 'Best Free Car Marketplace in Dubai UAE — Complete Guide 2026 | Revvup',
  description: 'Complete guide to selling and buying cars in Dubai without fees. Learn why thousands switched to free car listings, no paid boosts, VIN verification, and honest rankings. Compare all features and make the right choice for your car sale.',
  keywords: 'dubizzle alternative, dubicars alternative, yallmotors alternative, cars24 alternative, shoofi alternative, ayeshi alternative, free car listing dubai, best place to sell car dubai, car marketplace dubai, alternative car marketplace uae, no commission car sales, free car classifieds dubai, automotive marketplace uae, sell car online dubai free, where to list car free uae, best car website dubai, car marketplace comparison dubai, free vs paid car listing, how to sell car dubai 2026, best way to sell used car dubai, car selling tips dubai, avoid car listing fees dubai, zero commission car marketplace, car listing guide dubai, sell car without fees uae',
  openGraph: {
    title: 'Best Free Car Marketplace in Dubai UAE — Complete Guide 2026',
    description: 'Complete guide to selling cars in Dubai without fees. Free forever. No listing fees. No paid boosts. VIN verified cars.',
    type: 'article',
    url: 'https://revvup.ae/alternatives',
  },
  alternates: {
    canonical: 'https://revvup.ae/alternatives',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Free Car Marketplace in Dubai UAE — Complete Guide 2026',
    description: 'Complete guide to selling cars in Dubai without fees. Free forever.',
  },
};

export default function AlternativesPage() {
  return <AlternativesView />;
}
