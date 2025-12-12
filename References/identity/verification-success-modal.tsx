/**
 * Verification Success Modal
 * 
 * Shows Alifh logo with celebration effects when email verification succeeds
 * Matches Alifh design system with proper dark/light mode support
 */

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface VerificationSuccessModalProps {
  open: boolean;
  onComplete: () => void;
}

export function VerificationSuccessModal({
  open,
  onComplete,
}: VerificationSuccessModalProps) {
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (open) {
      // Trigger celebration animation after modal opens
      setTimeout(() => setShowCelebration(true), 100);
      
      // Auto-redirect after 3 seconds
      setTimeout(() => onComplete(), 3000);
    }
  }, [open, onComplete]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border/40 rounded-lg p-6">
        <div className="py-8 text-center space-y-8 relative overflow-visible">
          {/* Subtle sparkle particles */}
          {showCelebration && (
            <>
              <style jsx>{`
                @keyframes float-up-left {
                  0% {
                    transform: translate(0, 0) scale(0);
                    opacity: 0;
                  }
                  50% {
                    opacity: 1;
                  }
                  100% {
                    transform: translate(-20px, -40px) scale(1);
                    opacity: 0;
                  }
                }
                @keyframes float-up-right {
                  0% {
                    transform: translate(0, 0) scale(0);
                    opacity: 0;
                  }
                  50% {
                    opacity: 1;
                  }
                  100% {
                    transform: translate(20px, -40px) scale(1);
                    opacity: 0;
                  }
                }
                .sparkle-left {
                  animation: float-up-left 2s ease-out infinite;
                }
                .sparkle-right {
                  animation: float-up-right 2s ease-out infinite;
                  animation-delay: 0.5s;
                }
              `}</style>
              <div 
                className="absolute top-1/3 left-1/4 text-lg sparkle-left"
              >
                ✨
              </div>
              <div 
                className="absolute top-1/3 right-1/4 text-lg sparkle-right"
              >
                ✨
              </div>
            </>
          )}

          {/* Logo - grows from small to normal */}
          <div className="flex justify-center">
            <div 
              className={`relative transition-all duration-500 ease-out ${
                showCelebration ? 'w-20 h-20 opacity-100' : 'w-8 h-8 opacity-0'
              }`}
            >
              <Image
                src="/assets/Alifh_logo_Black.svg"
                alt="Alifh"
                fill
                className="dark:invert object-contain"
              />
            </div>
          </div>

          <div 
            className={`space-y-2 transition-all duration-500 ${
              showCelebration ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <h2 className="text-xl font-medium text-foreground">You're all set!</h2>
            <p className="text-sm text-muted-foreground">
              Your email has been verified
            </p>
            <p className="text-xs text-muted-foreground pt-2">
              Redirecting to sign in
              <span className="inline-flex ml-0.5">
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
