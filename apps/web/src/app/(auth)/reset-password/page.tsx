/**
 * Reset Password Page - Alifh Design System
 */

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, ArrowLeft, X } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/utils/cn";
import { PageLoader } from "@/components/shared/page-loader";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push("/");
      return;
    }
    setIsValidToken(true);
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || isLoading) return;

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const result = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (result.error) {
        setError(result.error.message || "Password reset failed");
        return;
      }

      router.push("/?reset=success");
    } catch (error: any) {
      setError(error.message || "Password reset failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Invalid token state
  if (!isValidToken) {
    return (
      <div className="fixed inset-0 z-[9999] bg-background/40 backdrop-blur-2xl flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-card border border-border/40 rounded-xl shadow-xl p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <X className="h-6 w-6 text-destructive" />
            </div>
            
            <div className="text-center space-y-1">
              <h1 className="text-base font-semibold text-foreground tracking-tight">
                Invalid reset link
              </h1>
              <p className="text-sm text-muted-foreground">
                This link is invalid or has expired.
              </p>
            </div>

            <button
              onClick={() => router.push("/")}
              className={cn(
                "w-full h-10 rounded-lg text-sm font-semibold transition-colors",
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
    <div className="fixed inset-0 z-[9999] bg-background/40 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-card border border-border/40 rounded-xl shadow-xl">
        {/* Header */}
        <div className="p-6 relative">
          <button
            onClick={() => router.push("/")}
            className="absolute top-4 left-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="pt-6">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Reset password
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Enter your new password
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
              <label htmlFor="password" className="text-sm font-semibold text-muted-foreground/70">
                New password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 px-3 pr-10 bg-muted/20 border border-border/40 rounded-lg text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors disabled:opacity-50"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum 8 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={!password || isLoading}
              className={cn(
                "w-full h-10 rounded-lg text-sm font-semibold transition-colors",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? "Updating..." : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ResetPasswordForm />
    </Suspense>
  );
}