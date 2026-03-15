/**
 * Comparison Section - Side by Side
 * Direct comparison between typical platforms and Revvup
 */

'use client';

import { MarketingImage as Image } from '@/components/pages/marketing-image';
import { CheckCircle2 } from 'lucide-react';
import { MacOSWindow } from '@/components/ui/macos-window';
import { m8, m12 } from '@/components/pages/marketing-image-assets';

const COMPARISON_DATA = [
  { label: 'Listing cost', others: 'AED 500–1,000+', alifh: 'Free' },
  { label: 'Get seen', others: 'Pay to rank higher', alifh: 'Quality ranks higher' },
  { label: 'Ads', others: 'Everywhere', alifh: 'None' },
  { label: 'Duplicates', others: 'Same car reposted', alifh: 'One listing per car' },
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

          {/* Revvup */}
          <div className="p-8 bg-primary text-primary-foreground">
            <p className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-8">Revvup</p>
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
    <>
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes scroll-feed {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
      `}</style>

      <MacOSWindow url="car-listings.com" contentClassName="flex flex-col md:flex-row aspect-[3/4] sm:aspect-[4/3] md:aspect-[16/9] lg:aspect-[2.4/1]">
        {/* Left - Others: Cluttered feed with media */}
        <div className="w-full md:w-[40%] flex flex-col border-b md:border-b-0 md:border-r border-white/5 p-4 sm:p-6 lg:p-12">
          <span className="text-[10px] sm:text-xs font-medium text-white/40 mb-3 sm:mb-4 lg:mb-6">Elsewhere</span>
          
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <div 
              className="w-full max-w-[200px] sm:max-w-[240px] lg:max-w-[260px] space-y-2 sm:space-y-2.5 lg:space-y-3"
              style={{ animation: 'scroll-feed 6s ease-in-out infinite' }}
            >
              {/* Ad banner */}
              <div className="h-6 sm:h-7 lg:h-8 rounded-md sm:rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                <span className="text-[7px] sm:text-[8px] lg:text-[10px] text-amber-500/70 font-medium tracking-wide">SPONSORED</span>
              </div>
              
              {/* Listing with image */}
              <div className="p-1.5 sm:p-2 lg:p-2.5 rounded-md sm:rounded-lg bg-white/5 border border-white/10">
                <div className="aspect-[16/9] rounded overflow-hidden bg-white/10 mb-1.5 sm:mb-2">
                  <Image src={m8} alt="" className="w-full h-full object-cover opacity-70 grayscale-[30%]" sizes="(max-width: 768px) 200px, 260px" />
                </div>
                <div className="h-1.5 sm:h-2 lg:h-2.5 w-3/4 rounded bg-white/15" />
              </div>
              
              {/* Your listing - buried and faded */}
              <div className="p-1.5 sm:p-2 lg:p-2.5 rounded-md sm:rounded-lg bg-white/5 border border-white/5 opacity-40">
                <div className="aspect-[16/9] rounded overflow-hidden bg-white/10 mb-1.5 sm:mb-2">
                  <Image src={m12} alt="" className="w-full h-full object-cover opacity-50 grayscale" sizes="(max-width: 768px) 200px, 260px" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-1 sm:h-1.5 lg:h-2 w-1/2 rounded bg-white/10" />
                  <p className="text-[6px] sm:text-[7px] lg:text-[9px] text-white/40">Your listing</p>
                </div>
              </div>
              
              {/* Ad */}
              <div className="h-5 sm:h-6 lg:h-7 rounded-md sm:rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                <span className="text-[6px] sm:text-[7px] lg:text-[9px] text-white/30">AD</span>
              </div>
            </div>
          </div>
          
          <p className="text-[7px] sm:text-[8px] lg:text-xs text-white/30 mt-2 sm:mt-3 lg:mt-5 text-center">Buried in the noise</p>
        </div>
        
        {/* Right - Revvup: Clean "No Noise" */}
        <div className="w-full md:w-[60%] flex flex-col p-4 sm:p-6 lg:p-12 min-h-[180px] sm:min-h-0">
          <span className="text-[10px] sm:text-xs font-medium text-primary mb-3 sm:mb-4 lg:mb-6">Revvup</span>
          
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-3xl sm:text-5xl lg:text-7xl xl:text-9xl font-bold text-white tracking-tight">
                No Noise
              </p>
              <p className="text-sm sm:text-base lg:text-xl text-white/40 mt-2 sm:mt-4 lg:mt-6">Just cars.</p>
            </div>
          </div>
          
          <p className="text-[8px] sm:text-[9px] lg:text-xs text-primary/70 text-center">Your car. Seen. Sold.</p>
        </div>
      </MacOSWindow>
    </>
  );
}
