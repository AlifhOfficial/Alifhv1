/**
 * Edit Listing View Component
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ListingForm } from '@/components/listings/listing-form';
import type { CarDetailedData } from '@alifh/database';
import type { ListingType } from '@/components/listings/my-listings/types';

interface EditListingViewProps {
  listing: CarDetailedData;
  userId: string;
  listingType?: ListingType;
}

export function EditListingView({ listing, userId, listingType = 'personal' }: EditListingViewProps) {
  void userId;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const backToUrl =
    listingType === 'work'
      ? '/staff-dashboard/work-listings'
      : '/user-dashboard/listings/my-listings';

  // Transform listing data to form format
  const initialData = {
    make: listing.make,
    model: listing.model,
    year: listing.year,
    trim: listing.trim || undefined,
    vin: listing.vin || undefined,
    price: listing.price,
    currency: listing.currency,
    isNegotiable: listing.isNegotiable,
    mileage: listing.mileage,
    specs: listing.specs,
    steeringSide: listing.steeringSide,
    bodyType: listing.bodyType || undefined,
    fuelType: listing.fuelType || undefined,
    transmission: listing.transmission || undefined,
    engineSize: listing.engineSize || undefined,
    engineType: listing.engineType || undefined,
    cylinders: listing.cylinders || undefined,
    doors: listing.doors || undefined,
    seatingCapacity: listing.seatingCapacity || undefined,
    exteriorColor: listing.exteriorColor || undefined,
    interiorColor: listing.interiorColor || undefined,
    exportStatus: listing.exportStatus,
    warrantyType: listing.warrantyType || undefined,
    sellerType: listing.sellerType,
    emirate: listing.emirate,
    city: listing.city || undefined,
    thumbnail: listing.thumbnail || undefined,
    images: listing.images,
    videoUrl: listing.videoUrl || undefined,
    description: listing.description || undefined,
    partnerId: listing.partnerId || undefined,
  };

  const handleSubmit = async (data: any, isDraft: boolean) => {
    try {
      setError(null);

      const response = await fetch(`/api/listings/${listing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          status: isDraft ? 'draft' : 'published',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update listing');
      }

      // Redirect back to my listings page
      router.push(backToUrl);
    } catch (err) {
      console.error('Error updating listing:', err);
      setError(err instanceof Error ? err.message : 'Failed to update listing');
    }
  };

  const handleCancel = () => {
    router.push(backToUrl);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-semibold tracking-tight">Edit Listing</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {listing.year} {listing.make} {listing.model}
          </p>
        </div>
      </div>

      {listing.lifecycleStatus === 'archived' &&
        (listing.specialNotes?.suspensionReason || (listing.specialNotes as any)?.moderation?.reason) && (
          <div className="max-w-4xl mx-auto px-6 mt-6">
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-sm text-red-500">
                Suspended: {listing.specialNotes?.suspensionReason || (listing.specialNotes as any)?.moderation?.reason}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                You can edit and resubmit this listing, but it will stay hidden until an admin unsuspends it.
              </p>
            </div>
          </div>
        )}

      {listing.moderationStatus === 'rejected' && (listing.rejectionReason || listing.specialNotes?.rejectionReason) && (
        <div className="max-w-4xl mx-auto px-6 mt-6">
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm text-red-500">
              Rejected: {listing.rejectionReason || listing.specialNotes?.rejectionReason}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto px-6 mt-6">
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <ListingForm
        initialData={initialData}
        isEditing
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
