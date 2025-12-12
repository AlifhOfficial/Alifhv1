/**
 * Sign-In State Feedback Modal
 * 
 * Simple and clean signing in feedback
 * Matches Alifh design system with proper dark/light mode support
 */

"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface SignInFeedbackModalProps {
  open: boolean;
}

export function SignInFeedbackModal({
  open,
}: SignInFeedbackModalProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (open) {
      setTimeout(() => setShowContent(true), 100);
    } else {
      setShowContent(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border/40 rounded-lg p-6">
        <div className="space-y-6">
          <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
          
          <div 
            className={`space-y-2 transition-opacity duration-500 ${
              showContent ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <h2 className="text-xl font-medium text-foreground">
              Signing you in
            </h2>
            <p className="text-sm text-muted-foreground">
              Just a moment
              <span className="inline-flex ml-1">
                <span className="animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1s' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1s' }}>.</span>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
