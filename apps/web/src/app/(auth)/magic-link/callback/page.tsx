"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PageLoader } from "@/components/shared/page-loader";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

function MagicLinkCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const hasHandledRef = useRef(false);

  useEffect(() => {
    if (hasHandledRef.current) return;
    hasHandledRef.current = true;
    const handleMagicLinkCallback = async () => {
      try {
        setTimeout(() => {
          setStatus('success');
          setTimeout(() => {
            router.push('/');
          }, 1000);
        }, 2000);
      } catch (error) {
        console.error("Magic link callback error:", error);
        setStatus('error');
      }
    };

    handleMagicLinkCallback();
  }, [searchParams, router]);

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
            <div className="w-12 h-12 rounded-full bg-success-muted flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
          )}
          {status === 'error' && (
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
          )}
        </div>

        {/* Message */}
        <div className="space-y-1">
          <h1 className="text-callout font-semibold text-foreground tracking-tight">
            {status === 'loading' && 'Signing you in...'}
            {status === 'success' && 'Welcome back'}
            {status === 'error' && 'Something went wrong'}
          </h1>
          <p className="text-subhead text-muted-foreground">
            {status === 'loading' && 'Verifying your magic link'}
            {status === 'success' && 'Redirecting...'}
            {status === 'error' && 'Please try again'}
          </p>
        </div>

        {/* Error action */}
        {status === 'error' && (
          <button
            onClick={() => router.push('/')}
            className={cn(
              "w-full h-10 rounded-lg text-subhead font-semibold transition-colors",
              "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            Go home
          </button>
        )}
      </div>
    </div>
  );
}

export default function MagicLinkCallbackPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <MagicLinkCallback />
    </Suspense>
  );
}
