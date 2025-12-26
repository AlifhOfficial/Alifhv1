/**
 * New Work Listing View Component
 * For staff to create listings under their partner/dealership
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ListingForm } from '@/components/listings/listing-form';

interface NewWorkListingViewProps {
  userId: string;
  partnerId: string;
}

export function NewWorkListingView({ userId, partnerId }: NewWorkListingViewProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any, isDraft: boolean) => {
    try {
      setError(null);

      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          partnerId, // Include partner ID for work listings
          sellerType: 'dealer', // Mark as dealer listing
          status: isDraft ? 'draft' : 'published',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.details?.message || errorData.error || 'Failed to create listing';
        console.error('API Error Details:', errorData);
        throw new Error(errorMessage);
      }

      // Redirect to work listings page after creation
      if (isDraft) {
        router.push('/staff-dashboard/work-listings?tab=draft');
      } else {
        router.push('/staff-dashboard/work-listings');
      }
    } catch (err) {
      console.error('Error creating listing:', err);
      setError(err instanceof Error ? err.message : 'Failed to create listing');
    }
  };

  const handleCancel = () => {
    router.push('/staff-dashboard/work-listings');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-background">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-semibold tracking-tight">Add New Inventory</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Create a new listing for your dealership
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto px-6 mt-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <ListingForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
