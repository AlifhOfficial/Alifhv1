/**
 * OTP Verification Modal - Revvup Design System
 * 
 * 6-digit OTP input for email verification after sign-up
 * Keeps user in the same browser tab to solve cross-browser session issue
 */

"use client";

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { X, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OTPVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<{ success: boolean; retryAfterSeconds?: number; attemptsRemaining?: number }>;
  onBack: () => void;
  email: string;
  attemptsRemaining?: number;
  cooldownSeconds?: number;
  isLoading?: boolean;
  error?: string | null;
}

export function OTPVerificationModal({
  open,
  onOpenChange,
  onVerify,
  onResend,
  onBack,
  email,
  attemptsRemaining = 5,
  cooldownSeconds = 45,
  isLoading = false,
  error,
}: OTPVerificationModalProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [countdown, setCountdown] = useState(cooldownSeconds);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const formatDuration = (seconds: number) => {
    const safeSeconds = Math.max(0, seconds);
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setOtp(Array(6).fill(""));
      setCountdown(cooldownSeconds);
      // Focus first input after a short delay
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [open, cooldownSeconds]);

  useEffect(() => {
    if (!open) return;
    setCountdown(cooldownSeconds);
  }, [cooldownSeconds, open]);

  // Countdown timer
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

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);
    
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (digit && index === 5 && attemptsRemaining > 0) {
      const fullOtp = newOtp.join("");
      if (fullOtp.length === 6) {
        onVerify(fullOtp);
      }
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Focus previous input on backspace when current is empty
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    
    if (pastedData) {
      const newOtp = Array(6).fill("");
      pastedData.split("").forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);

      // Focus last filled or submit
      const lastIndex = Math.min(pastedData.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();

      if (pastedData.length === 6) {
        onVerify(pastedData);
      }
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;

    setIsResending(true);
    const result = await onResend();
    setIsResending(false);

    if (result.success) {
      setCountdown(result.retryAfterSeconds ?? 30);
      if (typeof result.attemptsRemaining === 'number' && result.attemptsRemaining <= 0) {
        setCountdown(result.retryAfterSeconds ?? countdown);
      }
      setOtp(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } else if (typeof result.retryAfterSeconds === 'number') {
      setCountdown(result.retryAfterSeconds);
    }
  };

  const handleSubmit = () => {
    const fullOtp = otp.join("");
    if (fullOtp.length === 6 && attemptsRemaining > 0) {
      onVerify(fullOtp);
    }
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-background/60 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={() => onOpenChange(false)}
    >
      <div 
        className="max-w-[340px] w-full bg-card border border-border/50 rounded-2xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 -mr-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col items-center text-center">
          <h2 className="text-title3 font-semibold tracking-tight text-foreground">
            Verify your email
          </h2>
          <p className="text-footnote text-muted-foreground mt-2 mb-6">
            We sent a code to{" "}
            <span className="font-medium text-foreground">{email}</span>
          </p>

          {/* OTP Input */}
          <div className="flex justify-center gap-2 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isLoading}
                className={cn(
                  "w-10 h-12 text-center text-callout font-semibold",
                  "bg-muted/30 border border-border/50 rounded-xl",
                  "text-foreground placeholder:text-muted-foreground/50",
                  "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
                  "transition-all disabled:opacity-50",
                  error && "border-destructive/50 focus:ring-destructive/30"
                )}
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="w-full rounded-xl border border-destructive/30 bg-destructive/5 p-3 mb-4">
              <p className="text-footnote text-destructive text-center">{error}</p>
            </div>
          )}

          <p className="text-caption1 text-muted-foreground mb-4">
            {attemptsRemaining > 0
              ? `${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remaining`
              : countdown > 0
                ? `Locked for ${formatDuration(countdown)}`
                : 'Request a new code to continue'}
          </p>

          {/* Actions */}
          <div className="w-full space-y-3">
            <button
              onClick={handleSubmit}
              disabled={isLoading || otp.join("").length !== 6 || attemptsRemaining <= 0}
              className="w-full h-11 rounded-xl text-subhead font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </button>
          </div>

          {/* Resend */}
          <button
            onClick={handleResend}
            disabled={countdown > 0 || isResending}
            className={cn(
              "mt-5 text-footnote transition-colors",
              countdown > 0 || isResending
                ? "text-muted-foreground/60 cursor-not-allowed"
                : "text-muted-foreground/60 hover:text-muted-foreground"
            )}
          >
            {isResending
              ? "Sending..."
              : countdown > 0
                ? `Resend in ${formatDuration(countdown)}`
                : "Resend code"
            }
          </button>
        </div>
      </div>
    </div>
  );
}
