/**
 * Reset Password Page - Alifh Design Philosophy
 * 
 * Premium, minimal password reset experience
 * Sophisticated design matching Alifh's luxury aesthetic
 */

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, ArrowLeft } from "lucide-react";
import { authClient } from "@/lib/auth/client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    // Validate token on mount
    if (!token) {
      router.push("/");
      return;
    }
    
    // Token exists, assume it's valid for now
    // Better Auth will validate during reset
    setIsValidToken(true);
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || isLoading) return;

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const result = await authClient.resetPassword({
        newPassword: formData.password,
        token,
      });

      if (result.error) {
        setError(result.error.message || "Password reset failed");
        return;
      }

      // Success - redirect to sign in
      router.push("/?reset=success");
    } catch (error: any) {
      setError(error.message || "Password reset failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card border border-border/40 rounded-lg">
            {/* Header */}
            <div className="border-b border-border/40 p-6">
              <Lock className="w-4 h-4 text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium text-foreground mb-2">Invalid Reset Link</h2>
              <p className="text-sm text-muted-foreground">
                This password reset link is invalid or has expired.
              </p>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <button
                onClick={() => router.push("/")}
                className="w-full h-10 px-4 border border-border/40 text-foreground text-sm font-medium rounded-lg hover:bg-muted/50 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border/40 rounded-lg">
          {/* Header */}
          <div className="border-b border-border/40 p-6">
            <Lock className="w-4 h-4 text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium text-foreground mb-2">Reset Password</h2>
            <p className="text-sm text-muted-foreground">
              Enter your new password below
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full h-10 px-3 bg-background border border-border/40 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors disabled:opacity-50"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    minLength={8}
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

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full h-10 px-3 bg-background border border-border/40 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors disabled:opacity-50"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!formData.password || !formData.confirmPassword || isLoading}
                className="w-full h-10 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Updating password..." : "Update Password"}
              </button>
            </form>

            {/* Helper text */}
            <div className="bg-muted/40 border border-border/40 rounded-lg p-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Password must be at least 8 characters long.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border/40 p-6">
            <button
              onClick={() => router.push("/")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}