/**
 * About Closing Section
 * Simple invitation with macOS window style.
 */

'use client';

import Link from 'next/link';

// ============================================================================
// INFOGRAPHIC: Your Move - macOS window style
// ============================================================================

function YourMoveInfographic() {
  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-sidebar border border-border/40 p-3 sm:p-6 lg:p-12">
      {/* macOS Window Frame */}
      <div className="rounded-lg overflow-hidden shadow-2xl border border-white/10">
        {/* macOS Title Bar */}
        <div className="bg-[#28282a] px-3 sm:px-5 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 border-b border-black/20">
          {/* Traffic Light Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#28c840]" />
          </div>
          {/* Navigation Arrows - hidden on mobile */}
          <div className="hidden sm:flex items-center gap-1 ml-1">
            <div className="w-5 h-5 flex items-center justify-center text-white/30">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </div>
            <div className="w-5 h-5 flex items-center justify-center text-white/30">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </div>
          {/* URL Bar */}
          <div className="flex-1 flex justify-center">
            <div className="bg-[#1c1c1e] rounded-md px-2 sm:px-4 py-1 sm:py-1.5 flex items-center gap-1.5 sm:gap-2 max-w-[140px] sm:max-w-[280px]">
              <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white/40 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
              <span className="text-[8px] sm:text-sm text-white/60 font-medium truncate">revvup.ae/about</span>
            </div>
          </div>
          {/* Right spacer */}
          <div className="w-6 sm:w-24" />
        </div>
        
        {/* Window Content */}
        <div className="bg-[#000] flex items-center justify-center min-h-[320px] sm:min-h-[400px] lg:min-h-[480px] p-6 sm:p-10 lg:p-16">
          <div className="text-center">
            <p className="text-5xl sm:text-7xl lg:text-9xl font-bold text-white tracking-tight">
              Built Different.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AboutClosingSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Get Involved
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            This is just the beginning.
          </h2>
        </div>

        {/* Infographic */}
        <div className="mb-8">
          <YourMoveInfographic />
        </div>

        {/* Description below infographic */}
        <p className="text-sm sm:text-base font-medium text-muted-foreground max-w-2xl mx-auto text-center leading-relaxed mb-12">
          This is more than a company. It's a commitment to clarity, honesty, and respect. If that resonates, we'd love to hear from you.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/listings"
            className="w-full sm:w-auto h-12 px-10 bg-primary text-primary-foreground text-base font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
          >
            Browse Cars
          </Link>
          <Link
            href="/partners"
            className="w-full sm:w-auto h-12 px-10 bg-muted text-foreground text-base font-semibold rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
          >
            Partner With Us
          </Link>
        </div>

      </div>
    </section>
  );
}
