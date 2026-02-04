/**
 * Listing Detail Page - Revvup Design System
 * Public page showing comprehensive car listing details
 * 
 * Architecture: Pure client component - fetches data via hooks
 * No server-side data fetching to avoid database calls
 */

'use client';

import { ListingDetailView } from '@/components/listings/listing-detail';
import { use } from 'react';


interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ListingDetailPage({ params }: PageProps) {
  const { id } = use(params);

  return <ListingDetailView listingId={id} />;
}
