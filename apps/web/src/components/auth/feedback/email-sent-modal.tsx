/**
 * Email Sent Modal - Revvup Design System
 * 
 * Clean, minimal feedback modal after email sent
 */

"use client";

import { useEffect, useState, useRef } from "react";

interface EmailSentModalProps {
  open: boolean;
  onClose: () => void;
  onResend: () => Promise<void>;
  email: string;
  type: 'verification' | 'reset' | 'magic-link';
}

const EMAIL_CONTENT = {
  verification: {
    title: "Check your email",
    description: "We sent a verification link to",
  },
  reset: {
    title: "Check your email", 
    description: "We sent a reset link to",
  },
  'magic-link': {
    title: "Check your email",
    description: "We sent a magic link to",
  },
} as const;

export function EmailSentModal({
  open,
  onClose,
  onResend,
  email,
  type,
}: EmailSentModalProps) {
  const [showContent, setShowContent] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const contentTimeoutRef = useRef<number | null>(null);

  const content = EMAIL_CONTENT[type];

  useEffect(() => {
    if (contentTimeoutRef.current) {
      clearTimeout(contentTimeoutRef.current);
      contentTimeoutRef.current = null;
    }
    if (!open) {
      setShowContent(false);
      setCountdown(60);
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
    if (!open || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, countdown]);

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;

    setIsResending(true);
    try {
      await onResend();
      setCountdown(60);
    } catch (error) {
      console.error("Resend failed:", error);
    } finally {
      setIsResending(false);
    }
  };

  if (!open) return null;

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
          {/* Title */}
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {content.title}
          </h2>
          
          {/* Description */}
          <p className="text-[13px] text-muted-foreground mt-2 mb-6">
            {content.description}{" "}
            <span className="font-medium text-foreground">{email}</span>
          </p>

          {/* Actions */}
          <div className="w-full space-y-3">
            <button
              onClick={onClose}
              className="w-full h-11 rounded-xl text-[15px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Back to sign in
            </button>
          </div>

          {/* Resend */}
          <button
            onClick={handleResend}
            disabled={countdown > 0 || isResending}
            className={`mt-5 text-[13px] transition-colors ${countdown > 0 || isResending ? "text-muted-foreground/60 cursor-not-allowed" : "text-muted-foreground/60 hover:text-muted-foreground"}`}
          >
            {isResending 
              ? "Sending..." 
              : countdown > 0 
                ? `Resend in ${countdown}s`
                : "Resend email"
            }
          </button>
        </div>
      </div>
    </div>
  );
}