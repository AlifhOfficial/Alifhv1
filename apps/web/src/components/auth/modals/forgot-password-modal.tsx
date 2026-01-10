/**
 * Forgot Password Modal - Alifh Design System
 * Clean, minimal password reset flow
 */

"use client";

import { useState } from "react";
import { Mail, ArrowLeft, X, CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/cn";

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBackToSignIn: () => void;
  onSubmit: (email: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  success?: boolean;
  email?: string;
}

export function ForgotPasswordModal({
  open,
  onOpenChange,
  onBackToSignIn,
  onSubmit,
  isLoading = false,
  error,
  success = false,
  email: successEmail,
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email);
  };

  if (!open) return null;

  // Success state
  if (success) {
    return (
      <div 
        className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => onOpenChange(false)}
      >
        <div 
          className="max-w-sm w-full bg-card border border-border/40 rounded-xl shadow-xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center space-y-4">
            {/* Success Icon */}
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>

            {/* Content */}
            <div className="text-center space-y-1">
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                Check your email
              </h2>
              <p className="text-sm text-muted-foreground">
                We sent reset instructions to <span className="font-medium text-foreground">{successEmail}</span>
              </p>
            </div>

            {/* Info */}
            <div className="w-full rounded-xl border border-border/40 bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground text-center">
                The link expires in 1 hour. Check spam if you don't see it.
              </p>
            </div>

            {/* Back button */}
            <button
              onClick={onBackToSignIn}
              className={cn(
                "w-full h-10 px-4 rounded-lg text-sm font-semibold transition-colors",
                "bg-muted/30 text-foreground hover:bg-muted/50",
                "flex items-center justify-center gap-2"
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => onOpenChange(false)}
    >
      <div 
        className="max-w-sm w-full bg-card border border-border/40 rounded-xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 relative">
          <button
            onClick={onBackToSignIn}
            className="absolute top-4 left-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="pt-6">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Reset password</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Enter your email to receive reset instructions
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-5">
          {/* Error */}
          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-muted-foreground/70">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 bg-muted/20 border border-border/40 rounded-lg text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors disabled:opacity-50"
                placeholder="you@example.com"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className={cn(
                "w-full h-10 px-4 rounded-lg text-sm font-semibold transition-colors",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}