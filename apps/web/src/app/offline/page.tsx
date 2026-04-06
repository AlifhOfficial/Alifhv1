/**
 * Offline Page - Shown when user has no network connection
 */

'use client';

export default function OfflinePage() {
  return (
    <section className="pt-28 pb-20 px-4 compact:px-6 large:px-8 min-h-screen flex flex-col justify-center">
      <div className="max-w-[1600px] mx-auto w-full">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <span className="text-subhead font-semibold uppercase tracking-wider text-muted-foreground">
            Offline
          </span>
          <h1 className="text-title2 compact:text-title1 large:text-display font-semibold tracking-tight">
            You're offline.
            <br />
            <span className="text-muted-foreground">Check your connection and try again.</span>
          </h1>
        </div>

        {/* Actions */}
        <div className="flex flex-col compact:flex-row items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full compact:w-auto h-11 px-8 bg-primary text-primary-foreground text-subhead font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
          >
            Try Again
          </button>
        </div>

      </div>
    </section>
  );
}
