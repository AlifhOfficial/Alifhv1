/**
 * Staff Reject Booking Modal
 * 
 * Clean, minimal design matching our modal patterns
 */

'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { Loader2, XCircle } from 'lucide-react';
import { cn } from '@/utils';

interface StaffRejectModalProps {
  isOpen: boolean;
  reason: string;
  isSubmitting: boolean;
  onReasonChange: (reason: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function StaffRejectModal({
  isOpen,
  reason,
  isSubmitting,
  onReasonChange,
  onSubmit,
  onClose,
}: StaffRejectModalProps) {
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
        className="absolute inset-0 bg-background/40 backdrop-blur-2xl"
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
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          
          <h2 className="text-lg font-semibold text-foreground mb-1.5">Reject Booking</h2>
          <p className="text-sm text-muted-foreground/70 mb-5">
            Enter a reason. The customer will be notified.
          </p>

          {/* Reason Text Field */}
          <div className="space-y-1.5 mb-5 text-left">
            <label className="text-xs font-semibold text-muted-foreground/70">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="e.g. Vehicle is not available, Schedule conflict..."
              rows={3}
              disabled={isSubmitting}
              className="w-full px-3 py-2.5 bg-muted/30 border border-border/40 rounded-lg text-sm resize-none placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/40 transition-all disabled:opacity-50"
            />
          </div>

          {/* Actions - Stacked */}
          <div className="space-y-2">
            <button
              onClick={onSubmit}
              disabled={isSubmitting || !reason.trim()}
              className="w-full h-11 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Reject Booking'
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
