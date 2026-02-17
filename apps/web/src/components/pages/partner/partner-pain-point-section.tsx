/**
 * Partner Pain Point Section - Revvup Partners Page
 * Visual comparison - their games vs our simplicity
 */

'use client';

import { CheckCircle2 } from 'lucide-react';
import { MacOSWindow } from '@/components/ui/macos-window';

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

          {/* Revvup */}
          <div className="p-8 bg-primary text-primary-foreground">
            <p className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-8">Revvup</p>
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
    <div className="relative w-full rounded-lg overflow-hidden bg-sidebar border border-border/40 p-3 sm:p-6 lg:p-12">
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes cursor-move {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(20px, -15px); }
          50% { transform: translate(-25px, 20px); }
          75% { transform: translate(15px, 10px); }
        }
        @keyframes click-ripple {
          0%, 30%, 60%, 100% { opacity: 0; transform: scale(0.8); }
          15%, 45%, 75% { opacity: 0.5; transform: scale(1.2); }
        }
        @keyframes glow-zero {
          0%, 100% { text-shadow: 0 0 40px rgba(0, 102, 255, 0.3); }
          50% { text-shadow: 0 0 60px rgba(0, 102, 255, 0.5); }
        }
      `}</style>

<MacOSWindow url="car-marketplace.ae" contentClassName="flex flex-col md:flex-row aspect-[4/3] sm:aspect-[16/9] md:aspect-[2.4/1]">
          {/* Left - Others: Cluttered fees with stacked cars */}
          <div className="flex-1 p-6 pt-8 pb-8 sm:p-8 sm:pt-10 sm:pb-10 lg:p-14 lg:pt-16 lg:pb-16 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5">
            <span className="text-[10px] sm:text-xs font-medium text-white/30 mb-6 sm:mb-8">Others</span>
            
            <div className="relative w-full max-w-3xl">
              {/* 3 car cards - stacked/overlapping */}
              <div className="relative h-44 sm:h-56 lg:h-80 w-full flex items-center justify-center">
                {/* Card 1 - back left */}
                <div className="absolute left-1 sm:left-4 lg:left-8 top-6 sm:top-8 w-20 sm:w-40 lg:w-56 aspect-[4/3] rounded-lg overflow-hidden border border-white/10 shadow-lg -rotate-3 opacity-60 sm:opacity-70">
                  <img src="/Marketing/m3.jpeg" alt="" className="w-full h-full object-cover" />
                </div>
                
                {/* Card 2 - back right */}
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
              <div className="absolute top-0 sm:-top-2 left-0 sm:left-4 lg:left-8 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md bg-red-500 text-[8px] sm:text-xs lg:text-sm font-bold text-white shadow-lg -rotate-6 z-20">
                Premium 299
              </div>
              <div className="absolute top-0 sm:-top-2 right-0 sm:right-4 lg:right-8 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md bg-orange-500 text-[8px] sm:text-xs lg:text-sm font-semibold text-white shadow-lg rotate-6 z-20">
                Boost 149
              </div>
              <div className="absolute bottom-0 sm:-bottom-2 left-1/2 -translate-x-1/2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md bg-rose-600 text-[8px] sm:text-xs lg:text-sm font-semibold text-white shadow-lg z-20">
                5% commission
              </div>
            </div>
            
            <p className="text-[10px] sm:text-xs text-white/30 mt-6 sm:mt-8">Click this. Pay that.</p>
          </div>
          
          {/* Right - Revvup: Clean proposition */}
          <div className="w-full md:w-[280px] lg:w-[360px] p-8 sm:p-12 lg:p-16 flex flex-col items-center justify-center">
            <span className="text-[10px] sm:text-xs font-medium text-primary mb-8 sm:mb-10">Revvup</span>
            
            <div className="flex flex-col items-center">
              {/* Giant zero */}
              <div 
                className="text-7xl sm:text-8xl lg:text-9xl font-bold text-primary leading-none"
                style={{ animation: 'glow-zero 3s ease-in-out infinite' }}
              >
                0
              </div>
              <span className="text-sm sm:text-base text-primary/80 font-medium mt-2">fees</span>
            </div>
            
            <p className="text-[10px] sm:text-xs text-white/30 mt-8 sm:mt-10">Just list</p>
          </div>
      </MacOSWindow>
    </div>
  );
}
