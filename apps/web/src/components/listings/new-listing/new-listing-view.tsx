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
      className="fixed inset-0 z-[9999] bg-background/40 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-sm bg-card border border-border/40 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-foreground">Sit Tight!</h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground/60">Listing submitted</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 pb-3 sm:pb-4">
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Most listings go live within <span className="font-semibold text-foreground">5 minutes</span>. 
            If manual review is needed, we'll check within 24 hours.
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-border/40 p-3 sm:p-4">
          <button
            onClick={onClose}
            className="w-full h-9 sm:h-10 rounded-lg sm:rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-semibold hover:bg-primary/90 transition-colors"
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
    <div className="min-h-screen bg-background -mx-4">
      {/* Success Modal */}
      {showSuccessModal && <SubmissionModal onClose={handleModalClose} />}

      {/* Error Message */}
      {error && (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 mt-4 sm:mt-6">
          <div className="rounded-xl sm:rounded-2xl border border-red-500/20 bg-red-500/10 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-red-500">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <div>
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
