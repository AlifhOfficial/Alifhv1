/**
 * Custom Global Error Page - Alifh Design System
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-sm w-full text-center space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred. Please try again.
          </p>
          
          {error.digest && (
            <p className="text-xs text-muted-foreground/50 font-mono pt-2">
              {error.digest}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={reset}
            className={cn(
              "h-10 inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors",
              "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            <RefreshCcw className="h-4 w-4" />
            Try again
          </button>
          
          <Link
            href="/"
            className={cn(
              "h-10 inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors",
              "bg-muted/30 text-foreground hover:bg-muted/50"
            )}
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
