/**
 * Cancel Booking Modal (User)
 */

'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const DEFAULT_REASON = 'Changed mind';

interface CancelBookingModalProps {
  isOpen: boolean;
  reason: string;
  notes: string;
  isSubmitting: boolean;
  onReasonChange: (reason: string) => void;
  onNotesChange: (notes: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function CancelBookingModal({
  isOpen,
  reason,
  notes,
  isSubmitting,
  onReasonChange,
  onNotesChange,
  onSubmit,
  onClose,
}: CancelBookingModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Set default reason when modal opens
  useEffect(() => {
    if (isOpen && !reason) {
      onReasonChange(DEFAULT_REASON);
    }
  }, [isOpen, reason, onReasonChange]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
      <div className="bg-background border border-border/40 rounded-xl p-6 w-full max-w-sm mx-4 shadow-xl">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-[15px] font-bold tracking-tight text-foreground">Cancel Booking</h3>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Tell us why you're cancelling.
          </p>
        </div>

        {/* Reason Text Field */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-muted-foreground/70 mb-2 block">Reason</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder={DEFAULT_REASON}
            className="w-full px-4 py-3 bg-muted/30 border border-border/40 rounded-xl text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
          />
        </div>

        {/* Notes Textarea */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-muted-foreground/70 mb-2 block">Additional Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Optional details..."
            rows={3}
            className="w-full px-4 py-3 bg-muted/30 border border-border/40 rounded-xl text-sm resize-none placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 border border-border/40 hover:bg-muted/30 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
          >
            Go Back
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting || reason.trim().length === 0}
            className="flex-1 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              'Cancel Booking'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

