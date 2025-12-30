/**
 * Edit Listing Page - Alifh Design System
 * Edit existing car listing
 */

'use client';

import { notFound, redirect } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { EditListingView } from '@/components/listings/edit-listing';
import { use, useEffect, useState } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditListingPage({ params }: PageProps) {
  const { id } = use(params);
  const { session, isLoading } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListing() {
      try {
        const res = await fetch(`/api/listings/${id}/detailed`);
        if (!res.ok) {
          notFound();
        }
        const data = await res.json();
        setListing(data);
      } catch (error) {
        notFound();
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchListing();
  }, [id]);

  if (isLoading || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    redirect(`/auth/sign-in?redirect=/listings/${id}/edit`);
  }

  if (!listing) {
    notFound();
  }

  // Check ownership (or admin)
  const isAdmin = (session as any).role === 'admin' || (session as any).role === 'super_admin';
  const isOwner = listing.userId === session.id;

  if (!isOwner && !isAdmin) {
    redirect('/access-denied');
  }

  return <EditListingView listing={listing} userId={session.id} listingType="personal" />;
}
