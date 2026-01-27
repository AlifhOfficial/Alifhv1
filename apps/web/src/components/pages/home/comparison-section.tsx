/**
 * Comparison Section - Side by Side
 * Direct comparison between typical platforms and Alifh
 */

'use client';

import Link from 'next/link';
import { CheckCircle2, X } from 'lucide-react';

const COMPARISON_DATA = [
  { label: 'Listing cost', others: 'Up to AED 1,000+', alifh: 'Free for individuals' },
  { label: 'Visibility', others: 'Pay to appear first', alifh: 'Quality-based ranking' },
  { label: 'Experience', others: 'Ads everywhere', alifh: 'Zero ads, ever' },
  { label: 'Transparency', others: 'VIN optional', alifh: 'VIN required' },
  { label: 'Test drives', others: 'Call and negotiate', alifh: 'Book online 24/7' },
  { label: 'Stale listings', others: 'Stay up forever', alifh: 'Auto-expire' },
];

export function ComparisonSection() {
  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Side by side
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            What You Get Elsewhere.
            <br />
            <span className="text-muted-foreground">What You Get Here.</span>
          </h2>
        </div>

        {/* Infographic */}
        <div className="mb-12">
          <ComparisonInfographic />
        </div>

        {/* Description */}
        <p className="text-base text-muted-foreground max-w-lg mx-auto text-center mb-16 leading-relaxed">
          A direct comparison. No marketing speak.
        </p>

        {/* Clean Comparison Table */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="space-y-0">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr,1fr,1fr] gap-4 pb-4 border-b border-border/40">
              <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/60">Feature</span>
              <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/60">Others</span>
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">Alifh</span>
            </div>

            {/* Table Rows */}
            {COMPARISON_DATA.map((item, i) => (
              <div 
                key={i} 
                className="grid grid-cols-[1fr,1fr,1fr] gap-4 items-center py-4 border-b border-border/30 last:border-0"
              >
                <span className="text-base font-medium">{item.label}</span>
                <div className="flex items-center gap-2">
                  <X className="w-4 h-4 text-muted-foreground/30" />
                  <span className="text-sm text-muted-foreground/60">{item.others}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">{item.alifh}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/sell"
            className="w-full sm:w-auto h-12 px-10 bg-primary text-primary-foreground text-base font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
          >
            List your car free
          </Link>
          <Link
            href="/listings"
            className="w-full sm:w-auto h-12 px-10 bg-muted text-foreground text-base font-semibold rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
          >
            Browse listings
          </Link>
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
    <div className="relative w-full aspect-[16/9] sm:aspect-[2.4/1] rounded-lg overflow-hidden bg-sidebar border border-border/40">
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes scroll-feed {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes focus-card {
          0%, 40% { transform: scale(0.95); opacity: 0.8; }
          60%, 100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div className="h-full flex">
        {/* Left - Others: Your car lost in the noise */}
        <div className="flex-1 flex flex-col border-r border-border/20 p-4 sm:p-6 lg:p-10">
          <span className="text-xs font-medium text-muted-foreground/60 mb-4">What buyers see elsewhere</span>
          
          <div className="flex-1 flex items-center justify-center">
            <div 
              className="relative w-full max-w-[200px] sm:max-w-[260px] lg:max-w-[300px]"
              style={{ animation: 'scroll-feed 8s ease-in-out infinite' }}
            >
              {/* Scrolling feed of tiny listings - your car buried */}
              <div className="space-y-2 sm:space-y-3">
                {/* Ad banner */}
                <div className="h-8 sm:h-10 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <span className="text-[8px] sm:text-[10px] text-amber-600/60">SPONSORED</span>
                </div>
                
                {/* Other listing */}
                <div className="flex gap-2 sm:gap-3 p-2 sm:p-3 rounded bg-muted/50 border border-border/30">
                  <div className="w-12 sm:w-16 lg:w-20 h-9 sm:h-12 lg:h-14 rounded bg-border/40" />
                  <div className="flex-1 space-y-1 sm:space-y-2">
                    <div className="h-1.5 sm:h-2 w-3/4 rounded bg-border/40" />
                    <div className="h-1.5 sm:h-2 w-1/2 rounded bg-border/30" />
                  </div>
                </div>
                
                {/* YOUR listing - small, lost */}
                <div className="flex gap-2 sm:gap-3 p-2 sm:p-3 rounded bg-muted/30 border border-border/20 opacity-60">
                  <div className="w-12 sm:w-16 lg:w-20 h-9 sm:h-12 lg:h-14 rounded overflow-hidden">
                    <img src="/Marketing/m12.jpeg" alt="" className="w-full h-full object-cover opacity-70" />
                  </div>
                  <div className="flex-1 space-y-1 sm:space-y-2">
                    <div className="h-1.5 sm:h-2 w-3/4 rounded bg-border/30" />
                    <div className="h-1.5 sm:h-2 w-1/2 rounded bg-border/20" />
                  </div>
                </div>
                
                {/* Featured listing (paid) */}
                <div className="flex gap-2 sm:gap-3 p-2 sm:p-3 rounded bg-muted border border-amber-500/30">
                  <div className="w-12 sm:w-16 lg:w-20 h-9 sm:h-12 lg:h-14 rounded bg-border/40" />
                  <div className="flex-1 space-y-1 sm:space-y-2">
                    <div className="h-1.5 sm:h-2 w-3/4 rounded bg-border/40" />
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[6px] sm:text-[8px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-600/70">FEATURED</span>
                    </div>
                  </div>
                </div>
                
                {/* Another ad */}
                <div className="h-6 sm:h-8 rounded bg-muted/50 border border-border/20 flex items-center justify-center">
                  <span className="text-[7px] sm:text-[9px] text-muted-foreground/30">AD</span>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground/40 text-center mt-4">Your car. Buried. Ignored.</p>
        </div>
        
        {/* Right - Alifh: Your car showcased */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-10">
          <span className="text-xs font-medium text-primary mb-4">What buyers see on Alifh</span>
          
          <div className="flex-1 flex items-center justify-center">
            <div className="relative">
              {/* Main showcased card - mimics actual car card design */}
              <div 
                className="w-52 sm:w-64 lg:w-80 xl:w-96 rounded-lg overflow-hidden bg-sidebar border border-sidebar-border shadow-lg"
                style={{ animation: 'focus-card 8s ease-out infinite' }}
              >
                {/* Image - 4:3 aspect ratio */}
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src="/Marketing/m4.jpeg" 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Content */}
                <div className="p-2.5 sm:p-3 lg:p-4 space-y-1 sm:space-y-2">
                  {/* Title + Year */}
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] sm:text-xs lg:text-sm font-bold text-foreground">BMW M4</span>
                    <span className="text-[8px] sm:text-[10px] lg:text-xs text-muted-foreground">2024</span>
                  </div>
                  
                  {/* Price */}
                  <p className="text-xs sm:text-sm font-medium text-primary">AED 385,000</p>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-1 sm:gap-2 text-[8px] sm:text-[9px] lg:text-[11px] text-muted-foreground">
                    <span>12k km</span>
                    <span className="text-muted-foreground/30">·</span>
                    <span>GCC</span>
                    <span className="text-muted-foreground/30">·</span>
                    <span>Dubai</span>
                  </div>
                  
                  {/* Seller */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-muted" />
                    <span className="text-[8px] sm:text-[9px] text-muted-foreground">Private Seller</span>
                    <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
                  </div>
                </div>
              </div>
              
              {/* Mouse cursor */}
              <div 
                className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3"
                style={{ animation: 'cursor-click 8s ease-in-out infinite' }}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-foreground drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 4l16 6.5-6.5 2-2 6.5z"/>
                </svg>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-primary/70 text-center mt-4">Your car. Seen. Sold.</p>
        </div>
      </div>
    </div>
  );
}
