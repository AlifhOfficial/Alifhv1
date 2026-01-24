/**
 * Staff Edit Work Listing Page
 * Edit a partner (work) listing owned by the staff user.
 */

'use client';

import { redirect } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { EditListingView } from '@/components/listings/edit-listing';
import { use, useEffect, useState } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StaffEditWorkListingPage({ params }: PageProps) {
  const { id } = use(params);
  const { session, isLoading } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchListing() {
      try {
        // Use /api/listings/[id] which allows staff to access partner listings
        // regardless of moderation status (drafts, submitted, rejected, etc.)
        const res = await fetch(`/api/listings/${id}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setError(errData.error || 'Listing not found');
          return;
        }
        const data = await res.json();
        setListing(data);
      } catch (err) {
        setError('Failed to load listing');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchListing();
  }, [id]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) {
    redirect(`/?auth=signin&redirect=/staff-dashboard/work-listings/${id}/edit`);
  }

  if (error || !listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-semibold">Listing Not Found</h1>
        <p className="text-muted-foreground">{error || 'The listing you are looking for does not exist.'}</p>
        <a 
          href="/staff-dashboard/work-listings" 
          className="px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Back to Work Listings
        </a>
      </div>
    );
  }

  if (!listing?.partnerId) {
    redirect('/access-denied?reason=not-work-listing');
  }

  const isAdmin = (session as any).role === 'admin' || (session as any).role === 'super_admin';
  const isOwner = listing.userId === session.id;

  const membership = (session as any).partnerMemberships?.find((m: any) => m.partnerId === listing.partnerId);
  const staffRole = membership?.staffRole;

  if (!isAdmin && !isOwner && (!membership || staffRole === 'viewer')) {
    redirect('/access-denied');
  }

  return <EditListingView listing={listing} userId={session.id} listingType="work" />;
}
