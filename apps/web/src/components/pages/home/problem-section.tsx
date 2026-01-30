/**
 * Problem Section - Why Alifh Exists
 * Explains the issues with current UAE car platforms
 */

'use client';

import { MousePointer2 } from 'lucide-react';

export function ProblemSection() {
  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            The Problem
          </span>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            Listing fees?
            <br />
            <span className="text-muted-foreground">Not here.</span>
          </h2>
        </div>

        {/* Infographic */}
        <div className="mb-12">
          <ProblemInfographic />
        </div>

        {/* Description */}
        <p className="text-base text-muted-foreground max-w-lg mx-auto text-center leading-relaxed">
          Most car listing sites in Dubai charge AED 500–1,000 just to post. Then they want more to "boost" your ad. We don't charge private sellers anything. Ever.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// INFOGRAPHIC: The Problem - Animated cursor comparison
// ============================================================================

function ProblemInfographic() {
  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-sidebar border border-border/40">
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes cursor-chaos {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(25px, -15px); }
          50% { transform: translate(-15px, 20px); }
          75% { transform: translate(20px, 10px); }
        }
        @keyframes click-ripple {
          0%, 30%, 60%, 100% { opacity: 0; transform: scale(0.8); }
          15%, 45%, 75% { opacity: 0.5; transform: scale(1.2); }
        }
        @keyframes glow-zero {
          0%, 100% { text-shadow: 0 0 40px rgba(0, 102, 255, 0.3); }
          50% { text-shadow: 0 0 60px rgba(0, 102, 255, 0.5); }
        }
        @keyframes fade-in-1 { 0%, 20% { opacity: 0; } 30%, 100% { opacity: 1; } }
        @keyframes fade-in-2 { 0%, 35% { opacity: 0; } 45%, 100% { opacity: 1; } }
        @keyframes fade-in-3 { 0%, 50% { opacity: 0; } 60%, 100% { opacity: 1; } }
      `}</style>

      <div className="flex flex-col-reverse md:flex-row">
        {/* Left - Others: macOS window with cluttered fees (80% on desktop) */}
        <div className="w-full md:w-[80%] flex flex-col items-center justify-center md:border-r border-t md:border-t-0 border-border/20 p-4 sm:p-6 lg:p-8">
          <span className="text-xs font-medium text-muted-foreground/60 mb-4 sm:mb-6">Others</span>
          
          {/* macOS Window Frame */}
          <div className="relative w-full max-w-2xl lg:max-w-3xl">
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
                  <div className="bg-[#1c1c1e] rounded-md px-2 sm:px-4 py-1 sm:py-1.5 flex items-center gap-1.5 sm:gap-2 max-w-[120px] sm:max-w-[200px]">
                    <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white/40 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                    <span className="text-[8px] sm:text-xs text-white/60 font-medium truncate">marketplace.ae</span>
                  </div>
                </div>
                {/* Right spacer */}
                <div className="w-6 sm:w-16" />
              </div>
              
              {/* Window Content */}
              <div className="bg-[#000] p-4 sm:p-8 lg:p-12 flex items-center justify-center">
                <div className="relative">
                  {/* Car image */}
                  <div className="w-40 sm:w-64 lg:w-96 aspect-[4/3] rounded-xl overflow-hidden border border-white/10">
                    <img 
                      src="/Marketing/m5.jpeg" 
                      alt="" 
                      className="w-full h-full object-cover opacity-80"
                    />
                  </div>
                  
                  {/* Fee badges */}
                  <div className="absolute -top-2 sm:-top-3 -right-2 sm:-right-4 px-2 sm:px-4 py-1 sm:py-2 rounded-md bg-red-500 text-[8px] sm:text-xs font-bold text-white shadow-xl rotate-3">
                    AED 999
                  </div>
                  <div className="absolute top-6 sm:top-12 -left-2 sm:-left-4 px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-md bg-orange-500 text-[7px] sm:text-[11px] font-semibold text-white shadow-lg -rotate-6">
                    Boost +49
                  </div>
                  <div className="absolute -bottom-1 sm:-bottom-3 right-4 sm:right-10 px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-md bg-amber-600 text-[7px] sm:text-[11px] font-semibold text-white shadow-lg rotate-2">
                    Feature
                  </div>
                  
                  {/* Chaotic cursor */}
                  <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                    style={{ animation: 'cursor-chaos 2.5s ease-in-out infinite' }}
                  >
                    <MousePointer2 className="w-5 h-5 sm:w-6 sm:h-6 text-white/70 fill-white/20 drop-shadow-lg" />
                    <div 
                      className="absolute -inset-2 rounded-full border-2 border-white/30"
                      style={{ animation: 'click-ripple 2.5s ease-in-out infinite' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-[10px] sm:text-xs text-muted-foreground/50 mt-6 sm:mt-8">Pay for everything</p>
        </div>
        
        {/* Right - Alifh: Clean, simple - Big zero (20% on desktop) */}
        <div className="w-full md:w-[20%] flex flex-col items-center justify-center py-8 md:py-4 px-4 sm:p-6">
          <span className="text-[10px] sm:text-xs font-medium text-primary mb-4">Alifh</span>
          
          <div className="flex flex-col items-center">
            {/* Giant zero */}
            <div 
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-primary leading-none"
              style={{ animation: 'glow-zero 3s ease-in-out infinite' }}
            >
              0
            </div>
            <span className="text-[10px] sm:text-xs text-primary/70 font-medium mt-1">fees</span>
          </div>
          
          <p className="text-[8px] sm:text-[10px] text-primary/50 mt-4 sm:mt-6">Just list</p>
        </div>
      </div>
    </div>
  );
}
