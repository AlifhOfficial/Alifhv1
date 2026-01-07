/**
 * Staff Cancel Booking Modal
 */

'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils';

const DEFAULT_REASON = 'Busy';

interface StaffCancelModalProps {
  isOpen: boolean;
  reason: string;
  notes: string;
  isSubmitting: boolean;
  onReasonChange: (reason: string) => void;
  onNotesChange: (notes: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function StaffCancelModal({
  isOpen,
  reason,
  notes,
  isSubmitting,
  onReasonChange,
  onNotesChange,
  onSubmit,
  onClose,
}: StaffCancelModalProps) {
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl font-bold tracking-tight">Cancel Booking</h3>
          <p className="text-[15px] font-medium text-muted-foreground mt-1.5">
            Enter a reason for cancelling this booking. The customer will be notified.
          </p>
        </div>

        {/* Reason Text Field */}
        <div className="space-y-2 mb-5">
          <label className="text-sm font-semibold tracking-tight">Reason</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder={DEFAULT_REASON}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-[15px] font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        {/* Notes Textarea */}
        <div className="space-y-2 mb-6">
          <label className="text-sm font-semibold tracking-tight">
            Additional Notes{' '}
            <span className="font-medium text-muted-foreground/60">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Optional details for the customer..."
            rows={3}
            className={cn(
              'w-full px-4 py-3 bg-background border border-border rounded-xl text-[15px] font-medium resize-none placeholder:text-muted-foreground/50',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors'
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-5 py-3 border border-border bg-background hover:bg-muted/50 rounded-full text-[15px] font-semibold tracking-tight transition-colors disabled:opacity-50"
          >
            Go Back
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting || reason.trim().length === 0}
            className="flex-1 px-5 py-3 bg-destructive text-destructive-foreground rounded-full text-[15px] font-semibold tracking-tight hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
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
