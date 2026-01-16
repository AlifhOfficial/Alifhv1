/**
 * New Listing View Component
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Clock } from 'lucide-react';
import { ListingForm } from '@/components/listings/listing-form';
import type { ListingFormData } from '@/components/listings/listing-form/types';

interface NewListingViewProps {
  userId: string;
}

// Submission success modal - clean minimal design
function SubmissionModal({ onClose }: { onClose: () => void }) {
  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm bg-card border border-border/40 rounded-xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Sit Tight!</h2>
              <p className="text-xs text-muted-foreground">Listing submitted</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Most listings go live within <span className="font-semibold text-foreground">5 minutes</span>. 
            If manual review is needed, we'll check within 24 hours.
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-border/40 p-4">
          <button
            onClick={onClose}
            className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            View My Listings
          </button>
        </div>
      </div>
    </div>
  );
}

export function NewListingView({ userId }: NewListingViewProps) {
  void userId;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
      
      // Show success modal for user listings
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error creating listing:', err);
      setError(err instanceof Error ? err.message : 'Failed to create listing');
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    router.push('/user-dashboard/listings/my-listings?tab=in_review');
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
      {/* Success Modal */}
      {showSuccessModal && <SubmissionModal onClose={handleModalClose} />}

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
