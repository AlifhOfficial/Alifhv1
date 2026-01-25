/**
 * SignInModal Component - Alifh Design System
 * Production-ready sign-in modal with Better Auth features
 * Matches profile-view and settings-view UI/UX patterns
 */

"use client";

import { useState } from "react";
import { X, Fingerprint, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { authClient } from "@/lib/auth/client";

interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignUp: () => void;
  onSwitchToForgotPassword: () => void;
  onSwitchToMagicLink?: () => void;
  onSubmit: (email: string, password: string) => Promise<void>;
  onGoogleSignIn?: () => Promise<void>;
  onPasskeySuccess?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function SignInModal({
  open,
  onOpenChange,
  onSwitchToSignUp,
  onSwitchToForgotPassword,
  onSwitchToMagicLink,
  onSubmit,
  onGoogleSignIn,
  onPasskeySuccess,
  isLoading = false,
  error,
}: SignInModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);

  // Handle passkey sign-in when user clicks the fingerprint icon
  const handlePasskeySignIn = async () => {
    if (isPasskeyLoading || isLoading) return;
    
    setIsPasskeyLoading(true);
    try {
      const result = await authClient.signIn.passkey();
      
      if (result?.data && onPasskeySuccess) {
        onPasskeySuccess();
      }
    } catch (error: any) {
      // User cancelled or passkey not available - silently ignore
      console.debug('[Passkey] Sign in cancelled or not available:', error.message);
    } finally {
      setIsPasskeyLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email, password);
  };

  const handleGoogleSignIn = async () => {
    if (onGoogleSignIn) {
      await onGoogleSignIn();
    }
  };

  const handleSwitchToSignUp = () => {
    onSwitchToSignUp();
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-background/40 backdrop-blur-2xl flex items-center justify-center p-4"
      onClick={() => onOpenChange(false)}
    >
      <div 
        className="max-w-4xl w-full bg-card border border-border/40 rounded-xl shadow-xl flex overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Image Side */}
        <div className="hidden md:flex md:w-1/2 relative bg-card">
          <img 
            src="/Images/sign.png" 
            alt="Sign in illustration"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          
          {/* Alifh Logo - Top Left */}
          <div className="absolute top-5 left-5">
            <img 
              src="/assets/Alifh_logo_White.svg" 
              alt="Alifh"
              className="h-6 w-auto"
            />
          </div>
          
          {/* Tagline - Bottom Left */}
          <div className="absolute bottom-5 left-5">
            <p className="text-white/90 text-xs font-medium tracking-wide">
              Automotive Excellence
            </p>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="w-full md:w-1/2 flex flex-col bg-card">
          {/* Header */}
          <div className="p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Sign In</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Enter your credentials to continue
            </p>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 space-y-5 flex-1 overflow-y-auto">
            {/* Error Message */}
            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                <p className="text-sm text-destructive leading-relaxed">
                  {error}
                </p>
              </div>
            )}

            {/* Email & Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-semibold text-muted-foreground/70">
                  Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username webauthn"
                    className="w-full h-10 px-3 pr-10 bg-muted/20 border border-border/40 rounded-lg text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors disabled:opacity-50"
                    placeholder="you@example.com"
                    required
                    disabled={isLoading || isPasskeyLoading}
                  />
                  {/* Passkey fingerprint icon - subtle, inside input */}
                  <button
                    type="button"
                    onClick={handlePasskeySignIn}
                    disabled={isLoading || isPasskeyLoading}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground/50 hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                    aria-label="Sign in with passkey"
                    title="Sign in with passkey"
                  >
                    {isPasskeyLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Fingerprint className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-muted-foreground/70">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 px-3 pr-14 bg-muted/20 border border-border/40 rounded-lg text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors disabled:opacity-50"
                    placeholder="••••••••"
                    required
                    disabled={isLoading || isPasskeyLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Forgot Password - Inline */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onSwitchToForgotPassword}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || isPasskeyLoading || !email || !password}
                className={cn(
                  "w-full h-10 px-4 rounded-lg text-sm font-semibold transition-colors",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-border/40" />
              <span className="text-xs font-medium text-muted-foreground/70">or continue with</span>
              <div className="flex-1 border-t border-border/40" />
            </div>

            {/* Alternative Sign-in Options */}
            <div className="space-y-3">
              {onGoogleSignIn && (
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className={cn(
                    "w-full h-10 px-4 rounded-lg text-sm font-semibold transition-colors",
                    "border border-border/40 bg-muted/30 text-foreground",
                    "hover:bg-muted/50 disabled:opacity-50",
                    "flex items-center justify-center gap-3"
                  )}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </button>
              )}

              {onSwitchToMagicLink && (
                <button
                  onClick={onSwitchToMagicLink}
                  disabled={isLoading}
                  className={cn(
                    "w-full h-10 px-4 rounded-lg text-sm font-semibold transition-colors",
                    "border border-border/40 bg-muted/30 text-foreground",
                    "hover:bg-muted/50 disabled:opacity-50"
                  )}
                >
                  Magic Link
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border/40 p-6">
            <p className="text-sm text-muted-foreground text-center">
              Don't have an account?{" "}
              <button
                onClick={handleSwitchToSignUp}
                className="font-semibold text-foreground hover:text-primary transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}