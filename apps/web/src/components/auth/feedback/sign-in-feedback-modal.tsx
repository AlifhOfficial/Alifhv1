/**
 * Sign-In Feedback Modal - Alifh Design System
 * 
 * Clean, minimal feedback for sign-in flow
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/utils/cn";

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
  const contentTimeoutRef = useRef<number | null>(null);

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

    contentTimeoutRef.current = window.setTimeout(() => setShowContent(true), 100);

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

  if (!open) return null;

  const isError = !!error;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className={cn(
          "max-w-xs w-full bg-card border border-border/40 rounded-xl shadow-xl p-6",
          "transform transition-all duration-200",
          showContent ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center space-y-4">
          {/* Icon */}
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center"
          )}>
            {isError ? (
              <XCircle className="w-6 h-6 text-destructive" />
            ) : showSuccess ? (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            ) : (
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            )}
          </div>
          
          {/* Content */}
          <div className="text-center space-y-1">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {isError ? "Sign in failed" : showSuccess ? "Welcome back" : "Signing in"}
            </h2>
            
            <p className="text-sm text-muted-foreground">
              {isError ? error : showSuccess ? "Redirecting you now..." : "Verifying credentials..."}
            </p>
          </div>

          {/* Error action */}
          {isError && onClose && (
            <button
              onClick={onClose}
              className={cn(
                "w-full h-9 px-4 rounded-lg text-sm font-semibold transition-colors",
                "bg-muted/30 text-foreground hover:bg-muted/50"
              )}
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
