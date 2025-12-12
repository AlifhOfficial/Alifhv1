/**
 * Forgot Password Modal - Alifh Design System
 * Production-ready forgot password modal with Better Auth features
 * Props-based pattern for clean separation of concerns
 */

"use client";

import { useState } from "react";
import { X, Mail, ArrowLeft } from "lucide-react";

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
      <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border/40 rounded-lg">
          {/* Header */}
          <div className="border-b border-border/40 p-6 relative">
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/20"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-5 h-5 text-emerald-500" />
            </div>
            <h2 className="text-xl font-medium text-foreground mb-2">Check Your Email</h2>
            <p className="text-sm text-muted-foreground">
              We've sent password reset instructions to {successEmail}
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
              <p className="text-sm text-emerald-700 dark:text-emerald-300 leading-relaxed">
                Check your email and follow the instructions to reset your password. The link will expire in 1 hour.
              </p>
            </div>

            <button
              onClick={onBackToSignIn}
              className="w-full h-10 px-4 border border-border/40 text-foreground text-sm font-medium rounded-lg hover:bg-muted/50 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border/40 rounded-lg">
        {/* Header */}
        <div className="border-b border-border/40 p-6 relative">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/20"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          
          <button
            onClick={onBackToSignIn}
            className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/20"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <Mail className="w-4 h-4 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium text-foreground mb-2">Reset Password</h2>
          <p className="text-sm text-muted-foreground">
            Enter your email to receive reset instructions
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-xs text-destructive leading-relaxed">
                {error}
              </p>
            </div>
          )}

          {/* Reset Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-border/40 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors disabled:opacity-50"
                placeholder="you@example.com"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full h-10 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Sending instructions..." : "Send Reset Instructions"}
            </button>
          </form>

          <div className="bg-muted/40 border border-border/40 rounded-lg p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              We'll email you instructions to reset your password. Check your spam folder if you don't see it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}