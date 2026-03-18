/**
 * Email Verification Page - Revvup Design System
 */

"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, ShieldX } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/utils/cn";
import { PageLoader } from "@/components/shared/page-loader";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const error = searchParams.get("error");
  const callbackURL = searchParams.get("callbackURL") || "/";
  const isInvalidToken = error === 'invalid_token' || !token;

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const verifyEmail = useCallback(async () => {
    if (!token) return;

    try {
      const result = await authClient.verifyEmail({
        query: { token },
      });

      if (result.error) {
        setStatus('error');
        setErrorMessage(result.error.message || "Verification failed");
        return;
      }

      setStatus('success');

      // Auto-redirect after success - prompt user to sign in
      setTimeout(() => {
        const destination = callbackURL.startsWith("/") ? callbackURL : `/${callbackURL}`;
        router.push(`${destination}${destination.includes('?') ? '&' : '?'}auth=signin`);
      }, 1500);

    } catch (err: unknown) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : "Verification failed");
    }
  }, [callbackURL, router, token]);

  useEffect(() => {
    if (isInvalidToken) return;
    const timer = window.setTimeout(() => {
      void verifyEmail();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isInvalidToken, verifyEmail]);

  const displayStatus = isInvalidToken ? 'invalid' : status;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-xs w-full text-center space-y-4">
        {/* Icon */}
        <div className="flex justify-center">
          {displayStatus === 'loading' && (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          )}
          {displayStatus === 'success' && (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
          )}
          {displayStatus === 'error' && (
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
          )}
          {displayStatus === 'invalid' && (
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldX className="h-6 w-6 text-destructive" />
            </div>
          )}
        </div>

        {/* Message */}
        <div className="space-y-1">
          <h1 className="text-base font-semibold text-foreground tracking-tight">
            {displayStatus === 'loading' && 'Verifying email...'}
            {displayStatus === 'success' && 'Email verified'}
            {displayStatus === 'error' && 'Verification failed'}
            {displayStatus === 'invalid' && 'Invalid link'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {displayStatus === 'loading' && 'Please wait'}
            {displayStatus === 'success' && 'Redirecting...'}
            {displayStatus === 'error' && (errorMessage || 'Please try again')}
            {displayStatus === 'invalid' && 'This link is invalid or expired'}
          </p>
        </div>

        {/* Actions */}
        {displayStatus !== 'loading' && displayStatus !== 'success' && (
          <div className="flex flex-col gap-2 pt-2">
            {displayStatus === 'error' && (
              <button
                onClick={verifyEmail}
                className={cn(
                  "w-full h-10 rounded-lg text-sm font-semibold transition-colors",
                  "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                Try again
              </button>
            )}
            <button
              onClick={() => router.push('/')}
              className={cn(
                "w-full h-10 rounded-lg text-sm font-semibold transition-colors",
                "bg-muted/30 text-foreground hover:bg-muted/50"
              )}
            >
              Go home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <VerifyEmailForm />
    </Suspense>
  );
}
