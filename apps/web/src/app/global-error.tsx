/**
 * Custom Global Error Page
 * 
 * Handles critical errors in root layout.
 * Can't use CSS vars or theme providers - uses raw Tailwind dark: variants.
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';

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
      <body className="bg-background text-foreground">
        <section className="pt-28 pb-20 px-4 compact:px-6 large:px-8 min-h-screen flex flex-col justify-center">
          <div className="max-w-[1600px] mx-auto w-full">
            
            {/* Header */}
            <div className="text-center mb-12 space-y-4">
              <p className="wordmark-geom text-headline text-foreground">
                Revvup
              </p>
              <span className="text-subhead font-semibold uppercase tracking-wider text-destructive">
                Critical Error
              </span>
              <h1 className="text-title2 compact:text-title1 large:text-display font-semibold tracking-tight text-foreground">
                Something went wrong.
                <br />
                <span className="text-label-tertiary">Let's try that again.</span>
              </h1>
              {error.digest && (
                <p className="text-caption1 text-label-quaternary font-mono">
                  {error.digest}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col compact:flex-row items-center justify-center gap-3">
              <button
                onClick={reset}
                className="w-full compact:w-auto h-11 px-8 bg-primary text-primary-foreground text-subhead font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="w-full compact:w-auto h-11 px-8 bg-secondary text-secondary-foreground text-subhead font-semibold rounded-lg hover:bg-secondary/80 transition-colors flex items-center justify-center"
              >
                Back to Home
              </Link>
            </div>

          </div>
        </section>
      </body>
    </html>
  );
}
