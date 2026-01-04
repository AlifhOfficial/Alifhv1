/**
 * New Listing View Component
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ListingForm } from '@/components/listings/listing-form';
import type { ListingFormData } from '@/components/listings/listing-form/types';

interface NewListingViewProps {
  userId: string;
}

export function NewListingView({ userId }: NewListingViewProps) {
  void userId;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: ListingFormData) => {
    try {
      setError(null);

      // Transform images from ListingImage[] to string[] for API
      const apiData = {
        ...data,
        images: data.images.map(img => img.key),
        // Map ownerRemarks to specialNotes structure
        specialNotes: {
          ownerRemarks: data.ownerRemarks,
        },
        // Submit for review (user listings go to 'submitted', staff go to 'approved')
        status: 'published',
      };

      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.details?.message || errorData.error || 'Failed to create listing';
        console.error('API Error Details:', errorData);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Redirect to my listings - submitted for review
      router.push('/user-dashboard/listings/my-listings?tab=in_review');
    } catch (err) {
      console.error('Error creating listing:', err);
      setError(err instanceof Error ? err.message : 'Failed to create listing');
    }
  };

  const handleSaveDraft = async (data: Partial<ListingFormData>) => {
    try {
      setError(null);

      // Transform for API
      const apiData = {
        ...data,
        images: (data.images || []).map(img => img.key),
        specialNotes: {
          ownerRemarks: data.ownerRemarks || [],
        },
        // Save as draft (not submitted for review)
        status: 'draft',
      };

      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save draft');
      }

      router.push('/user-dashboard/listings/my-listings?tab=draft');
    } catch (err) {
      console.error('Error saving draft:', err);
      setError(err instanceof Error ? err.message : 'Failed to save draft');
    }
  };

  const handleCancel = () => {
    router.push('/user-dashboard/listings/my-listings');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto px-6 mt-6">
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="py-8">
        <ListingForm
          mode="create"
          onSubmit={handleSubmit}
          onSaveDraft={handleSaveDraft}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
