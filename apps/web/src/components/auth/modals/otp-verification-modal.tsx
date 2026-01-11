/**
 * OTP Verification Modal - Alifh Design System
 * 
 * 6-digit OTP input for email verification after sign-up
 * Keeps user in the same browser tab to solve cross-browser session issue
 */

"use client";

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { X, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

interface OTPVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<boolean>;
  onBack: () => void;
  email: string;
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
  isLoading = false,
  error,
}: OTPVerificationModalProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setOtp(Array(6).fill(""));
      setCountdown(60);
      // Focus first input after a short delay
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [open]);

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
    if (digit && index === 5) {
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
    const success = await onResend();
    setIsResending(false);

    if (success) {
      setCountdown(60);
      setOtp(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    }
  };

  const handleSubmit = () => {
    const fullOtp = otp.join("");
    if (fullOtp.length === 6) {
      onVerify(fullOtp);
    }
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => onOpenChange(false)}
    >
      <div 
        className="max-w-sm w-full bg-card border border-border/40 rounded-xl shadow-xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 -mr-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center space-y-2 mb-6">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Verify your email
          </h2>
          <p className="text-sm text-muted-foreground">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

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
                "w-11 h-12 text-center text-lg font-semibold",
                "bg-muted/20 border border-border/40 rounded-lg",
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
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 mb-4">
            <p className="text-sm text-destructive text-center">{error}</p>
          </div>
        )}

        {/* Verify Button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading || otp.join("").length !== 6}
          className={cn(
            "w-full h-10 px-4 rounded-lg text-sm font-semibold transition-colors",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center justify-center gap-2"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Email"
          )}
        </button>

        {/* Resend Section */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Didn't receive the code?{" "}
            <button
              onClick={handleResend}
              disabled={countdown > 0 || isResending}
              className={cn(
                "font-semibold transition-colors",
                countdown > 0 || isResending
                  ? "text-muted-foreground cursor-not-allowed"
                  : "text-primary hover:text-primary/80"
              )}
            >
              {isResending
                ? "Sending..."
                : countdown > 0
                  ? `Resend in ${countdown}s`
                  : "Resend code"
              }
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
