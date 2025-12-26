/**
 * Listing Detail Page - Alifh Design System
 * Public page showing comprehensive car listing details
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getListingDetailed } from '@alifh/database';
import { ListingDetailView } from '@/components/listings/listing-detail';
import { getSessionUser } from '@/lib/auth/session-context';
import { cache } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

const getListingDetailedCached = cache((id: string) => getListingDetailed(id));

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingDetailedCached(id);
  
  if (!listing || !listing.isPublic) {
    return {
      title: 'Listing Not Found | Alifh',
    };
  }

  const title = `${listing.year} ${listing.make} ${listing.model}${listing.trim ? ` ${listing.trim}` : ''}`;
  const description = listing.description || 
    `${title} for sale in ${listing.emirate}. ${listing.mileage.toLocaleString()} km, ${listing.specs} specs.`;

  return {
    title: `${title} | Alifh`,
    description,
    openGraph: {
      title,
      description,
      images: listing.thumbnail ? [listing.thumbnail] : listing.images.slice(0, 1),
    },
  };
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const listing = await getListingDetailedCached(id);

  if (!listing) {
    notFound();
  }

  // Get current user (if authenticated)
  const currentUser = await getSessionUser();

  // Only show public listings to unauthenticated users
  if (!listing.isPublic) {
    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
    const isOwner = currentUser?.id === listing.userId;

    if (!isAdmin && !isOwner) {
      notFound();
    }
  }

  return <ListingDetailView listing={listing} currentUserId={currentUser?.id} />;
}
