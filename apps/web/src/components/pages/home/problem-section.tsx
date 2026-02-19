/**
 * Problem Section - Why Revvup Exists
 * Explains the issues with current UAE car platforms
 */

'use client';

import { MousePointer2 } from 'lucide-react';
import { MacOSWindow } from '@/components/ui/macos-window';
import { getStaticUrl } from '@/utils';

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
    <>
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
      `}</style>

      <MacOSWindow url="car-marketplace.ae" contentClassName="flex flex-col md:flex-row aspect-[4/3] sm:aspect-[16/9] md:aspect-[2.4/1]">
        {/* Left - Others: Cluttered fees */}
        <div className="flex-1 p-8 sm:p-12 lg:p-16 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5">
          <span className="text-[10px] sm:text-xs font-medium text-white/30 mb-8 sm:mb-10">Others</span>
          
          <div className="relative flex items-center justify-center gap-2 sm:gap-3 lg:gap-4">
            {/* Left car image */}
            <div className="w-28 sm:w-44 lg:w-56 aspect-[4/3] rounded-xl overflow-hidden border border-white/10 -rotate-3 opacity-60">
              <img 
                src={getStaticUrl("/Marketing/m3.jpeg")} 
                alt="" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Main car image - center */}
            <div className="relative w-52 sm:w-80 lg:w-[380px] aspect-[4/3] rounded-xl overflow-hidden border border-white/10 z-10">
              <img 
                src={getStaticUrl("/Marketing/m5.jpeg")} 
                alt="" 
                className="w-full h-full object-cover opacity-70"
              />
            </div>
            
            {/* Right car image */}
            <div className="w-28 sm:w-44 lg:w-56 aspect-[4/3] rounded-xl overflow-hidden border border-white/10 rotate-3 opacity-60">
              <img 
                src={getStaticUrl("/Marketing/m7.jpeg")} 
                alt="" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Fee badges */}
            <div className="absolute -top-2 sm:-top-3 -right-2 sm:-right-4 px-2 sm:px-4 py-1 sm:py-2 rounded-md bg-red-500 text-[8px] sm:text-xs font-bold text-white shadow-xl rotate-3 z-20">
              AED 999
              {/* Chaotic cursor - near AED 999 */}
              <div 
                className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6"
                style={{ animation: 'cursor-chaos 2.5s ease-in-out infinite' }}
              >
                <MousePointer2 className="w-5 h-5 sm:w-6 sm:h-6 text-white/70 fill-white/20 drop-shadow-lg" />
                <div 
                  className="absolute -inset-2 rounded-full border-2 border-white/30"
                  style={{ animation: 'click-ripple 2.5s ease-in-out infinite' }}
                />
              </div>
            </div>
            <div className="absolute top-10 sm:top-16 -left-2 sm:-left-4 px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-md bg-orange-500 text-[7px] sm:text-[11px] font-semibold text-white shadow-lg -rotate-6">
              Boost +49
            </div>
            <div className="absolute -bottom-1 sm:-bottom-3 right-8 sm:right-14 px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-md bg-amber-600 text-[7px] sm:text-[11px] font-semibold text-white shadow-lg rotate-2">
              Feature
            </div>
          </div>
          
          <p className="text-[10px] sm:text-xs text-white/30 mt-8 sm:mt-10">Pay for everything</p>
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
    </>
  );
}
