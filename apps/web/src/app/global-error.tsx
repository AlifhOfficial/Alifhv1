/**
 * Custom Global Error Page - Alifh Design System
 * Handles critical errors that occur in the root layout
 */

'use client';

import { useEffect } from 'react';
import { AlertTriangle, Home } from 'lucide-react';

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
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black px-4">
          <div className="max-w-2xl w-full text-center space-y-8">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 dark:bg-red-950 p-6">
                <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold text-black dark:text-white tracking-tight">
                Critical Error
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                A critical error occurred. Please refresh the page or return home.
              </p>
              
              {error.digest && (
                <p className="text-xs text-gray-500 font-mono pt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 text-white px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto"
              >
                Try Again
              </button>
              
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 px-6 py-3 text-sm font-semibold transition-colors w-full sm:w-auto"
              >
                <Home className="h-4 w-4" />
                Go Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
