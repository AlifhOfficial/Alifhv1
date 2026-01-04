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
    condition: listing.condition as 'new' | 'used' || 'used',
    price: listing.price,
    currency: listing.currency,
    isNegotiable: listing.isNegotiable,
    mileage: listing.mileage,
    specs: listing.specs as any,
    steeringSide: listing.steeringSide as any,
    bodyType: listing.bodyType as any || undefined,
    fuelType: listing.fuelType as any || undefined,
    transmission: listing.transmission as any || undefined,
    engineSize: listing.engineSize as any || undefined,
    engineType: listing.engineType as any || undefined,
    cylinders: listing.cylinders || undefined,
    powerRange: listing.powerRange as any || undefined,
    fuelEconomy: listing.fuelEconomy || undefined,
    doors: listing.doors as any || undefined,
    seatingCapacity: listing.seatingCapacity as any || undefined,
    exteriorColor: listing.exteriorColor as any || undefined,
    interiorColor: listing.interiorColor as any || undefined,
    exportStatus: listing.exportStatus as any,
    warrantyType: listing.warrantyType as any || undefined,
    emirate: listing.emirate,
    city: listing.city || undefined,
    // Convert images from string[] to ListingImage[]
    images: (listing.images || []).map((img, index) => ({
      key: typeof img === 'string' ? img : (img as any).key || '',
      order: index,
    })),
    videoUrl: listing.videoUrl || undefined,
    description: listing.description || undefined,
    extras: listing.extras || [],
    tags: listing.tags || [],
    technicalFeatures: listing.technicalFeatures || {},
    ownerRemarks: listing.specialNotes?.ownerRemarks || [],
    partnerId: listing.partnerId || undefined,
  };

  const handleSubmit = async (data: ListingFormData) => {
    try {
      setError(null);

      // Transform images back to string[] for API
      const apiData = {
        ...data,
        images: data.images.map(img => img.key),
        // Map ownerRemarks back to specialNotes structure
        specialNotes: {
          ...listing.specialNotes,
          ownerRemarks: data.ownerRemarks,
        },
      };

      const response = await fetch(`/api/listings/${listing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
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
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-4xl mx-auto px-8 py-16 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit Listing</h1>
          <p className="text-sm text-muted-foreground/70 mt-2">
            {listing.year} {listing.make} {listing.model}
          </p>
        </div>

        {listing.lifecycleStatus === 'archived' &&
          (listing.specialNotes?.suspensionReason || (listing.specialNotes as any)?.moderation?.reason) && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
              <p className="text-sm text-red-500">
                Suspended: {listing.specialNotes?.suspensionReason || (listing.specialNotes as any)?.moderation?.reason}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-2">
                You can edit and resubmit this listing, but it will stay hidden until an admin unsuspends it.
              </p>
            </div>
          )}

        {listing.moderationStatus === 'rejected' && (listing.rejectionReason || listing.specialNotes?.rejectionReason) && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
            <p className="text-sm text-red-500">
              Rejected: {listing.rejectionReason || listing.specialNotes?.rejectionReason}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Form */}
        <ListingForm
          mode="edit"
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
