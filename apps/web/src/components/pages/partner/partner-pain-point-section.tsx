/**
 * Partner Pain Point Section - Alifh Partners Page
 * Visual comparison - their games vs our simplicity
 */

'use client';

import { CheckCircle2 } from 'lucide-react';

export function PartnerPainPointSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            The marketplace game
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            Commission. Credits. Upsells.
            <br />
            <span className="text-muted-foreground">Sound familiar?</span>
          </h2>
        </div>

        {/* Infographic */}
        <div className="mb-12">
          <MarketplaceGameInfographic />
        </div>

        {/* Description */}
        <p className="text-base text-muted-foreground leading-relaxed max-w-lg mx-auto text-center mb-16">
          You shouldn't have to pay the platform that competes against you. They sell cars. Then charge you to be seen. That's not partnership.
        </p>

        {/* Comparison Grid */}
        <div className="grid sm:grid-cols-2 gap-px bg-border/40 rounded-lg overflow-hidden border border-border/40 max-w-5xl mx-auto">
          
          {/* Others */}
          <div className="p-8 bg-sidebar">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/60 mb-8">Typical platforms</p>
            <div className="space-y-5">
              {[
                { label: 'Commission', value: '3-5% per sale' },
                { label: 'Listings', value: 'Pay per car' },
                { label: 'Visibility', value: 'Pay to rank' },
                { label: 'Their inventory', value: 'Compete with you' },
                { label: 'Your profile', value: 'Name + phone' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm text-foreground/60">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alifh */}
          <div className="p-8 bg-primary text-primary-foreground">
            <p className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-8">Alifh</p>
            <div className="space-y-5">
              {[
                { label: 'Commission', value: 'Zero. Forever.' },
                { label: 'Listings', value: 'Unlimited' },
                { label: 'Visibility', value: 'Earned by quality*' },
                { label: 'Our inventory', value: 'None. We don\'t sell.' },
                { label: 'Your profile', value: 'Full brand page' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-sm text-white/70">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{item.value}</span>
                    <CheckCircle2 className="w-4 h-4 text-white/60" />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/50 mt-6">*Based on listing quality, response time, and buyer engagement.</p>
          </div>
        </div>

      </div>
    </section>
  );
}

// ============================================================================
// INFOGRAPHIC: Marketplace Game - Cars with fees vs zero
// ============================================================================

function MarketplaceGameInfographic() {
  return (
    <div className="relative w-full rounded-lg overflow-visible bg-sidebar border border-border/40">
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes cursor-move {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(20px, -15px); }
          50% { transform: translate(-25px, 20px); }
          75% { transform: translate(15px, 10px); }
        }
        @keyframes glow-zero {
          0%, 100% { text-shadow: 0 0 40px rgba(0, 102, 255, 0.3); }
          50% { text-shadow: 0 0 60px rgba(0, 102, 255, 0.5); }
        }
      `}</style>

      <div className="flex flex-col-reverse md:flex-row">
        {/* Left - Others: macOS window with car cards (80% on desktop) */}
        <div className="w-full md:w-[80%] flex flex-col md:border-r border-t md:border-t-0 border-border/20 p-3 sm:p-6 lg:p-12">
          <span className="text-[10px] sm:text-xs font-medium text-muted-foreground/60 mb-3 sm:mb-6">Others</span>
          
          {/* macOS Window Frame */}
          <div className="relative flex-1 flex flex-col overflow-visible">
            <div className="rounded-lg overflow-visible shadow-2xl border border-white/10 flex-1 flex flex-col">
              {/* macOS Title Bar */}
              <div className="bg-[#28282a] px-3 sm:px-5 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 border-b border-black/20 flex-shrink-0">
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
                  <div className="bg-[#1c1c1e] rounded-md px-2 sm:px-4 py-1 sm:py-1.5 flex items-center gap-1.5 sm:gap-2 max-w-[100px] sm:max-w-[200px]">
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
              <div className="bg-[#000] p-6 pt-8 pb-8 sm:p-8 sm:pt-10 sm:pb-10 lg:p-14 lg:pt-16 lg:pb-16 flex-1 flex items-center justify-center overflow-visible">
                <div className="relative w-full max-w-3xl">
                  {/* 3 car cards - stacked/overlapping */}
                  <div className="relative h-44 sm:h-56 lg:h-80 w-full flex items-center justify-center">
                    {/* Card 1 - back left - hidden on very small screens */}
                    <div className="absolute left-1 sm:left-4 lg:left-8 top-6 sm:top-8 w-20 sm:w-40 lg:w-56 aspect-[4/3] rounded-lg overflow-hidden border border-white/10 shadow-lg -rotate-3 opacity-60 sm:opacity-70">
                      <img src="/Marketing/m3.jpeg" alt="" className="w-full h-full object-cover" />
                    </div>
                    
                    {/* Card 2 - back right - hidden on very small screens */}
                    <div className="absolute right-1 sm:right-4 lg:right-8 top-6 sm:top-8 w-20 sm:w-40 lg:w-56 aspect-[4/3] rounded-lg overflow-hidden border border-white/10 shadow-lg rotate-3 opacity-60 sm:opacity-70">
                      <img src="/Marketing/m5.jpeg" alt="" className="w-full h-full object-cover" />
                    </div>
                    
                    {/* Card 3 - front center */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-2 sm:top-0 w-24 sm:w-48 lg:w-72 aspect-[4/3] rounded-xl overflow-hidden border border-white/10 shadow-xl z-10">
                      <img src="/Marketing/m8.jpeg" alt="" className="w-full h-full object-cover" />
                    </div>
                    
                    {/* Moving mouse cursor */}
                    <div 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
                      style={{ animation: 'cursor-move 3s ease-in-out infinite' }}
                    >
                      <div className="relative">
                        <svg className="w-5 h-5 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M4 4l16 6.5-6.5 2-2 6.5z"/>
                        </svg>
                        <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500 animate-pulse" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Fee badges - floating around the cards */}
                  {/* Top left corner */}
                  <div className="absolute top-0 sm:-top-2 left-0 sm:left-4 lg:left-8 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md bg-red-500 text-[8px] sm:text-xs lg:text-sm font-bold text-white shadow-lg -rotate-6 z-20">
                    Premium 299
                  </div>
                  {/* Top right corner */}
                  <div className="absolute top-0 sm:-top-2 right-0 sm:right-4 lg:right-8 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md bg-orange-500 text-[8px] sm:text-xs lg:text-sm font-semibold text-white shadow-lg rotate-6 z-20">
                    Boost 149
                  </div>
                  {/* Bottom center */}
                  <div className="absolute bottom-0 sm:-bottom-2 left-1/2 -translate-x-1/2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md bg-rose-600 text-[8px] sm:text-xs lg:text-sm font-semibold text-white shadow-lg z-20">
                    5% commission
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-[9px] sm:text-xs text-muted-foreground/50 mt-3 sm:mt-6 text-center">Click this. Pay that.</p>
        </div>
        
        {/* Right - Alifh: Big zero (20% on desktop) */}
        <div className="w-full md:w-[20%] flex flex-col items-center justify-center py-6 md:py-4 px-4 sm:p-6 lg:p-8">
          <span className="text-[10px] sm:text-xs font-medium text-primary mb-3 sm:mb-6">Alifh</span>
          
          {/* Giant zero */}
          <div 
            className="text-4xl sm:text-6xl lg:text-7xl font-bold text-primary"
            style={{ animation: 'glow-zero 3s ease-in-out infinite' }}
          >
            0
          </div>
          
          <div className="mt-2 sm:mt-4 text-center">
            <span className="text-[9px] sm:text-xs text-primary/70">per listing</span>
            <span className="block text-[7px] sm:text-[10px] text-muted-foreground/50 mt-0.5 sm:mt-1">per sale</span>
          </div>
        </div>
      </div>
    </div>
  );
}
