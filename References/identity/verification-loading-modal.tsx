/**
 * Email Verification Loading Modal
 * 
 * Shows while verification is in progress
 * Matches Alifh design system with proper dark/light mode support
 */

"use client";

import { Loader2 } from "lucide-react";

interface VerificationLoadingModalProps {
  open: boolean;
}

export function VerificationLoadingModal({
  open,
}: VerificationLoadingModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border/40 rounded-lg p-6">
        <div className="space-y-6">
          <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
          
          <div className="space-y-2">
            <h2 className="text-xl font-medium text-foreground">
              Verifying email
              <span className="inline-flex ml-1">
                <span className="animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1s' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1s' }}>.</span>
              </span>
            </h2>
            <p className="text-sm text-muted-foreground">Please wait a moment</p>
          </div>
        </div>
      </div>
    </div>
  );
}
