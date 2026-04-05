/**
 * Partner Application Feedback Modal
 * Simple, no-frills feedback
 */

"use client";

import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface PartnerApplicationFeedbackModalProps {
  open: boolean;
  onClose?: () => void;
  success?: boolean;
  isSubmitting?: boolean;
  error?: string | null;
}

export function PartnerApplicationFeedbackModal({
  open,
  onClose,
  success = false,
  isSubmitting = false,
  error = null,
}: PartnerApplicationFeedbackModalProps) {
  if (!open) return null;

  const isError = !!error;
  const _isLoading = isSubmitting && !success && !isError;

  return (
    <div className="fixed inset-0 z-[9999] bg-background/40 backdrop-blur-2xl flex items-center justify-center p-4">
      <div 
        className="max-w-xs w-full bg-card border border-border/40 rounded-xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center space-y-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full flex items-center justify-center">
            {isError ? (
              <XCircle className="w-6 h-6 text-destructive" />
            ) : success ? (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            ) : (
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            )}
          </div>
          
          {/* Content */}
          <div className="text-center space-y-1">
            <h2 className="text-callout font-semibold tracking-tight text-foreground">
              {isError ? "Submission failed" : success ? "Application submitted" : "Submitting..."}
            </h2>
            
            <p className="text-subhead text-muted-foreground">
              {isError ? error : success ? "We'll review and get back to you." : "Please wait"}
            </p>
          </div>

          {/* Button - only show when done */}
          {(success || isError) && onClose && (
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-lg bg-muted text-subhead font-medium text-foreground hover:bg-muted/80 transition-colors"
            >
              {success ? "Done" : "Try again"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}