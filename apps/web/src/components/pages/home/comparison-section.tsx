/**
 * Comparison Section - Side by Side
 * Direct comparison between typical platforms and Alifh
 */

'use client';

import { CheckCircle2 } from 'lucide-react';

const COMPARISON_DATA = [
  { label: 'Listing cost', others: 'AED 500–1,000+', alifh: 'Free' },
  { label: 'Get seen', others: 'Pay to rank higher', alifh: 'Quality ranks higher' },
  { label: 'Ads', others: 'Everywhere', alifh: 'None' },
  { label: 'Car history', others: 'VIN hidden', alifh: 'VIN shown' },
  { label: 'Test drives', others: 'Phone calls', alifh: 'Book online' },
  { label: 'Old listings', others: 'Stay forever', alifh: 'Auto-removed' },
];

export function ComparisonSection() {
  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            The Difference
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            Us vs them.
            <br />
            <span className="text-muted-foreground">You decide.</span>
          </h2>
        </div>

        {/* Infographic */}
        <div className="mb-12">
          <ComparisonInfographic />
        </div>

        {/* Clean Comparison Grid - like partner compare */}
        <div className="grid sm:grid-cols-2 gap-px bg-border/40 rounded-lg overflow-hidden border border-border/40 max-w-4xl mx-auto">
          
          {/* Others */}
          <div className="p-8 bg-sidebar">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/60 mb-8">Typical platforms</p>
            <div className="space-y-6">
              {COMPARISON_DATA.map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm text-foreground/60">{item.others}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alifh */}
          <div className="p-8 bg-primary text-primary-foreground">
            <p className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-8">Alifh</p>
            <div className="space-y-6">
              {COMPARISON_DATA.map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-sm text-white/70">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{item.alifh}</span>
                    <CheckCircle2 className="w-4 h-4 text-white/60" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// INFOGRAPHIC: Buyer's perspective - What they actually see
// ============================================================================

function ComparisonInfographic() {
  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-sidebar border border-border/40 p-3 sm:p-6 lg:p-12">
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes scroll-feed {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
      `}</style>

      {/* macOS Window Frame - Full Width */}
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
              <span className="text-[8px] sm:text-sm text-white/60 font-medium truncate">car-listings.com</span>
            </div>
          </div>
          {/* Right spacer */}
          <div className="w-6 sm:w-24" />
        </div>
        
        {/* Window Content - Split View */}
        <div className="bg-[#000] flex flex-col md:flex-row aspect-[4/3] sm:aspect-[16/9] md:aspect-[2.4/1]">
          {/* Left - Others: Cluttered feed with media */}
          <div className="w-full md:w-[40%] flex flex-col border-b md:border-b-0 md:border-r border-white/5 p-6 sm:p-8 lg:p-12">
            <span className="text-[10px] sm:text-xs font-medium text-white/40 mb-4 sm:mb-6">Elsewhere</span>
            
            <div className="flex-1 flex items-center justify-center overflow-hidden">
              <div 
                className="w-full max-w-[280px] sm:max-w-[260px] space-y-2.5 sm:space-y-3"
                style={{ animation: 'scroll-feed 6s ease-in-out infinite' }}
              >
                {/* Ad banner */}
                <div className="h-7 sm:h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                  <span className="text-[8px] sm:text-[10px] text-amber-500/70 font-medium tracking-wide">SPONSORED</span>
                </div>
                
                {/* Listing with image */}
                <div className="p-2 sm:p-2.5 rounded-lg bg-white/5 border border-white/10">
                  <div className="aspect-[16/9] rounded overflow-hidden bg-white/10 mb-2">
                    <img src="/Marketing/m8.jpeg" alt="" className="w-full h-full object-cover opacity-70 grayscale-[30%]" />
                  </div>
                  <div className="h-2 sm:h-2.5 w-3/4 rounded bg-white/15" />
                </div>
                
                {/* Your listing - buried and faded */}
                <div className="p-2 sm:p-2.5 rounded-lg bg-white/5 border border-white/5 opacity-40">
                  <div className="aspect-[16/9] rounded overflow-hidden bg-white/10 mb-2">
                    <img src="/Marketing/m12.jpeg" alt="" className="w-full h-full object-cover opacity-50 grayscale" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-1.5 sm:h-2 w-1/2 rounded bg-white/10" />
                    <p className="text-[7px] sm:text-[9px] text-white/40">Your listing</p>
                  </div>
                </div>
                
                {/* Ad */}
                <div className="h-6 sm:h-7 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                  <span className="text-[7px] sm:text-[9px] text-white/30">AD</span>
                </div>
              </div>
            </div>
            
            <p className="text-[8px] sm:text-xs text-white/30 mt-3 sm:mt-5 text-center">Buried in the noise</p>
          </div>
          
          {/* Right - Alifh: Clean "No Noise" */}
          <div className="w-full md:w-[60%] flex flex-col p-6 sm:p-8 lg:p-12">
            <span className="text-[10px] sm:text-xs font-medium text-primary mb-4 sm:mb-6">Alifh</span>
            
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-5xl sm:text-7xl lg:text-9xl font-bold text-white tracking-tight">
                  No Noise
                </p>
                <p className="text-base sm:text-lg lg:text-xl text-white/40 mt-4 sm:mt-6">Just cars.</p>
              </div>
            </div>
            
            <p className="text-[9px] sm:text-xs text-primary/70 text-center">Your car. Seen. Sold.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
