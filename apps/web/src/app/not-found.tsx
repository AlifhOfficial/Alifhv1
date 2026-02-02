/**
 * Custom 404 Not Found Page
 */

'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col justify-center">
      <div className="max-w-[1600px] mx-auto w-full">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            404
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            Wrong turn.
            <br />
            <span className="text-muted-foreground">This page doesn't exist.</span>
          </h1>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto h-11 px-8 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
          >
            Back to Home
          </Link>
          <Link
            href="/listings"
            className="w-full sm:w-auto h-11 px-8 bg-muted text-foreground text-sm font-semibold rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
          >
            Browse Cars
          </Link>
        </div>

      </div>
    </section>
  );
}
