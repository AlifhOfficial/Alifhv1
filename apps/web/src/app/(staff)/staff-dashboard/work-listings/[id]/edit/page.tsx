/**
 * Staff Edit Work Listing Page
 * Edit a partner (work) listing owned by the staff user.
 * Server-side auth + data fetch for faster initial load
 */

import { redirect, notFound } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session-context';
import { EditListingView } from '@/components/listings/edit-listing';
import {
  getActivePartnerStaffMembershipByUserIdAndPartnerId,
  getListingDetailed,
} from '@alifh/database';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function fetchListing(id: string) {
  return getListingDetailed(id);
}

async function canManagePartnerListing(
  user: { id: string; partnerMemberships?: any[] },
  partnerId: string
): Promise<boolean> {
  const sessionMembership = user.partnerMemberships?.find((m) => m.partnerId === partnerId);
  const roleFromSession = (sessionMembership as any)?.staffRole as string | undefined;
  if (sessionMembership) {
    return roleFromSession !== 'viewer';
  }

  const dbMembership = await getActivePartnerStaffMembershipByUserIdAndPartnerId(user.id, partnerId);
  return !!dbMembership && dbMembership.role !== 'viewer';
}

export default async function StaffEditWorkListingPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getSessionUser();
  
  if (!user) {
    redirect(`/?auth=signin&redirect=/staff-dashboard/work-listings/${id}/edit`);
  }

  const listing = await fetchListing(id);
  
  if (!listing) {
    notFound();
  }

  if (!listing?.partnerId) {
    redirect('/access-denied?reason=not-work-listing');
  }

  const isAdmin = (user as any).role === 'admin' || (user as any).role === 'super_admin';
  const isOwner = listing.userId === user.id;
  const canManagePartner = listing.partnerId
    ? await canManagePartnerListing(user as any, listing.partnerId)
    : false;

  if (!isAdmin && !isOwner && !canManagePartner) {
    redirect('/access-denied');
  }

  return <EditListingView listing={listing} userId={user.id} listingType="work" />;
}
