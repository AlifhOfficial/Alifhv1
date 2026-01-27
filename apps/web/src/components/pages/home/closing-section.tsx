/**
 * Closing Section - Alifh Home Page
 * Consistent with Hero Section design patterns
 */

'use client';

import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export function ClosingSection() {
  return (
    <section className="relative bg-background">

      {/* Section 1: Philosophy with Infographic */}
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              What we stand for
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
              Built by Car People.
              <br />
              <span className="text-muted-foreground">For Car People.</span>
            </h2>
          </div>

          {/* Infographic */}
          <div className="mb-12">
            <CarPeopleInfographic />
          </div>

          {/* Description */}
          <p className="text-base text-muted-foreground max-w-lg mx-auto text-center mb-16 leading-relaxed">
            We're the same people at track days and car meets. We built this because listing fees never made sense to us.
          </p>

          {/* Principles */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-16">
            <span className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />Clarity over noise
            </span>
            <span className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />Honesty over pressure
            </span>
            <span className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />Quality over volume
            </span>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/about"
              className="w-full sm:w-auto h-12 px-10 bg-primary text-primary-foreground text-base font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
            >
              Our story
            </Link>
            <Link
              href="/sell"
              className="w-full sm:w-auto h-12 px-10 bg-muted text-foreground text-base font-semibold rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
            >
              List your car
            </Link>
          </div>
        </div>
      </div>

      {/* Section 2: Video Showcase */}
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          
          <div className="text-center mb-16 space-y-4">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              How it works
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
              Browse. Book. Done.
              <br />
              <span className="text-muted-foreground">No Friction.</span>
            </h2>
          </div>

          {/* Video Container */}
          <div className="relative w-full aspect-[16/9] sm:aspect-[2.4/1] overflow-hidden rounded-lg">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/video/hero1x.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>

    </section>
  );
}

// ============================================================================
// INFOGRAPHIC: Car People - Weekend to Weekday visualization
// ============================================================================

function CarPeopleInfographic() {
  return (
    <div className="relative w-full aspect-[16/9] sm:aspect-[2.4/1] rounded-lg overflow-hidden bg-sidebar border border-border/40">
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes slide-in {
          0%, 100% { transform: translateX(0); opacity: 1; }
          50% { transform: translateX(4px); opacity: 0.8; }
        }
      `}</style>

      <div className="h-full flex">
        {/* Left - Our Passion */}
        <div className="flex-1 flex flex-col border-r border-border/20">
          <div className="px-6 sm:px-8 lg:px-10 pt-6 sm:pt-8 lg:pt-10">
            <span className="text-xs font-medium text-primary">Our weekends</span>
          </div>
          
          <div className="flex-1 flex items-center justify-center px-4 sm:px-8 lg:px-12 py-4">
            <div className="relative">
              {/* Main car image */}
              <div 
                className="w-48 sm:w-64 lg:w-80 xl:w-96 aspect-[4/3] rounded-xl overflow-hidden border border-border/30 shadow-lg"
                style={{ animation: 'float 4s ease-in-out infinite' }}
              >
                <img src="/Marketing/m4.jpeg" alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
              
              {/* Floating stats */}
              <div 
                className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 lg:-top-4 lg:-right-4 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-sidebar border border-border/40 shadow-lg"
                style={{ animation: 'float 4s ease-in-out infinite 0.5s' }}
              >
                <span className="text-[10px] sm:text-xs font-medium text-foreground">12+ Track Days</span>
              </div>
              
              <div 
                className="absolute -bottom-2 -left-2 sm:-bottom-3 sm:-left-3 lg:-bottom-4 lg:-left-4 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-sidebar border border-border/40 shadow-lg"
                style={{ animation: 'float 4s ease-in-out infinite 1s' }}
              >
                <span className="text-[10px] sm:text-xs font-medium text-foreground">6 Cars Owned</span>
              </div>
            </div>
          </div>
          
          <div className="px-6 sm:px-8 lg:px-10 pb-6 sm:pb-8 lg:pb-10">
            <p className="text-xs text-muted-foreground/60 text-center">Same passion as you</p>
          </div>
        </div>
        
        {/* Right - What We Built */}
        <div className="flex-1 flex flex-col">
          <div className="px-6 sm:px-8 lg:px-10 pt-6 sm:pt-8 lg:pt-10">
            <span className="text-xs font-medium text-muted-foreground/60">What we built</span>
          </div>
          
          <div className="flex-1 flex items-center justify-center px-4 sm:px-8 lg:px-12 py-4">
            {/* Simple value cards */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 w-full max-w-[200px] sm:max-w-[280px] lg:max-w-[360px]">
              <div 
                className="p-3 sm:p-4 lg:p-5 rounded-xl bg-muted/30 border border-border/30 text-center"
                style={{ animation: 'slide-in 3s ease-in-out infinite' }}
              >
                <div className="text-lg sm:text-xl font-medium text-primary mb-1">0</div>
                <div className="text-[9px] sm:text-[10px] text-muted-foreground">Listing Fee</div>
              </div>
              
              <div 
                className="p-3 sm:p-4 lg:p-5 rounded-xl bg-muted/30 border border-border/30 text-center"
                style={{ animation: 'slide-in 3s ease-in-out infinite 0.2s' }}
              >
                <div className="text-lg sm:text-xl font-medium text-primary mb-1">0</div>
                <div className="text-[9px] sm:text-[10px] text-muted-foreground">Ads</div>
              </div>
              
              <div 
                className="p-3 sm:p-4 lg:p-5 rounded-xl bg-muted/30 border border-border/30 text-center"
                style={{ animation: 'slide-in 3s ease-in-out infinite 0.4s' }}
              >
                <div className="text-lg sm:text-xl font-medium text-primary mb-1">∞</div>
                <div className="text-[9px] sm:text-[10px] text-muted-foreground">Listings</div>
              </div>
              
              <div 
                className="p-3 sm:p-4 lg:p-5 rounded-xl bg-muted/30 border border-border/30 text-center"
                style={{ animation: 'slide-in 3s ease-in-out infinite 0.6s' }}
              >
                <div className="text-lg sm:text-xl font-medium text-primary mb-1">100%</div>
                <div className="text-[9px] sm:text-[10px] text-muted-foreground">VIN Visible</div>
              </div>
            </div>
          </div>
          
          <div className="px-6 sm:px-8 lg:px-10 pb-6 sm:pb-8 lg:pb-10">
            <p className="text-xs text-primary/70 text-center">What we wished existed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
