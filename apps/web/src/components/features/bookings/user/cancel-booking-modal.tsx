/**
 * Cancel Booking Modal (User)
 * Clean centered modal design
 */

'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';

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

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/40 backdrop-blur-2xl"
        onClick={() => !isSubmitting && onClose()}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xs rounded-xl border border-border/40 bg-card p-6 shadow-xl animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Content */}
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>

          {/* Title */}
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              Cancel Booking
            </h3>
            <p className="text-sm text-muted-foreground">
              Tell us why you're cancelling
            </p>
          </div>

          {/* Form Fields */}
          <div className="w-full space-y-3 text-left">
            {/* Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground/70">
                Reason <span className="font-normal text-muted-foreground/50">(optional)</span>
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => onReasonChange(e.target.value)}
                placeholder="Enter reason..."
                disabled={isSubmitting}
                className="w-full h-10 px-3 bg-muted/30 border border-border/40 rounded-lg text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/40 transition-all disabled:opacity-50"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground/70">
                Notes <span className="font-normal text-muted-foreground/50">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Additional details..."
                rows={2}
                disabled={isSubmitting}
                className="w-full px-3 py-2.5 bg-muted/30 border border-border/40 rounded-lg text-sm resize-none placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/40 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col w-full gap-2 pt-2">
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="w-full h-10 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
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
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full h-10 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

