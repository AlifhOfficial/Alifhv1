/**
 * Email Verification Page - Alifh Design System
 */

"use client";

import { useEffect, useState, Suspense } from "react";
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

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (error === 'invalid_token' || !token) {
      setStatus('invalid');
      return;
    }
    verifyEmail();
  }, [token, error]);

  const verifyEmail = async () => {
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

    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || "Verification failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-xs w-full text-center space-y-4">
        {/* Icon */}
        <div className="flex justify-center">
          {status === 'loading' && (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
          )}
          {status === 'error' && (
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
          )}
          {status === 'invalid' && (
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldX className="h-6 w-6 text-destructive" />
            </div>
          )}
        </div>

        {/* Message */}
        <div className="space-y-1">
          <h1 className="text-base font-semibold text-foreground tracking-tight">
            {status === 'loading' && 'Verifying email...'}
            {status === 'success' && 'Email verified'}
            {status === 'error' && 'Verification failed'}
            {status === 'invalid' && 'Invalid link'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {status === 'loading' && 'Please wait'}
            {status === 'success' && 'Redirecting...'}
            {status === 'error' && (errorMessage || 'Please try again')}
            {status === 'invalid' && 'This link is invalid or expired'}
          </p>
        </div>

        {/* Actions */}
        {status !== 'loading' && status !== 'success' && (
          <div className="flex flex-col gap-2 pt-2">
            {status === 'error' && (
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