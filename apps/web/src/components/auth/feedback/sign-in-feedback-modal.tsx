/**
 * Sign-In Feedback Modal - Alifh Design Philosophy
 * 
 * Premium, minimal feedback experience
 * Sophisticated animations and micro-interactions
 * Reflects luxury vehicle marketplace aesthetic
 */

"use client";

import { useEffect, useState } from "react";
import { Loader2, X, CheckCircle2 } from "lucide-react";

interface SignInFeedbackModalProps {
  open: boolean;
  onClose?: () => void;
  success?: boolean;
  isLoading?: boolean;
  error?: string | null;
}

export function SignInFeedbackModal({
  open,
  onClose,
  success = false,
  isLoading = false,
  error = null,
}: SignInFeedbackModalProps) {
  const [showContent, setShowContent] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setTimeout(() => setShowContent(true), 150);
    } else {
      setShowContent(false);
      setShowSuccess(false);
    }
  }, [open]);

  useEffect(() => {
    if (success && open) {
      setTimeout(() => setShowSuccess(true), 300);
    }
  }, [success, open]);

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className={`max-w-sm w-full bg-card/95 backdrop-blur-sm border border-border/30 rounded-2xl p-8 relative shadow-2xl transform transition-all duration-300 ${
          showContent ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="flex flex-col items-center space-y-6">
          {/* Loading/Success/Error Icon */}
          <div className="relative">
            {error ? (
              <div className="animate-in zoom-in duration-500">
                <X className="w-8 h-8 text-red-500" />
              </div>
            ) : showSuccess ? (
              <div className="animate-in zoom-in duration-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin relative z-10" />
              </div>
            )}
          </div>
          
          {/* Content */}
          <div 
            className={`text-center space-y-3 transition-all duration-500 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              {error ? 'Sign in failed' : showSuccess ? 'Welcome back' : 'Authenticating'}
            </h2>
            
            <p className="text-sm text-muted-foreground/80 leading-relaxed">
              {error ? (
                error
              ) : showSuccess ? (
                'Successfully signed in'
              ) : (
                <>
                  Verifying your credentials
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
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
