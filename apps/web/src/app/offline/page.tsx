'use client';

import { WifiOff, RefreshCcw } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-sm w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
            <WifiOff className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            You're offline
          </h1>
          <p className="text-sm text-muted-foreground">
            Check your connection and try again.
          </p>
        </div>

        {/* Action */}
        <div className="pt-2">
          <button
            onClick={() => window.location.reload()}
            className={cn(
              "w-full h-10 inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors",
              "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            <RefreshCcw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
