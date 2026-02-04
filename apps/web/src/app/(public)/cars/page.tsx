/**
 * Cars Route - SEO Redirect to /listings
 * This page exists because users search for "cars" not "listings"
 */

import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Used Cars for Sale in Dubai | VIN Shown | Revvup',
  description: 'Browse used cars in Dubai with VIN shown on every listing. No sponsored ads. Free for private sellers. Book test drives online.',
  alternates: {
    canonical: 'https://revvup.ae/listings',
  },
};

export default function CarsPage() {
  redirect('/listings');
}
