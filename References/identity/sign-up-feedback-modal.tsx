/**
 * Sign-Up State Feedback Modal
 * 
 * "Setting you all up" message during account creation
 * Matches Alifh design system with proper dark/light mode support
 */

"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface SignUpFeedbackModalProps {
  open: boolean;
}

export function SignUpFeedbackModal({
  open,
}: SignUpFeedbackModalProps) {
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
              Setting you all up
            </h2>
            <p className="text-sm text-muted-foreground">
              Creating your account
              <span className="inline-flex ml-1">
                <span className="animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1s' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1s' }}>.</span>
              </span>
            </p>
          </div>

          <div 
            className={`transition-opacity duration-500 ${
              showContent ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="bg-muted/20 rounded-lg p-3 border border-border/20">
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Creating your profile</li>
                <li>• Setting up preferences</li>
                <li>• Preparing your dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
