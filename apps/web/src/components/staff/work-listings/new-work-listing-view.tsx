/**
 * New Work Listing View Component
 * For staff to create listings under their partner/dealership
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ListingForm } from '@/components/listings/listing-form';
import type { ListingFormData } from '@/components/listings/listing-form/types';

interface NewWorkListingViewProps {
  userId: string;
  partnerId: string;
}

export function NewWorkListingView({ userId, partnerId }: NewWorkListingViewProps) {
  void userId;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: ListingFormData) => {
    try {
      setError(null);

      // Transform images from ListingImage[] to string[]
      const apiData = {
        ...data,
        images: data.images.map(img => img.key),
        specialNotes: {
          ownerRemarks: data.ownerRemarks,
        },
        partnerId, // Include partner ID for work listings
        sellerType: 'dealer', // Mark as dealer listing
        // Staff listings get auto-approved (status 'published' -> moderationStatus 'approved')
        status: 'published',
      };

      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.details?.message || errorData.error || 'Failed to create listing';
        console.error('API Error Details:', errorData);
        throw new Error(errorMessage);
      }

      // Staff listings are auto-approved, redirect to active listings
      router.push('/staff-dashboard/work-listings?tab=active');
    } catch (err) {
      console.error('Error creating listing:', err);
      setError(err instanceof Error ? err.message : 'Failed to create listing');
    }
  };

  const handleSaveDraft = async (data: Partial<ListingFormData>) => {
    try {
      setError(null);

      const apiData = {
        ...data,
        images: (data.images || []).map(img => img.key),
        specialNotes: {
          ownerRemarks: data.ownerRemarks || [],
        },
        partnerId,
        sellerType: 'dealer',
        // Save as draft (not published yet)
        status: 'draft',
      };

      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save draft');
      }

      router.push('/staff-dashboard/work-listings?tab=draft');
    } catch (err) {
      console.error('Error saving draft:', err);
      setError(err instanceof Error ? err.message : 'Failed to save draft');
    }
  };

  const handleCancel = () => {
    router.push('/staff-dashboard/work-listings');
  };

  return (
    <div className="min-h-screen bg-background -mx-4">
      {/* Error Message */}
      {error && (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 mt-4 sm:mt-6">
          <div className="rounded-xl sm:rounded-2xl border border-red-500/20 bg-red-500/10 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-red-500">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <ListingForm
        mode="create"
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        onCancel={handleCancel}
        isStaff={true}
        partnerId={partnerId}
      />
    </div>
  );
}
