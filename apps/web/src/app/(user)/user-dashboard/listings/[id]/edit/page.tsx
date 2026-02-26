/**
 * Edit Listing Page - Revvup Design System
 * Edit existing car listing
 * 
 * For drafts: opens full creation flow (NewListingView) - no field restrictions
 * For published: opens edit flow (EditListingView) - some fields locked
 */

'use client';

import { redirect } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { EditListingView } from '@/components/listings/edit-listing';
import { NewListingView } from '@/components/listings/new-listing';
import { use, useEffect, useState, useMemo } from 'react';
import type { ListingFormData } from '@/components/listings/listing-form/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditListingPage({ params }: PageProps) {
  const { id } = use(params);
  const { session, isLoading } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchListing() {
      try {
        // Use /api/listings/[id] which allows owners to access their own listings
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
    redirect(`/?auth=signin&redirect=/user-dashboard/listings/${id}/edit`);
  }

  if (error || !listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-semibold">Listing Not Found</h1>
        <p className="text-muted-foreground">{error || 'The listing you are looking for does not exist.'}</p>
        <a 
          href="/user-dashboard/listings/my-listings" 
          className="px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Back to My Listings
        </a>
      </div>
    );
  }

  // Check ownership (or admin)
  const isAdmin = (session as any).role === 'admin' || (session as any).role === 'super_admin';
  const isOwner = listing.userId === session.id;

  if (!isOwner && !isAdmin) {
    redirect('/access-denied');
  }

  // For drafts, use the full creation flow (no field restrictions)
  const isDraft = listing.moderationStatus === 'draft';

  // Transform listing data to form format for drafts
  const draftInitialData = useMemo(() => {
    if (!isDraft) return undefined;
    
    return {
      id: listing.id,
      vin: listing.vin || '',
      make: listing.make,
      model: listing.model,
      year: listing.year,
      trim: listing.trim || undefined,
      condition: (listing.condition as ListingFormData['condition']) ?? 'used',
      price: listing.price,
      currency: listing.currency,
      isNegotiable: listing.isNegotiable,
      mileage: listing.mileage,
      specs: (listing.specs as ListingFormData['specs']) ?? 'gcc',
      steeringSide: (listing.steeringSide as ListingFormData['steeringSide']) ?? 'left',
      bodyType: (listing.bodyType as ListingFormData['bodyType']) || undefined,
      fuelType: (listing.fuelType as ListingFormData['fuelType']) || undefined,
      transmission: (listing.transmission as ListingFormData['transmission']) || undefined,
      engineSize: (listing.engineSize as ListingFormData['engineSize']) || undefined,
      engineType: (listing.engineType as ListingFormData['engineType']) || undefined,
      cylinders: listing.cylinders || undefined,
      powerRange: (listing.powerRange as ListingFormData['powerRange']) || undefined,
      fuelEconomy: listing.fuelEconomy || undefined,
      doors: (listing.doors as ListingFormData['doors']) || undefined,
      seatingCapacity: (listing.seatingCapacity as ListingFormData['seatingCapacity']) || undefined,
      exteriorColor: (listing.exteriorColor as ListingFormData['exteriorColor']) || undefined,
      interiorColor: (listing.interiorColor as ListingFormData['interiorColor']) || undefined,
      exportStatus: (listing.exportStatus as ListingFormData['exportStatus']) ?? 'local_only',
      warrantyType: (listing.warrantyType as ListingFormData['warrantyType']) || undefined,
      emirate: listing.emirate,
      city: listing.city || undefined,
      images: (listing.images || [])
        .filter((img: unknown): img is string => typeof img === 'string' && (img as string).trim().length > 0)
        .map((img: string, index: number) => ({ key: img, order: index })),
      videoUrl: listing.videoUrl || undefined,
      description: listing.description || undefined,
      extras: listing.extras || [],
      tags: listing.tags || [],
      ownerRemarks: listing.specialNotes?.ownerRemarks || [],
      partnerId: listing.partnerId || undefined,
    } satisfies Partial<ListingFormData> & { id: string };
  }, [isDraft, listing]);

  // Drafts: full creation flow (no restrictions)
  // Published: edit flow (with locked fields)
  if (isDraft) {
    return <NewListingView userId={session.id} initialData={draftInitialData} draftId={listing.id} />;
  }

  return <EditListingView listing={listing} userId={session.id} listingType="personal" />;
}
