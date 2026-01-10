/**
 * Staff Cancel Booking Modal
 * 
 * Clean, minimal design matching our modal patterns
 */

'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
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
        "relative w-full max-w-xs bg-background rounded-xl border border-border/40 shadow-lg overflow-hidden",
        "animate-in fade-in-0 zoom-in-95 duration-200"
      )}>
        {/* Content - Centered Layout */}
        <div className="p-6 text-center">
          {/* Icon Circle */}
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          
          <h2 className="text-lg font-semibold text-foreground mb-1.5">Cancel Booking</h2>
          <p className="text-sm text-muted-foreground/70 mb-5">
            Enter a reason. The customer will be notified.
          </p>

          {/* Reason Text Field */}
          <div className="space-y-1.5 mb-3 text-left">
            <label className="text-xs font-semibold text-muted-foreground/70">
              Reason <span className="font-medium text-muted-foreground/50">(optional)</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder={DEFAULT_REASON}
              disabled={isSubmitting}
              className="w-full h-10 px-3 bg-muted/30 border border-border/40 rounded-lg text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/40 transition-all disabled:opacity-50"
            />
          </div>

          {/* Notes Textarea */}
          <div className="space-y-1.5 mb-5 text-left">
            <label className="text-xs font-semibold text-muted-foreground/70">
              Notes <span className="font-medium text-muted-foreground/50">(optional)</span>
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

          {/* Actions - Stacked */}
          <div className="space-y-2">
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="w-full h-11 bg-destructive text-destructive-foreground rounded-lg text-sm font-semibold hover:bg-destructive/90 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
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
              className="w-full h-11 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-lg transition-colors disabled:opacity-50"
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
