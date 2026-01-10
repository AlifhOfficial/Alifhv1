/**
 * Custom Global Error Page - Alifh Design System
 * Handles critical errors in root layout (can't use CSS vars)
 */

'use client';

import { useEffect } from 'react';
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950 px-4">
          <div className="max-w-sm w-full text-center space-y-6">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-1">
              <h1 className="text-xl font-semibold text-neutral-900 dark:text-white tracking-tight">
                Something went wrong
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                A critical error occurred. Please try again.
              </p>
              
              {error.digest && (
                <p className="text-xs text-neutral-400 dark:text-neutral-500 font-mono pt-2">
                  {error.digest}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={reset}
                className="h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <RefreshCcw className="h-4 w-4" />
                Try again
              </button>
              
              <a
                href="/"
                className="h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <Home className="h-4 w-4" />
                Go home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
