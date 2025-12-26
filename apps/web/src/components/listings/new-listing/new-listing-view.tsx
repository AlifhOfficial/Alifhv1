/**
 * New Listing View Component
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ListingForm } from '@/components/listings/listing-form';

interface NewListingViewProps {
  userId: string;
}

export function NewListingView({ userId }: NewListingViewProps) {
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
        body: JSON.stringify({
          ...data,
          status: isDraft ? 'draft' : 'published',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.details?.message || errorData.error || 'Failed to create listing';
        console.error('API Error Details:', errorData);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Redirect based on status
      // Note: User-posted listings are queued for moderation when submitted
      // regardless of what status was requested
      if (isDraft) {
        router.push('/user-dashboard/listings/my-listings?tab=draft');
      } else {
        // Submitted for review
        router.push('/user-dashboard/listings/my-listings?tab=in_review');
      }
    } catch (err) {
      console.error('Error creating listing:', err);
      setError(err instanceof Error ? err.message : 'Failed to create listing');
    }
  };

  const handleCancel = () => {
    router.push('/user-dashboard/listings/my-listings');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-semibold tracking-tight">List Your Car</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Fill in the details to create your listing
          </p>
        </div>
      </div>

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
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
