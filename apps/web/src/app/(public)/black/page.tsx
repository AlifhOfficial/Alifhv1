/**
 * Black Directory Page
 * 
 * Premium showroom directory for Black tier members.
 * Showcases verified dealerships with signature showroom pages.
 */

import { BlackDirectoryView } from '@/components/pages/black';

export const metadata = {
  title: 'Black | Signature Showrooms | Revvup',
  description: 'Curated collection of premium dealerships and signature showrooms from verified Black tier partners.',
};

export default function BlackPage() {
  return <BlackDirectoryView />;
}
