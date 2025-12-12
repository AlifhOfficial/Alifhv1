/**
 * Email Verification Page - Alifh Design Philosophy
 * 
 * Dedicated page for email verification flow
 * Handles verification tokens and user feedback
 */

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Mail } from "lucide-react";
import { authClient } from "@/lib/auth-client";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const error = searchParams.get("error");

  const [verificationStatus, setVerificationStatus] = useState<
    'loading' | 'success' | 'error' | 'invalid'
  >('loading');
  const [message, setMessage] = useState("");

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
        token,
      });

      if (result.error) {
        setVerificationStatus('error');
        setMessage(result.error.message || "Email verification failed");
        return;
      }

      setVerificationStatus('success');
      setMessage("Your email has been verified successfully!");
      
      // Auto-redirect after success
      setTimeout(() => {
        router.push("/?verified=true");
      }, 2000);

    } catch (error: any) {
      setVerificationStatus('error');
      setMessage(error.message || "Email verification failed");
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'loading':
        return <Mail className="w-8 h-8 text-primary animate-pulse" />;
      case 'success':
        return <CheckCircle2 className="w-8 h-8 text-green-500" />;
      case 'error':
      case 'invalid':
        return <XCircle className="w-8 h-8 text-red-500" />;
    }
  };

  const getStatusTitle = () => {
    switch (verificationStatus) {
      case 'loading':
        return "Verifying your email...";
      case 'success':
        return "Email verified!";
      case 'error':
        return "Verification failed";
      case 'invalid':
        return "Invalid link";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-lg">
        <div className="flex flex-col items-center space-y-6 text-center">
          {/* Status Icon */}
          <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center">
            {getStatusIcon()}
          </div>

          {/* Status Message */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-foreground">
              {getStatusTitle()}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {message}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-3">
            {verificationStatus === 'success' && (
              <button
                onClick={() => router.push("/")}
                className="w-full h-12 px-6 bg-primary text-primary-foreground text-base rounded-xl font-medium hover:bg-primary/90 transition-all duration-300 transform hover:scale-[1.02]"
              >
                Continue to Alifh
              </button>
            )}

            {(verificationStatus === 'error' || verificationStatus === 'invalid') && (
              <>
                <button
                  onClick={() => router.push("/")}
                  className="w-full h-12 px-6 bg-primary text-primary-foreground text-base rounded-xl font-medium hover:bg-primary/90 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Back to sign in
                </button>
                
                {verificationStatus === 'error' && (
                  <button
                    onClick={verifyEmail}
                    className="w-full h-12 px-6 bg-muted text-foreground text-base rounded-xl font-medium hover:bg-muted/80 transition-all duration-300"
                  >
                    Try again
                  </button>
                )}
              </>
            )}
          </div>

          {/* Auto-redirect notice */}
          {verificationStatus === 'success' && (
            <p className="text-xs text-muted-foreground/60">
              Redirecting automatically in 2 seconds...
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}