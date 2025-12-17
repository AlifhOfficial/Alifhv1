/**
 * Custom Global Error Page - Alifh Design System
 * Minimalist error page for runtime errors
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-6">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Something went wrong
          </h2>
          <p className="text-base text-muted-foreground/70 max-w-md mx-auto">
            We're sorry, but something unexpected happened. Please try again.
          </p>
          
          {/* Error Digest (for debugging) */}
          {error.digest && (
            <p className="text-xs text-muted-foreground/50 font-mono pt-2">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto"
          >
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </button>
          
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border/40 bg-card hover:bg-muted/20 px-6 py-3 text-sm font-semibold transition-colors w-full sm:w-auto"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
