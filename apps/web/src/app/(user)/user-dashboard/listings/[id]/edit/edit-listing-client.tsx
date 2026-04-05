'use client';

import { redirect } from 'next/navigation';
import { EditListingView } from '@/components/listings/edit-listing';
import { NewListingView } from '@/components/listings/new-listing';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState, useMemo } from 'react';
import type { ListingFormData } from '@/components/listings/listing-form/types';

interface EditListingClientProps {
  id: string;
  userId: string;
  userRole?: string;
}

export function EditListingClient({ id, userId, userRole }: EditListingClientProps) {
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchListing() {
      try {
        const res = await fetch(`/api/listings/${id}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setError(errData.error || 'Listing not found');
          return;
        }
        const data = await res.json();
        setListing(data.listing || data);
      } catch {
        setError('Failed to load listing');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchListing();
  }, [id]);

  // Transform listing data to form format for drafts
  const draftInitialData = useMemo(() => {
    if (!listing || listing.moderationStatus !== 'draft') return undefined;
    
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
  }, [listing]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        <div>
          <Skeleton className="h-4 w-20 mb-4" />
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="grid grid-cols-4 gap-3">
          <Skeleton className="aspect-video rounded-xl col-span-2 row-span-2" />
          <Skeleton className="aspect-video rounded-xl" />
          <Skeleton className="aspect-video rounded-xl" />
          <Skeleton className="aspect-video rounded-xl" />
          <Skeleton className="aspect-video rounded-xl" />
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
          <div>
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-title2 font-semibold">Listing Not Found</h1>
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
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';
  const isOwner = listing.userId === userId;

  if (!isOwner && !isAdmin) {
    redirect('/access-denied');
  }

  const isDraft = listing.moderationStatus === 'draft';

  if (isDraft) {
    return <NewListingView userId={userId} initialData={draftInitialData} draftId={listing.id} />;
  }

  return <EditListingView listing={listing} userId={userId} listingType="personal" />;
}
