/**
 * Staff Cancel Booking Modal
 * 
 * Clean, minimal design matching our modal patterns
 */

'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { Loader2, X, AlertTriangle } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !isSubmitting && onClose()}
      />

      {/* Modal */}
      <div className={cn(
        "relative w-full max-w-md bg-background rounded-xl border border-border/40 shadow-lg overflow-hidden",
        "animate-in fade-in-0 zoom-in-95 duration-200"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <h2 className="text-[15px] font-bold tracking-tight">Cancel Booking</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-sm text-muted-foreground mb-5">
            Enter a reason for cancelling this booking. The customer will be notified.
          </p>

          {/* Reason Text Field */}
          <div className="space-y-2 mb-4">
            <label className="text-sm font-semibold text-muted-foreground/70">Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder={DEFAULT_REASON}
              disabled={isSubmitting}
              className="w-full h-10 px-3 bg-muted/20 border border-border/40 rounded-lg text-sm font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors disabled:opacity-50"
            />
          </div>

          {/* Notes Textarea */}
          <div className="space-y-2 mb-6">
            <label className="text-sm font-semibold text-muted-foreground/70">
              Additional Notes{' '}
              <span className="font-medium text-muted-foreground/50">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Optional details for the customer..."
              rows={3}
              disabled={isSubmitting}
              className="w-full px-3 py-2.5 bg-muted/20 border border-border/40 rounded-lg text-sm font-medium resize-none placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors disabled:opacity-50"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 h-11 border border-border/40 rounded-lg text-sm font-semibold hover:bg-muted/30 transition-colors disabled:opacity-50"
            >
              Go Back
            </button>
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex-1 h-11 bg-destructive text-destructive-foreground rounded-lg text-sm font-semibold hover:bg-destructive/90 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
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
    </div>
  );

  return createPortal(modalContent, document.body);
}
