/**
 * Problem Section - Why Alifh Exists
 * Explains the issues with current UAE car platforms
 */

'use client';

import Link from 'next/link';
import { MousePointer2 } from 'lucide-react';

export function ProblemSection() {
  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Why Alifh exists
          </span>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            Most UAE Platforms Charge to List.
            <br />
            <span className="text-muted-foreground">We Never Will.</span>
          </h2>
        </div>

        {/* Infographic */}
        <div className="mb-12">
          <ProblemInfographic />
        </div>

        {/* Description */}
        <p className="text-base text-muted-foreground max-w-lg mx-auto text-center mb-16 leading-relaxed">
          Other platforms charge listing fees—some over AED 1,000. They run ads everywhere. 
          Anyone can pay to rank first. VIN numbers are optional. Listings stay up forever.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/listings/new"
            className="w-full sm:w-auto h-12 px-10 bg-primary text-primary-foreground text-base font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
          >
            List your car free
          </Link>
          <Link
            href="/how-it-works"
            className="w-full sm:w-auto h-12 px-10 bg-muted text-foreground text-base font-semibold rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
          >
            See how it works
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// INFOGRAPHIC: The Problem - Animated cursor comparison
// ============================================================================

function ProblemInfographic() {
  return (
    <div className="relative w-full aspect-[16/9] sm:aspect-[2.4/1] rounded-lg overflow-hidden bg-sidebar border border-border/40">
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes cursor-chaos {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(25px, -15px); }
          50% { transform: translate(-15px, 20px); }
          75% { transform: translate(20px, 10px); }
        }
        @keyframes cursor-calm {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes click-ripple {
          0%, 30%, 60%, 100% { opacity: 0; transform: scale(0.8); }
          15%, 45%, 75% { opacity: 0.5; transform: scale(1.2); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0, 102, 255, 0.4); }
          50% { box-shadow: 0 0 30px 8px rgba(0, 102, 255, 0.15); }
        }
      `}</style>

      <div className="h-full flex">
        {/* Left - Others */}
        <div className="flex-1 flex flex-col border-r border-border/20">
          <div className="px-6 sm:px-8 lg:px-10 pt-6 sm:pt-8 lg:pt-10">
            <span className="text-xs font-medium text-muted-foreground/60">Others</span>
          </div>
          
          {/* Centered content */}
          <div className="flex-1 flex items-center justify-center px-4 sm:px-8 lg:px-12 py-6">
            <div className="relative">
              {/* Car image */}
              <div className="w-48 sm:w-64 lg:w-80 xl:w-96 aspect-[4/3] rounded-xl overflow-hidden border border-border/30">
                <img 
                  src="/Marketing/m5.jpeg" 
                  alt="" 
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
              
              {/* Fee badges */}
              <div className="absolute -top-2 -right-2 sm:-right-3 lg:-right-4 px-2 sm:px-2.5 lg:px-3 py-1 sm:py-1.5 rounded-lg bg-red-500 text-[9px] sm:text-[10px] lg:text-xs font-bold text-white shadow-xl rotate-3">
                AED 999
              </div>
              <div className="absolute top-8 sm:top-10 lg:top-12 -left-2 sm:-left-4 lg:-left-6 px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg bg-orange-500 text-[8px] sm:text-[9px] lg:text-[11px] font-semibold text-white shadow-lg -rotate-6">
                Boost +49
              </div>
              <div className="absolute -bottom-1 sm:-bottom-2 lg:-bottom-3 right-4 sm:right-6 lg:right-8 px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg bg-amber-600 text-[8px] sm:text-[9px] lg:text-[11px] font-semibold text-white shadow-lg rotate-2">
                Feature
              </div>
              
              {/* Chaotic cursor */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                style={{ animation: 'cursor-chaos 2.5s ease-in-out infinite' }}
              >
                <MousePointer2 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-muted-foreground/70 fill-muted-foreground/20 drop-shadow-lg" />
                <div 
                  className="absolute -inset-2 lg:-inset-3 rounded-full border-2 border-muted-foreground/30"
                  style={{ animation: 'click-ripple 2.5s ease-in-out infinite' }}
                />
              </div>
            </div>
          </div>
          
          <div className="px-6 sm:px-8 lg:px-10 pb-6 sm:pb-8 lg:pb-10">
            <p className="text-xs text-muted-foreground/50 text-center">Pay to play</p>
          </div>
        </div>
        
        {/* Right - Alifh */}
        <div className="flex-1 flex flex-col">
          <div className="px-6 sm:px-8 lg:px-10 pt-6 sm:pt-8 lg:pt-10">
            <span className="text-xs font-medium text-primary">Alifh</span>
          </div>
          
          {/* Centered content */}
          <div className="flex-1 flex items-center justify-center px-4 sm:px-8 lg:px-12 py-6">
            <div className="relative">
              {/* Car image */}
              <div 
                className="w-48 sm:w-64 lg:w-80 xl:w-96 aspect-[4/3] rounded-xl overflow-hidden border-2 border-primary/40"
                style={{ animation: 'glow 3s ease-in-out infinite' }}
              >
                <img 
                  src="/Marketing/m1.jpeg" 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Single CTA */}
              <div className="absolute -bottom-3 sm:-bottom-4 lg:-bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <div className="px-4 sm:px-5 lg:px-6 py-1.5 sm:py-2 lg:py-2.5 rounded-full bg-primary text-[10px] sm:text-xs font-medium text-primary-foreground shadow-xl shadow-primary/25">
                  List for free
                </div>
              </div>
              
              {/* Calm cursor */}
              <div 
                className="absolute -bottom-2 sm:-bottom-3 lg:-bottom-4 right-2 sm:right-3 lg:right-4 z-20"
                style={{ animation: 'cursor-calm 2s ease-in-out infinite' }}
              >
                <MousePointer2 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-primary fill-primary/20 drop-shadow-lg" />
              </div>
            </div>
          </div>
          
          <div className="px-6 sm:px-8 lg:px-10 pb-6 sm:pb-8 lg:pb-10">
            <p className="text-xs text-primary/70 text-center">Just list</p>
          </div>
        </div>
      </div>
    </div>
  );
}
