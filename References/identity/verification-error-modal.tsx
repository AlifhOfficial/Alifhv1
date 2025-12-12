/**
 * Email Verification Error Modal - Pure UI Component
 * NO LOGIC - Only presentation
 */

"use client";

import { XCircle } from "lucide-react";

interface VerificationErrorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  error?: string;
  onRetry?: () => void;
  onResendEmail?: () => void;
  isRetrying?: boolean;
  isResending?: boolean;
}

export function VerificationErrorModal({
  open,
  onOpenChange,
  error = "We couldn't verify your email address",
  onRetry,
  onResendEmail,
  isRetrying = false,
  isResending = false,
}: VerificationErrorModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      
      <div className="relative max-w-md w-full mx-4 bg-card border border-border/40 rounded-lg p-6 shadow-lg">
        <div className="space-y-6">
          <XCircle className="w-4 h-4 text-destructive" />

          <div className="space-y-3">
            <h2 className="text-xl font-medium text-foreground">Verification failed</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {error || "We couldn't verify your email address"}
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="bg-muted/20 rounded-lg p-3 border border-border/20">
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                This might have happened because:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• The link has expired</li>
                <li>• The link was already used</li>
                <li>• The link is invalid</li>
              </ul>
            </div>

            <div className="space-y-2">
              <button
                onClick={onRetry}
                disabled={isRetrying}
                className="w-full h-10 px-4 bg-primary text-primary-foreground text-sm rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isRetrying ? "Retrying..." : "Try again"}
              </button>

              <button
                onClick={onResendEmail}
                disabled={isResending}
                className="w-full h-10 px-4 bg-muted hover:bg-muted/80 text-foreground text-sm rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isResending ? "Sending..." : "Resend email"}
              </button>
            </div>

            <div className="pt-2 border-t border-border/20">
              <p className="text-xs text-muted-foreground">
                Need help?{" "}
                <a
                  href="mailto:support@alifh.ae"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Contact support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
