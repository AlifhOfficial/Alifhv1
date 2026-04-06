/**
 * Edit Listing View Component
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ListingForm } from '@/components/listings/listing-form';
import type { ListingFormData } from '@/components/listings/listing-form/types';
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

  const moderationReason = (() => {
    const notes = listing.specialNotes as unknown;
    if (!notes || typeof notes !== 'object') return undefined;
    return (notes as { moderation?: { reason?: string } }).moderation?.reason;
  })();

  const backToUrl =
    listingType === 'work'
      ? '/staff-dashboard/work-listings'
      : '/user-dashboard/listings/my-listings';

  // Transform listing data to new form format
  const initialData: Partial<ListingFormData> & { id: string } = {
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
    // Convert images from string[] to ListingImage[]
    images: (listing.images || [])
      .filter((img): img is string => typeof img === 'string' && img.trim().length > 0)
      .map((img, index) => ({ key: img, order: index })),
    videoUrl: listing.videoUrl || undefined,
    description: listing.description || undefined,
    extras: listing.extras || [],
    tags: listing.tags || [],
    ownerRemarks: listing.specialNotes?.ownerRemarks || [],
    partnerId: listing.partnerId || undefined,
  };

  const handleSubmit = async (data: ListingFormData) => {
    try {
      setError(null);

      // Transform images back to string[] for API
      const apiData: Record<string, unknown> = {
        ...data,
        images: data.images.map(img => img.key),
        // Map ownerRemarks back to specialNotes structure
        specialNotes: {
          ...listing.specialNotes,
          ownerRemarks: data.ownerRemarks,
        },
      };

      // If the listing is a draft, submit it for review when saving
      if (listing.moderationStatus === 'draft') {
        apiData.status = 'published';
      }

      const response = await fetch(`/api/listings/${listing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
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
    <div className="min-h-screen bg-background -mx-4">
      {/* Alert Banners - shown at top if listing has issues */}
      {(listing.lifecycleStatus === 'archived' && (listing.specialNotes?.suspensionReason || moderationReason)) ||
       (listing.moderationStatus === 'rejected' && (listing.rejectionReason || listing.specialNotes?.rejectionReason)) ||
       error ? (
        <div className="max-w-2xl mx-auto px-4 compact:px-6 pt-4 compact:pt-6 space-y-3 compact:space-y-4">
          {listing.lifecycleStatus === 'archived' &&
            (listing.specialNotes?.suspensionReason || moderationReason) && (
              <div className="rounded-xl compact:rounded-2xl border border-destructive/20 bg-destructive-muted p-3 compact:p-4">
                <p className="text-caption1 compact:text-subhead text-destructive">
                  Suspended: {listing.specialNotes?.suspensionReason || moderationReason}
                </p>
                <p className="text-caption2 compact:text-caption1 text-muted-foreground/60 mt-1 compact:mt-1.5">
                  You can edit and resubmit this listing, but it will stay hidden until an admin unsuspends it.
                </p>
              </div>
            )}

          {listing.moderationStatus === 'rejected' && (listing.rejectionReason || listing.specialNotes?.rejectionReason) && (
            <div className="rounded-xl compact:rounded-2xl border border-destructive/20 bg-destructive-muted p-3 compact:p-4">
              <p className="text-caption1 compact:text-subhead text-destructive">
                Rejected: {listing.rejectionReason || listing.specialNotes?.rejectionReason}
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-xl compact:rounded-2xl border border-destructive/20 bg-destructive-muted p-3 compact:p-4">
              <p className="text-caption1 compact:text-subhead text-destructive">{error}</p>
            </div>
          )}
        </div>
      ) : null}

      {/* Form */}
      <ListingForm
        mode="edit"
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
