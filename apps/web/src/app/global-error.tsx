/**
 * Custom Global Error Page
 * 
 * Handles critical errors in root layout.
 * Can't use CSS vars or theme providers - uses raw Tailwind dark: variants.
 */

'use client';

import { useEffect, useState } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.error('Global Error:', error);
  }, [error]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-neutral-950">
        <div className="min-h-screen flex flex-col">
          {/* Top section with logo */}
          <div className="flex-1 flex flex-col items-center justify-end pb-8 pt-20">
            <div className={`transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {/* Inline SVG logo - can't use next/image in global error */}
              <svg 
                viewBox="0 0 100 24" 
                className="h-16 sm:h-20 w-auto fill-neutral-900 dark:fill-white"
                aria-label="Alifh"
              >
                <text x="0" y="20" className="text-[20px] font-bold tracking-tight">ALIFH</text>
              </svg>
            </div>
          </div>

          {/* Center divider with error label */}
          <div className={`flex items-center justify-center gap-6 py-8 transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '100ms' }}>
            <div className="h-px w-16 sm:w-24 bg-neutral-200 dark:bg-neutral-800" />
            <span className="text-xs font-semibold tracking-[0.3em] text-neutral-400 dark:text-neutral-600 uppercase">
              Error
            </span>
            <div className="h-px w-16 sm:w-24 bg-neutral-200 dark:bg-neutral-800" />
          </div>

          {/* Bottom section with content */}
          <div className={`flex-1 flex flex-col items-center justify-start pt-8 pb-20 px-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
            {/* Message */}
            <div className="text-center mb-10">
              <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-white tracking-tight mb-3">
                Something went wrong
              </h1>
              <p className="text-neutral-500 dark:text-neutral-400 text-[15px]">
                A critical error occurred. Please try again.
              </p>
              {error.digest && (
                <p className="text-xs text-neutral-400 dark:text-neutral-600 font-mono mt-4">
                  {error.digest}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={reset}
                className="h-12 px-8 inline-flex items-center justify-center rounded-full text-[15px] font-semibold tracking-tight transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700"
              >
                Try again
              </button>
              
              <a
                href="/"
                className="h-12 px-8 inline-flex items-center justify-center rounded-full text-[15px] font-semibold tracking-tight transition-all duration-200 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                Go home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
