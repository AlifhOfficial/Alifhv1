/**
 * Reject Listing Modal Component
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

interface RejectListingModalProps {
  open: boolean;
  listing: Listing;
  onClose: () => void;
  onSuccess: () => void;
}

export function RejectListingModal({ open, listing, onClose, onSuccess }: RejectListingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  if (!open) return null;

  const handleReject = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`/api/admin/listings/${listing.id}/operations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ operation: 'reject', reason }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reject listing');
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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-50 w-full max-w-md bg-background border border-border rounded-xl shadow-xl m-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-medium">Reject Listing</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary/50 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-sm text-muted-foreground">
            Please provide a reason for rejecting this listing. The user will be notified.
          </p>
          
          <div className="rounded-xl border border-border p-4">
            <p className="text-sm font-medium">
              {listing.year} {listing.make} {listing.model}
              {listing.trim && ` ${listing.trim}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">ID: {listing.id}</p>
          </div>

          {/* Reason Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Images are unclear, pricing seems unrealistic, duplicate listing..."
              rows={4}
              className="w-full bg-transparent border-b border-border focus:border-foreground outline-none transition-colors text-sm resize-none py-2"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-500/20 p-3">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-5 py-2 rounded-full border border-border hover:bg-secondary/10 text-sm transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={isSubmitting || !reason.trim()}
              className="flex-1 px-5 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
