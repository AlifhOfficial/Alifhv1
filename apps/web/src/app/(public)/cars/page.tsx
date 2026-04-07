/**
 * Cars Route - SEO Redirect to /listings
 * This page exists because users search for "cars" not "listings"
 */

import { permanentRedirect } from 'next/navigation';
import { Metadata } from 'next';
const CARS_META_DESCRIPTION =
  'Browse cars by brand and model in the UAE. Explore listings and compare prices on Revvup.';

export const metadata: Metadata = {
  title: 'Used Cars for Sale in Dubai | No Ads | Revvup',
  description: CARS_META_DESCRIPTION,
  alternates: {
    canonical: 'https://revvup.ae/listings',
  },
};

// ISR: Static redirect, cached until redeploy

export default function CarsPage() {
  permanentRedirect('/listings');
}
