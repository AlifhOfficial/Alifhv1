/**
 * Email Sent Modal - Alifh Design System
 * 
 * Feedback modal after email sent with resend functionality
 */

"use client";

import { useEffect, useState } from "react";
import { Mail, X } from "lucide-react";
import { cn } from "@/utils/cn";

interface EmailSentModalProps {
  open: boolean;
  onClose: () => void;
  onResend: () => Promise<void>;
  email: string;
  type: 'verification' | 'reset' | 'magic-link';
}

const EMAIL_CONTENT = {
  verification: {
    title: "Check your inbox",
    action: "verify your email",
  },
  reset: {
    title: "Check your inbox", 
    action: "reset your password",
  },
  'magic-link': {
    title: "Magic link sent",
    action: "sign in",
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

  const content = EMAIL_CONTENT[type];

  useEffect(() => {
    if (open) {
      setTimeout(() => setShowContent(true), 100);
    } else {
      setShowContent(false);
      setCountdown(60);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

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
  }, [open]);

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
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className={cn(
          "max-w-sm w-full bg-card border border-border/40 rounded-xl shadow-xl p-6 relative",
          "transform transition-all duration-200",
          showContent ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center space-y-4">
          {/* Mail Icon */}
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="w-5 h-5 text-primary" />
          </div>

          {/* Content */}
          <div className="text-center space-y-1">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {content.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We sent a link to <span className="font-medium text-foreground">{email}</span> to {content.action}.
            </p>
          </div>

          {/* Resend Section */}
          <div className="w-full rounded-xl border border-border/40 bg-muted/20 p-4">
            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Didn't get it? Check spam or
              </p>
              <button
                onClick={handleResend}
                disabled={countdown > 0 || isResending}
                className={cn(
                  "text-sm font-semibold transition-colors",
                  countdown > 0 || isResending
                    ? "text-muted-foreground cursor-not-allowed"
                    : "text-primary hover:text-primary/80"
                )}
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

          {/* Back button */}
          <button
            onClick={onClose}
            className={cn(
              "w-full h-10 px-4 rounded-lg text-sm font-semibold transition-colors",
              "bg-muted/30 text-foreground hover:bg-muted/50"
            )}
          >
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
}