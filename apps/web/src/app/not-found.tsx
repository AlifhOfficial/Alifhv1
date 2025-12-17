/**
 * Custom 404 Not Found Page - Alifh Design System
 * Minimalist error page following "Less is More" principle
 */

'use client';

import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Error Code */}
        <div className="space-y-3">
          <h1 className="text-8xl md:text-9xl font-bold text-foreground/10 tracking-tighter">
            404
          </h1>
          <div className="h-px w-24 mx-auto bg-border/40" />
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Page Not Found
          </h2>
          <p className="text-base text-muted-foreground/70 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          
          <Link
            href="/listings"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border/40 bg-card hover:bg-muted/20 px-6 py-3 text-sm font-semibold transition-colors w-full sm:w-auto"
          >
            <Search className="h-4 w-4" />
            Browse Vehicles
          </Link>
        </div>

        {/* Back Link */}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground/70 hover:text-foreground transition-colors mt-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Go back
        </button>
      </div>
    </div>
  );
}
