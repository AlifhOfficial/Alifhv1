/**
 * Email Sent Modal - Alifh Design Philosophy
 * 
 * Feedback modal after email sent with resend functionality
 * Includes countdown timer as per design system
 */

"use client";

import { useEffect, useState } from "react";
import { Mail, X } from "lucide-react";

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
    title: "Check your inbox",
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
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  const content = EMAIL_CONTENT[type];

  useEffect(() => {
    if (!open) {
      setCountdown(60);
      return;
    }

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
      setCountdown(60); // Reset countdown
    } catch (error) {
      console.error("Resend failed:", error);
    } finally {
      setIsResending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-card/95 backdrop-blur-sm border border-border/30 rounded-2xl p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground/60 hover:text-foreground transition-all duration-200 rounded-xl hover:bg-muted/10 group"
          aria-label="Close"
        >
          <X className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
        </button>

        <div className="flex flex-col items-center space-y-6">
          {/* Mail Icon */}
          <div className="w-12 h-12 bg-muted/20 rounded-full flex items-center justify-center">
            <Mail className="w-5 h-5 text-foreground" />
          </div>

          {/* Content */}
          <div className="text-center space-y-3">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              {content.title}
            </h2>
            <p className="text-sm text-muted-foreground/80 leading-relaxed">
              We sent an email to <span className="font-medium text-foreground">{email}</span> with 
              a link to {content.action}.
            </p>
          </div>

          {/* Info Box */}
          <div className="w-full p-4 bg-muted/20 border border-border/20 rounded-xl">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground/80">
                Didn't receive the email? Check your spam folder or
              </p>
              <button
                onClick={handleResend}
                disabled={countdown > 0 || isResending}
                className="text-sm font-medium text-primary hover:text-primary/80 disabled:text-muted-foreground/60 disabled:cursor-not-allowed transition-colors duration-200"
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

          {/* Back to Sign In */}
          <button
            onClick={onClose}
            className="text-sm text-muted-foreground/80 hover:text-foreground transition-colors duration-200"
          >
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
}