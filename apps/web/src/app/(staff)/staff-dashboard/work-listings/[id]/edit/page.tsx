/**
 * Staff Edit Work Listing Page
 * Edit a partner (work) listing owned by the staff user.
 */

import { notFound, redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session-context';
import { getListingDetailed } from '@alifh/database';
import { EditListingView } from '@/components/listings/edit-listing';
import { cache } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const runtime = 'nodejs';

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

export default async function StaffEditWorkListingPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getSessionUser();

  if (!user) {
    redirect(`/auth/sign-in?redirect=/staff-dashboard/work-listings/${id}/edit`);
  }

  const listing = await getListingDetailedCached(id);
  if (!listing) {
    notFound();
  }

  if (!listing.partnerId) {
    redirect('/access-denied?reason=not-work-listing');
  }

  const isAdmin = user.role === 'admin' || user.role === 'super_admin';
  const isOwner = listing.userId === user.id; // Use listing data directly, no extra DB call

  const membership = user.partnerMemberships?.find((m) => m.partnerId === listing.partnerId);
  const staffRole = membership?.staffRole;

  if (!isAdmin && !isOwner && (!membership || staffRole === 'viewer')) {
    redirect('/access-denied');
  }

  return <EditListingView listing={listing} userId={user.id} listingType="work" />;
}
