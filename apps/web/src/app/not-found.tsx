/**
 * Custom 404 Not Found Page - Alifh Design System
 */

'use client';

import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-sm w-full text-center space-y-6">
        {/* Error Code */}
        <div className="space-y-4">
          <p className="text-6xl font-bold text-muted-foreground/20 tracking-tighter">
            404
          </p>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-foreground tracking-tight">
              Page not found
            </h1>
            <p className="text-sm text-muted-foreground">
              This page doesn't exist or has been moved.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <Link
            href="/"
            className={cn(
              "h-10 inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors",
              "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
          
          <Link
            href="/listings"
            className={cn(
              "h-10 inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors",
              "bg-muted/30 text-foreground hover:bg-muted/50"
            )}
          >
            <Search className="h-4 w-4" />
            Browse vehicles
          </Link>
        </div>

        {/* Back Link */}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Go back
        </button>
      </div>
    </div>
  );
}
