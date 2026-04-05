/**
 * Sign-In Feedback Modal - Revvup Design System
 * 
 * Clean, minimal feedback for sign-in flow
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

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
  const [dots, setDots] = useState("");
  const contentTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (contentTimeoutRef.current) {
      clearTimeout(contentTimeoutRef.current);
      contentTimeoutRef.current = null;
    }
    if (!open) {
      setShowContent(false);
      setShowSuccess(false);
      setDots("");
      return;
    }

    contentTimeoutRef.current = window.setTimeout(() => setShowContent(true), 50);

    return () => {
      if (contentTimeoutRef.current) {
        clearTimeout(contentTimeoutRef.current);
      }
    };
  }, [open]);

  useEffect(() => {
    if (success && open) {
      setShowContent(true);
      setShowSuccess(true);
    } else if (!success) {
      setShowSuccess(false);
    }
  }, [success, open]);

  // Dots animation for loading/redirecting states
  useEffect(() => {
    if (!open || error) return;
    
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 400);

    return () => clearInterval(interval);
  }, [open, error]);

  if (!open) return null;

  const isError = !!error;
  const isLoadingState = isLoading && !isError && !showSuccess;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-background/60 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className={`max-w-[340px] w-full bg-card border border-border/50 rounded-2xl shadow-2xl p-6 transform transition-all duration-150 ease-out ${showContent ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          {/* Loading spinner */}
          {isLoadingState && (
            <div className="mb-4">
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            </div>
          )}

          {/* Success icon */}
          {showSuccess && (
            <div className="mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
          )}

          {/* Title */}
          <h2 className="text-title3 font-semibold tracking-tight text-foreground">
            {isError ? "Sign in failed" : showSuccess ? "Welcome back" : "Signing in"}
          </h2>
          
          {/* Description with dots animation */}
          <p className="text-footnote text-muted-foreground mt-2">
            {isError ? error : showSuccess ? (
              <span>Redirecting you now<span className="inline-block w-4 text-left">{dots}</span></span>
            ) : (
              <span>Verifying credentials<span className="inline-block w-4 text-left">{dots}</span></span>
            )}
          </p>

          {/* Error action */}
          {isError && onClose && (
            <div className="w-full space-y-3 mt-6">
              <button
                onClick={onClose}
                className="w-full h-11 rounded-xl text-subhead font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
