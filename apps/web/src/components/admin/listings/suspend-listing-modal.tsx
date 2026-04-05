/**
 * Suspend Listing Modal Component
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

interface SuspendListingModalProps {
  open: boolean;
  listing: Listing;
  onClose: () => void;
  onSuccess: () => void;
}

export function SuspendListingModal({ open, listing, onClose, onSuccess }: SuspendListingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  if (!open) return null;

  const handleSuspend = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for suspension');
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
        body: JSON.stringify({ operation: 'suspend', reason }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to suspend listing');
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
          <h2 className="text-headline">Suspend Listing</h2>
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
            Suspending this listing will immediately hide it from public view. The user will be notified with your reason.
          </p>
          
          <div className="rounded-xl border border-border p-4">
            <p className="text-subhead">
              {listing.year} {listing.make} {listing.model}
              {listing.trim && ` ${listing.trim}`}
            </p>
            <p className="text-caption1 text-muted-foreground mt-1">ID: {listing.id}</p>
          </div>

          {/* Reason Input */}
          <div className="space-y-3">
            <label className="text-subhead">
              Suspension Reason <span className="text-destructive">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Violates platform policies, suspicious activity, inappropriate content..."
              rows={4}
              className="w-full bg-transparent border-b border-border focus:border-foreground outline-none transition-colors text-subhead resize-none py-2"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-destructive/20 p-3">
              <p className="text-subhead text-destructive">{error}</p>
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
              onClick={handleSuspend}
              disabled={isSubmitting || !reason.trim()}
              className="flex-1 px-5 py-2 rounded-full bg-warning hover:bg-yellow-600 text-white text-subhead transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Suspending...' : 'Suspend'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
