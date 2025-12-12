/**
 * Magic Link Modal - Alifh Design System
 * Production-ready magic link modal with Better Auth features
 * Props-based pattern for clean separation of concerns
 */

"use client";

import { useState } from "react";
import { Mail, ArrowLeft, X } from "lucide-react";

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
        className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => onOpenChange(false)}
      >
        <div 
          className="max-w-md w-full bg-card border border-border/40 rounded-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-border/40 p-6 relative">
            
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-xl font-medium text-foreground mb-2">Check Your Email</h2>
            <p className="text-sm text-muted-foreground">
              We've sent a magic link to {successEmail}
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                Click the link in your email to sign in instantly. The link will expire in 10 minutes.
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
    <div 
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => onOpenChange(false)}
    >
      <div 
        className="max-w-md w-full bg-card border border-border/40 rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-border/40 p-6 relative">
          

          
          <button
            onClick={onBackToSignIn}
            className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/20"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <Mail className="w-4 h-4 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium text-foreground mb-2">Magic Link Sign In</h2>
          <p className="text-sm text-muted-foreground">
            Sign in to your existing account with a magic link
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <X className="w-5 h-5 text-destructive mt-0.5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-destructive">Magic Link Failed</p>
                  <p className="text-xs text-destructive/80 mt-1 leading-relaxed">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Magic Link Form */}
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
              {isLoading ? "Sending magic link..." : "Send Magic Link"}
            </button>
          </form>

          <div className="bg-muted/40 border border-border/40 rounded-lg p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Magic links are only available for existing accounts. We'll email you a secure link for instant sign-in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}