/**
 * Email Verification Page - Alifh Design Philosophy
 * 
 * Dedicated page for email verification flow
 * Handles verification tokens and user feedback
 */

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, ShieldAlert } from "lucide-react";
import { authClient } from "@/lib/auth/client";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const error = searchParams.get("error");
  const callbackURL = searchParams.get("callbackURL") || "/";

  const [verificationStatus, setVerificationStatus] = useState<
    'loading' | 'success' | 'error' | 'invalid'
  >('loading');
  const [message, setMessage] = useState("Sit tight while we verify your account details.");

  useEffect(() => {
    if (error === 'invalid_token' || !token) {
      setVerificationStatus('invalid');
      setMessage("This verification link is invalid or has expired.");
      return;
    }

    // Auto-verify when component mounts with valid token
    verifyEmail();
  }, [token, error]);

  const verifyEmail = async () => {
    if (!token) return;

    try {
      // Better Auth handles email verification automatically via URL
      // When users click the link, they're redirected here
      // We can call the verification endpoint to confirm
      
      const result = await authClient.verifyEmail({
        query: { token },
      });

      if (result.error) {
        setVerificationStatus('error');
        setMessage(result.error.message || "We couldn't verify this link. Please try again or request a fresh email.");
        return;
      }

      setVerificationStatus('success');
      setMessage("You're verified! We're preparing your Alifh experience.");

      const redirectWithVerified = () => {
        try {
          const normalizedCallback = callbackURL.startsWith("http")
            ? callbackURL
            : callbackURL.startsWith("/")
              ? callbackURL
              : `/${callbackURL}`;
          const destination = new URL(normalizedCallback, window.location.origin);
          destination.searchParams.set("verified", "true");
          return `${destination.pathname}${destination.search}${destination.hash}`;
        } catch {
          return "/?verified=true";
        }
      };

      const redirectTarget = redirectWithVerified();

      // Auto-redirect after success
      setTimeout(() => {
        router.push(redirectTarget);
      }, 2000);

    } catch (error: any) {
      setVerificationStatus('error');
      setMessage(error.message || "We couldn't verify this link. Please try again.");
    }
  };

  const getStatusTitle = () => {
    switch (verificationStatus) {
      case 'loading':
        return "Verifying your account";
      case 'success':
        return "You're all set";
      case 'error':
        return "We couldn't verify";
      case 'invalid':
        return "Link not valid";
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'loading':
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-xl animate-pulse" />
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin relative z-10" />
          </div>
        );
      case 'success':
        return (
          <div className="animate-in zoom-in duration-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
        );
      case 'error':
        return (
          <div className="animate-in zoom-in duration-500">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        );
      case 'invalid':
        return (
          <div className="animate-in zoom-in duration-500">
            <ShieldAlert className="w-8 h-8 text-amber-500" />
          </div>
        );
    }
  };

  const handleRedirect = () => {
    try {
      const normalizedCallback = callbackURL.startsWith("http")
        ? callbackURL
        : callbackURL.startsWith("/")
          ? callbackURL
          : `/${callbackURL}`;
      const destination = new URL(normalizedCallback || "/", window.location.origin);
      destination.searchParams.set("verified", "true");
      router.push(`${destination.pathname}${destination.search}${destination.hash}`);
    } catch {
      router.push("/?verified=true");
    }
  };

  const handlePrimaryAction = () => {
    if (verificationStatus === 'success') {
      handleRedirect();
    } else if (verificationStatus === 'error') {
      verifyEmail();
    } else if (verificationStatus === 'invalid') {
      router.push("/");
    }
  };

  const getPrimaryActionLabel = () => {
    switch (verificationStatus) {
      case 'success':
        return "Continue to Alifh";
      case 'error':
        return "Try again";
      case 'invalid':
        return "Back to home";
      default:
        return "";
    }
  };

  const supportEmail = "support@alifh.com";

  const getSecondaryAction = () => {
    if (verificationStatus === 'error' || verificationStatus === 'invalid') {
      return "Contact support";
    }
    return null;
  };

  const handleSecondaryAction = () => {
    window.location.href = `mailto:${supportEmail}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-sm w-full bg-card border border-border/40 rounded-2xl p-8 shadow-xl">
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center shadow-inner">
              {getStatusIcon()}
            </div>

            <div className="space-y-3">
              <h1 className="text-xl font-semibold text-foreground tracking-tight">
                {getStatusTitle()}
              </h1>
              <p className="text-sm text-muted-foreground/80 leading-relaxed">
                {message}
              </p>
            </div>

            <div className="w-full space-y-3">
              {verificationStatus !== 'loading' && (
                <button
                  onClick={handlePrimaryAction}
                  className="w-full h-12 px-6 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 transition-all duration-300 transform hover:scale-[1.01]"
                >
                  {getPrimaryActionLabel()}
                </button>
              )}

              {verificationStatus !== 'loading' && getSecondaryAction() && (
                <button
                  onClick={handleSecondaryAction}
                  className="w-full h-12 px-6 bg-muted/50 text-foreground text-sm font-medium rounded-xl hover:bg-muted/70 transition-all duration-300"
                >
                  {getSecondaryAction()}
                </button>
              )}

              {verificationStatus === 'loading' && (
                <div className="w-full bg-muted/20 rounded-full h-1 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full animate-pulse" />
                </div>
              )}
            </div>

            {verificationStatus === 'success' && (
              <p className="text-xs text-muted-foreground/60">
                Redirecting you in a moment...
              </p>
            )}

            {verificationStatus === 'loading' && (
              <p className="text-xs text-muted-foreground/60">
                Verifying your account details
              </p>
            )}
          </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="max-w-sm w-full bg-card border border-border/40 rounded-2xl p-8 shadow-xl flex flex-col items-center space-y-4 text-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-sm text-muted-foreground/80">Preparing the verification experience…</p>
        </div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}