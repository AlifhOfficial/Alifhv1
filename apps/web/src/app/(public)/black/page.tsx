/**
 * Black Directory Page
 * 
 * Premium showroom directory for Black tier members.
 * Showcases verified dealerships with signature showroom pages.
 */

import { BlackDirectoryView } from '@/components/pages/black';

export const metadata = {
  title: 'Black | Premium Car Showrooms & Dealers in UAE | Revvup',
  description: 'Curated collection of premium car dealerships and signature showrooms from verified Black tier partners. Luxury car dealers in Dubai, Abu Dhabi, and across UAE.',
  keywords: 'premium car showrooms uae, luxury car dealers dubai, black tier dealers, verified showrooms uae, premium car dealers abu dhabi, luxury auto dealers uae',
  openGraph: {
    title: 'Black | Premium Car Showrooms & Dealers in UAE | Revvup',
    description: 'Curated collection of premium car dealerships and signature showrooms from verified Black tier partners.',
    type: 'website',
    url: 'https://revvup.ae/black',
  },
  alternates: {
    canonical: 'https://revvup.ae/black',
  },
};

// ISR: Cache for 1 day - data fetched client-side
export const revalidate = 86400;

export default function BlackPage() {
  return <BlackDirectoryView />;
}
