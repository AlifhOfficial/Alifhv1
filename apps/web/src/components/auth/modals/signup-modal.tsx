/**
 * SignUpModal Component
 * Clean, focused sign-up experience
 */

"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignIn: () => void;
  onSubmit: (name: string, email: string, password: string) => Promise<void>;
  onGoogleSignUp?: () => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function SignUpModal({
  open,
  onOpenChange,
  onSwitchToSignIn,
  onSubmit,
  onGoogleSignUp,
  isLoading = false,
  error,
}: SignUpModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(name, email, password);
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-background/60 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={() => onOpenChange(false)}
    >
      <div 
        className="w-full max-w-[440px] md:max-w-[720px] bg-card border border-border/50 rounded-2xl shadow-2xl flex overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Typography Side - 40% */}
        <div className="hidden md:flex w-[240px] relative bg-black flex-shrink-0 flex-col justify-between p-8">
          {/* Logo */}
          <div>
            <img 
              src="/assets/Alifh_logo_White.svg" 
              alt="Alifh"
              className="h-5 w-auto"
            />
          </div>
          
          {/* Bold Typography - Horizontal */}
          <div className="flex-1 flex items-center justify-center">
            <h3 className="text-4xl font-bold text-white tracking-tight">
              Alifh.
            </h3>
          </div>
          
          {/* Tagline - Horizontal */}
          <p className="text-white/40 text-[10px] font-medium">
            Your move.
          </p>
        </div>

        {/* Right Form Side */}
        <div className="flex-1 flex flex-col min-h-[520px] md:min-h-[560px] max-h-[85vh]">
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-0">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">Create account</h2>
              <p className="text-[13px] text-muted-foreground mt-1">Join the Alifh community</p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 -m-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 pt-5">
            {/* Error */}
            {error && (
              <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                <p className="text-[13px] text-destructive">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-[13px] font-medium text-muted-foreground">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-3.5 bg-muted/30 border border-border/50 rounded-xl text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all disabled:opacity-50"
                  placeholder="Your name"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="signup-email" className="text-[13px] font-medium text-muted-foreground">
                  Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-3.5 bg-muted/30 border border-border/50 rounded-xl text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all disabled:opacity-50"
                  placeholder="you@example.com"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="signup-password" className="text-[13px] font-medium text-muted-foreground">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 px-3.5 pr-14 bg-muted/30 border border-border/50 rounded-xl text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all disabled:opacity-50"
                    placeholder="8+ characters"
                    required
                    disabled={isLoading}
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-muted-foreground/60 hover:text-foreground transition-colors"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !name || !email || !password}
                className={cn(
                  "w-full h-11 rounded-xl text-[15px] font-semibold transition-all",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </button>
            </form>

            {/* Divider */}
            {onGoogleSignUp && (
              <div className="flex items-center gap-4 my-5">
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-border/50" />
              </div>
            )}

            {/* Google */}
            {onGoogleSignUp && (
              <button
                onClick={onGoogleSignUp}
                disabled={isLoading}
                className={cn(
                  "w-full h-11 rounded-xl text-[14px] font-semibold transition-all",
                  "border border-border/50 bg-muted/20 text-foreground",
                  "hover:bg-muted/40 disabled:opacity-50",
                  "flex items-center justify-center gap-2.5"
                )}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            )}

            {/* Terms */}
            <p className="text-[11px] text-muted-foreground/50 text-center mt-5 leading-relaxed">
              By signing up, you agree to our{" "}
              <a href="/terms-of-service" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
              {" "}and{" "}
              <a href="/privacy-policy" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </a>
            </p>
          </div>

          {/* Footer */}
          <div className="border-t border-border/40 px-6 py-4">
            <p className="text-[13px] text-muted-foreground text-center">
              Already have an account?{" "}
              <button
                onClick={onSwitchToSignIn}
                className="font-semibold text-foreground hover:text-primary transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
