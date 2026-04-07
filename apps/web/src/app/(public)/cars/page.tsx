/**
 * Cars Route - SEO Redirect to /listings
 * This page exists because users search for "cars" not "listings"
 */

import { permanentRedirect } from 'next/navigation';
import { Metadata } from 'next';
import { REVVUP_META_DESCRIPTION } from '@/lib/brand-messaging';

export const metadata: Metadata = {
  title: 'Used Cars for Sale in Dubai | No Ads | Revvup',
  description: REVVUP_META_DESCRIPTION,
  alternates: {
    canonical: 'https://revvup.ae/listings',
  },
};

// ISR: Static redirect, cached until redeploy

export default function CarsPage() {
  permanentRedirect('/listings');
}
