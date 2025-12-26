/**
 * Edit Listing Page - Alifh Design System
 * Edit existing car listing
 */

import { notFound, redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session-context';
import { getListingDetailed } from '@alifh/database';
import { EditListingView } from '@/components/listings/edit-listing';
import { cache } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

const getListingDetailedCached = cache((id: string) => getListingDetailed(id));

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const listing = await getListingDetailedCached(id);
  
  if (!listing) {
    return { title: 'Listing Not Found | Alifh' };
  }

  return {
    title: `Edit ${listing.year} ${listing.make} ${listing.model} | Alifh`,
  };
}

export default async function EditListingPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getSessionUser();

  if (!user) {
    redirect(`/auth/sign-in?redirect=/listings/${id}/edit`);
  }

  const listing = await getListingDetailedCached(id);

  if (!listing) {
    notFound();
  }

  // Check ownership (or admin) - use listing data directly, no extra DB call
  const isAdmin = user.role === 'admin' || user.role === 'super_admin';
  const isOwner = listing.userId === user.id;

  if (!isOwner && !isAdmin) {
    redirect('/access-denied');
  }

  return <EditListingView listing={listing} userId={user.id} />;
}
