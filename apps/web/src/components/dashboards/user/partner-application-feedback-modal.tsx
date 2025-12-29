/**
 * Partner Application Feedback Modal
 * 
 * Premium, minimal feedback experience for partner applications
 * Sophisticated animations and micro-interactions
 */

"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

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
  const [showContent, setShowContent] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const contentTimeoutRef = useRef<number | null>(null);
  const successTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (contentTimeoutRef.current) {
      clearTimeout(contentTimeoutRef.current);
      contentTimeoutRef.current = null;
    }
    if (!open) {
      setShowContent(false);
      setShowSuccess(false);
      return;
    }

    contentTimeoutRef.current = window.setTimeout(() => setShowContent(true), 150);

    return () => {
      if (contentTimeoutRef.current) {
        clearTimeout(contentTimeoutRef.current);
        contentTimeoutRef.current = null;
      }
    };
  }, [open]);

  useEffect(() => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }

    if (success && open) {
      setShowContent(true);
      setShowSuccess(true);
    } else if (!success) {
      setShowSuccess(false);
    }

    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
        successTimeoutRef.current = null;
      }
    };
  }, [success, open]);

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
      onClick={error ? onClose : undefined}
    >
      <div 
        className={`max-w-md w-full bg-card/95 backdrop-blur-sm border border-border/30 rounded-2xl p-8 relative shadow-2xl transform transition-all duration-300 ${
          showContent ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="flex flex-col items-center space-y-6">
          {/* Loading/Success/Error Icon */}
          <div className="relative">
            {error ? (
              <div className="animate-in zoom-in duration-500">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
              </div>
            ) : showSuccess ? (
              <div className="animate-in zoom-in duration-500">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center relative">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                  <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-primary/20 rounded-full blur-xl animate-pulse"></div>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center relative z-10">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              </div>
            )}
          </div>
          
          {/* Content */}
          <div 
            className={`text-center space-y-3 transition-all duration-500 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              {error ? 'Submission Failed' : showSuccess ? 'Application Submitted!' : 'Submitting Application'}
            </h2>
            
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              {error ? (
                error
              ) : showSuccess ? (
                'Your partner application has been submitted successfully. Our team will review it and get back to you soon.'
              ) : (
                <>
                  Processing your application
                  <span className="inline-flex ml-1">
                    <span className="animate-bounce opacity-60" style={{ animationDelay: '0ms', animationDuration: '1.2s' }}>.</span>
                    <span className="animate-bounce opacity-60" style={{ animationDelay: '200ms', animationDuration: '1.2s' }}>.</span>
                    <span className="animate-bounce opacity-60" style={{ animationDelay: '400ms', animationDuration: '1.2s' }}>.</span>
                  </span>
                </>
              )}
            </p>
            
            {/* Progress indicator for loading state */}
            {!showSuccess && !error && (
              <div className="w-full bg-muted/20 rounded-full h-1 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-primary h-full rounded-full animate-pulse"></div>
              </div>
            )}

            {/* Action buttons */}
            {(showSuccess || error) && (
              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-all shadow-lg shadow-primary/20"
                >
                  {showSuccess ? 'Continue' : 'Try Again'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
