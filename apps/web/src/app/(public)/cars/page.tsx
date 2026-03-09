/**
 * Cars Route - SEO Redirect to /listings
 * This page exists because users search for "cars" not "listings"
 */

import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Used Cars for Sale in Dubai | No Ads | Revvup',
  description: 'Browse used cars in Dubai. No sponsored ads. Free for private sellers. Book test drives online.',
  alternates: {
    canonical: 'https://revvup.ae/listings',
  },
};

// ISR: Static redirect, cached until redeploy
export const revalidate = false;

export default function CarsPage() {
  redirect('/listings');
}
