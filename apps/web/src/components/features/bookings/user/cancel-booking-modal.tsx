/**
 * Cancel Booking Modal (User)
 */

'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/utils';

const REASONS: Array<{ value: string; label: string }> = [
  { value: 'schedule_conflict', label: 'Schedule conflict' },
  { value: 'found_another_car', label: 'Found another car' },
  { value: 'price_issue', label: 'Price issue' },
  { value: 'location_issue', label: 'Location issue' },
  { value: 'changed_mind', label: 'Changed mind' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'other', label: 'Other' },
];

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
  if (!isOpen) return null;

  const needsNotes = reason === 'other';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background border border-border/40 rounded-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-bold tracking-tight text-foreground">Cancel booking</h3>
        <p className="text-[15px] font-medium text-muted-foreground/70 mt-1.5">
          Tell us why you’re cancelling (helps the dealer improve).
        </p>

        <div className="mt-4">
          <label className="text-sm font-semibold tracking-tight text-foreground">Reason</label>
          <select
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            className="mt-1.5 w-full px-3 py-2 bg-muted/20 border border-border/40 rounded-lg text-sm font-medium"
          >
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label className="text-sm font-semibold tracking-tight text-foreground">
            Notes {needsNotes ? '(required)' : '(optional)'}
          </label>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder={needsNotes ? 'Please describe the reason...' : 'Optional details...'}
            rows={3}
            className={cn(
              'mt-1.5 w-full px-3 py-2 bg-muted/20 border border-border/40 rounded-lg text-sm font-medium resize-none placeholder:text-muted-foreground/50',
              'focus:outline-none focus:ring-2 focus:ring-primary'
            )}
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-5 py-2.5 bg-muted/40 text-foreground rounded-full text-sm font-semibold tracking-tight hover:bg-muted/50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting || (needsNotes && notes.trim().length === 0)}
            className="flex-1 px-5 py-2.5 bg-destructive text-destructive-foreground rounded-full text-sm font-semibold tracking-tight hover:bg-destructive/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              'Cancel booking'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

