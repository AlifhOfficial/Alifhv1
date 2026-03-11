/**
 * Staff Edit Work Listing Page
 * Edit a partner (work) listing owned by the staff user.
 * Server-side auth + data fetch for faster initial load
 */

import { redirect, notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSessionUser } from '@/lib/auth/session-context';
import { EditListingView } from '@/components/listings/edit-listing';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function fetchListing(id: string) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/listings/${id}`, {
    headers: { Cookie: cookieHeader },
    cache: 'no-store',
  });
  
  if (!res.ok) return null;
  return res.json();
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
  const membership = (user as any).partnerMemberships?.find((m: any) => m.partnerId === listing.partnerId);
  const staffRole = membership?.staffRole;

  if (!isAdmin && !isOwner && (!membership || staffRole === 'viewer')) {
    redirect('/access-denied');
  }

  return <EditListingView listing={listing} userId={user.id} listingType="work" />;
}
