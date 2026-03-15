/**
 * Custom Global Error Page
 * 
 * Handles critical errors in root layout.
 * Can't use CSS vars or theme providers - uses raw Tailwind dark: variants.
 */

'use client';

import { useEffect } from 'react';

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
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-neutral-950">
        <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col justify-center">
          <div className="max-w-[1600px] mx-auto w-full">
            
            {/* Header */}
            <div className="text-center mb-12 space-y-4">
              <p className="wordmark-geom text-lg text-neutral-900 dark:text-white">
                Revvup
              </p>
              <span className="text-sm font-semibold uppercase tracking-wider text-red-600 dark:text-red-500">
                Critical Error
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                Something went wrong.
                <br />
                <span className="text-neutral-500 dark:text-neutral-400">Let's try that again.</span>
              </h1>
              {error.digest && (
                <p className="text-xs text-neutral-400 dark:text-neutral-600 font-mono">
                  {error.digest}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={reset}
                className="w-full sm:w-auto h-11 px-8 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors flex items-center justify-center"
              >
                Try Again
              </button>
              <a
                href="/"
                className="w-full sm:w-auto h-11 px-8 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm font-semibold rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors flex items-center justify-center"
              >
                Back to Home
              </a>
            </div>

          </div>
        </section>
      </body>
    </html>
  );
}
