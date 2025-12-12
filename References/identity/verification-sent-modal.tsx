/**
 * Verification Email Sent Modal
 * 
 * Displays confirmation that verification email has been sent
 * Matches Alifh design system with proper dark/light mode support
 */

"use client";

import { Mail } from "lucide-react";

interface VerificationSentModalProps {
  open: boolean;
  onClose: () => void;
  email?: string;
}

export function VerificationSentModal({
  open,
  onClose,
  email,
}: VerificationSentModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border/40 rounded-lg p-6">
        <div className="space-y-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-medium text-foreground">
              Check your email
            </h2>
            <p className="text-sm text-muted-foreground">
              We sent a verification link to{" "}
              {email ? (
                <span className="font-medium text-foreground">{email}</span>
              ) : (
                "your email address"
              )}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <p className="text-xs text-muted-foreground">
              Click the link in the email to verify your account. The link will expire in 24 hours.
            </p>
            
            <p className="text-xs text-muted-foreground">
              Didn't receive the email? Check your spam folder or request a new link.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full h-10 px-4 bg-primary text-primary-foreground text-sm rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
