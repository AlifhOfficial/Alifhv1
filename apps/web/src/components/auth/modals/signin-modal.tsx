/**
 * SignInModal Component - Alifh Design System
 * Production-ready sign-in modal with Better Auth features
 * Props-based pattern for clean separation of concerns
 */

"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignUp: () => void;
  onSwitchToForgotPassword: () => void;
  onSwitchToMagicLink?: () => void;
  onSubmit: (email: string, password: string) => Promise<void>;
  onGoogleSignIn?: () => Promise<void>;
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
  isLoading = false,
  error,
}: SignInModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => onOpenChange(false)}
    >
      <div 
        className="max-w-4xl w-full bg-card border border-border/40 rounded-lg flex overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Image Side */}
        <div className="hidden md:flex md:w-1/2 relative bg-gradient-to-br from-blue-50 to-indigo-100">
          <img 
            src="/Images/Sign_in.png" 
            alt="Sign in illustration"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        {/* Right Form Side */}
        <div className="w-full md:w-1/2 flex flex-col">
          {/* Header */}
          <div className="border-b border-border/40 p-6 relative">
            
            <Mail className="w-4 h-4 text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium text-foreground mb-2">Sign In</h2>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to continue
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-xs text-destructive leading-relaxed">
                {error}
              </p>
            </div>
          )}

          {/* Email & Password Form */}
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

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 px-3 bg-background border border-border/40 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors disabled:opacity-50"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full h-10 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Forgot Password */}
          <div className="text-center">
            <button
              onClick={onSwitchToForgotPassword}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Forgot your password?
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center">
            <div className="flex-1 border-t border-border/40"></div>
            <span className="px-3 text-xs text-muted-foreground">or</span>
            <div className="flex-1 border-t border-border/40"></div>
          </div>

          {/* Alternative Sign-in Options */}
          <div className="space-y-3">
            {onSwitchToMagicLink && (
              <button
                onClick={onSwitchToMagicLink}
                disabled={isLoading}
                className="w-full h-10 px-4 border border-border/40 text-foreground text-sm font-medium rounded-lg hover:bg-muted/50 disabled:opacity-50 transition-colors"
              >
                Continue with Magic Link
              </button>
            )}

            {onGoogleSignIn && (
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full h-10 px-4 border border-border/40 text-foreground text-sm font-medium rounded-lg hover:bg-muted/50 disabled:opacity-50 transition-colors flex items-center justify-center gap-3"
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
                Continue with Google
              </button>
            )}
          </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border/40 p-6">
            <p className="text-xs text-muted-foreground text-center">
              Don't have an account?{" "}
              <button
                onClick={handleSwitchToSignUp}
                className="text-primary hover:underline font-medium"
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