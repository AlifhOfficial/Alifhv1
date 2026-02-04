/**
 * Forgot Password Modal - Revvup Design System
 * Clean, minimal password reset flow
 */

"use client";

import { useState } from "react";
import { ArrowLeft, X } from "lucide-react";

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
        className="fixed inset-0 z-[9999] bg-background/60 backdrop-blur-xl flex items-center justify-center p-4"
        onClick={() => onOpenChange(false)}
      >
        <div 
          className="max-w-[340px] w-full bg-card border border-border/50 rounded-2xl shadow-2xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center text-center">
            {/* Title */}
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Check your email
            </h2>
            
            {/* Description */}
            <p className="text-[13px] text-muted-foreground mt-2 mb-6">
              We sent a reset link to{" "}
              <span className="font-medium text-foreground">{successEmail}</span>
            </p>

            {/* Actions */}
            <div className="w-full space-y-3">
              <button
                onClick={onBackToSignIn}
                className="w-full h-11 rounded-xl text-[15px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Back to sign in
              </button>
            </div>

            {/* Hint */}
            <p className="mt-5 text-[13px] text-muted-foreground/60">
              Check spam if you don't see it
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-background/60 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={() => onOpenChange(false)}
    >
      <div 
        className="max-w-[340px] w-full bg-card border border-border/50 rounded-2xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with back/close */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBackToSignIn}
            className="p-2 -ml-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Back"
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
          {/* Title */}
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Reset password
          </h2>
          
          <p className="text-[13px] text-muted-foreground mt-2 mb-6">
            Enter your email to receive a reset link
          </p>

          {/* Error */}
          {error && (
            <div className="w-full rounded-xl border border-destructive/30 bg-destructive/5 p-3 mb-4">
              <p className="text-[13px] text-destructive">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-4 bg-muted/30 border border-border/50 rounded-xl text-base font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all disabled:opacity-50"
              placeholder="you@example.com"
              required
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full h-11 rounded-xl text-[15px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending..." : "Send reset link"}
            </button>
          </form>

          {/* Back link */}
          <button
            onClick={onBackToSignIn}
            className="mt-5 text-[13px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
}