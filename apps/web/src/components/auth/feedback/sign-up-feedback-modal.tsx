/**
 * Sign-Up Feedback Modal - Alifh Design System
 * 
 * Clean feedback for account creation flow
 */

"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/utils/cn";

interface SignUpFeedbackModalProps {
  open: boolean;
  onClose?: () => void;
  success?: boolean;
  isLoading?: boolean;
  error?: string | null;
  variant?: "email" | "google" | null;
}

export function SignUpFeedbackModal({
  open,
  onClose,
  success = false,
  isLoading = false,
  error = null,
  variant = "email",
}: SignUpFeedbackModalProps) {
  const [showContent, setShowContent] = useState(false);

  const isGoogle = variant === "google";
  const isError = !!error;

  useEffect(() => {
    if (open) {
      setTimeout(() => setShowContent(true), 100);
    } else {
      setShowContent(false);
    }
  }, [open]);

  if (!open) return null;

  const getTitle = () => {
    if (isError) return "Sign up failed";
    if (success) return isGoogle ? "Account linked" : "Account created";
    return isGoogle ? "Connecting Google" : "Creating account";
  };

  const getMessage = () => {
    if (isError) return error;
    if (success) return "Redirecting you now...";
    return isGoogle ? "Linking your Google account..." : "Setting up your account...";
  };

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
            "w-12 h-12 rounded-full flex items-center justify-center",
            isError ? "bg-destructive/10" : success ? "bg-green-500/10" : "bg-muted/30"
          )}>
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
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {getTitle()}
            </h2>
            <p className="text-sm text-muted-foreground">
              {getMessage()}
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
