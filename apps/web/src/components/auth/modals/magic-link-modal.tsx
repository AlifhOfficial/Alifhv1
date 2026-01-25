/**
 * Magic Link Modal - Alifh Design System
 * Clean, minimal magic link sign-in flow
 */

"use client";

import { useState } from "react";
import { Mail, ArrowLeft, X, CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/cn";

interface MagicLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBackToSignIn: () => void;
  onSubmit: (email: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  success?: boolean;
  email?: string;
}

export function MagicLinkModal({
  open,
  onOpenChange,
  onBackToSignIn,
  onSubmit,
  isLoading = false,
  error,
  success = false,
  email: successEmail,
}: MagicLinkModalProps) {
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
        className="fixed inset-0 z-[9999] bg-background/40 backdrop-blur-2xl flex items-center justify-center p-4"
        onClick={() => onOpenChange(false)}
      >
        <div 
          className="max-w-sm w-full bg-card border border-border/40 rounded-xl shadow-xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center space-y-4">
            {/* Success Icon */}
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary" />
            </div>

            {/* Content */}
            <div className="text-center space-y-1">
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                Check your email
              </h2>
              <p className="text-sm text-muted-foreground">
                We sent a magic link to <span className="font-medium text-foreground">{successEmail}</span>
              </p>
            </div>

            {/* Info */}
            <div className="w-full rounded-xl border border-border/40 bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground text-center">
                Click the link in your email to sign in. Expires in 10 minutes.
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
      className="fixed inset-0 z-[9999] bg-background/40 backdrop-blur-2xl flex items-center justify-center p-4"
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
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Magic link</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Sign in without a password
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
              {isLoading ? "Sending..." : "Send magic link"}
            </button>
          </form>

          {/* Info */}
          <p className="text-xs text-muted-foreground text-center">
            Only for existing accounts
          </p>
        </div>
      </div>
    </div>
  );
}