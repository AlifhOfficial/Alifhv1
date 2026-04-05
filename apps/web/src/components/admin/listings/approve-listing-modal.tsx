/**
 * Approve Listing Modal Component
 */

'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface Listing {
  id: string;
  make: string;
  model: string;
  year: number;
  trim?: string | null;
}

interface ApproveListingModalProps {
  open: boolean;
  listing: Listing;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApproveListingModal({ open, listing, onClose, onSuccess }: ApproveListingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`/api/admin/listings/${listing.id}/operations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ operation: 'approve' }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to approve listing');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/40 backdrop-blur-2xl"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-50 w-full max-w-md bg-background border border-border rounded-xl shadow-xl m-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-headline font-medium">Approve Listing</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary/50 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-subhead text-muted-foreground">
            Are you sure you want to approve this listing? It will be published and visible to all users.
          </p>
          
          <div className="rounded-xl border border-border p-4">
            <p className="text-subhead font-medium">
              {listing.year} {listing.make} {listing.model}
              {listing.trim && ` ${listing.trim}`}
            </p>
            <p className="text-caption1 text-muted-foreground mt-1">ID: {listing.id}</p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-500/20 p-3">
              <p className="text-subhead text-red-500">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-5 py-2 rounded-full border border-border hover:bg-secondary/10 text-subhead transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="flex-1 px-5 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white text-subhead transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Approving...' : 'Approve'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
