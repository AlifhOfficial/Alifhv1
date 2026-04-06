/**
 * Partner Pain Point Section - Revvup Partners Page
 * Visual comparison - their games vs our simplicity
 */

import { MarketingImage as Image } from '@/components/pages/marketing-image';
import { CheckCircle2 } from 'lucide-react';
import { MacOSWindow } from '@/components/ui/macos-window';
import { m3, m5, m8 } from '@/components/pages/marketing-image-assets';

export function PartnerPainPointSection() {
  return (
    <section className="pt-28 pb-20 px-4 compact:px-6 large:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
            The marketplace game
          </span>
          <h2 className="text-title2 compact:text-title1 large:text-display font-semibold tracking-tight">
            Commission. Credits. Upsells.
            <br />
            <span className="text-muted-foreground">Sound familiar?</span>
          </h2>
        </div>

        {/* Infographic */}
        <MarketplaceGameInfographic />

        {/* Description */}
        <p className="text-callout text-muted-foreground leading-relaxed max-w-lg mx-auto text-center mt-12 mb-16">
          You shouldn't have to pay the platform that competes against you. They sell cars. Then charge you to be seen. That's not partnership.
        </p>

        {/* Comparison Grid */}
        <div className="grid compact:grid-cols-2 gap-px bg-border/40 rounded-lg overflow-hidden border border-border/40 max-w-5xl mx-auto">
          
          {/* Others */}
          <div className="p-8 bg-sidebar">
            <p className="text-subhead font-semibold uppercase tracking-wider text-muted-foreground/60 mb-8">Typical platforms</p>
            <div className="space-y-5">
              {[
                { label: 'Commission', value: '3-5% per sale' },
                { label: 'Listings', value: 'Pay per car' },
                { label: 'Visibility', value: 'Pay to rank' },
                { label: 'Their inventory', value: 'Compete with you' },
                { label: 'Your profile', value: 'Name + phone' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-subhead text-muted-foreground">{item.label}</span>
                  <span className="text-subhead text-foreground/60">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revvup */}
          <div className="p-8 bg-primary text-primary-foreground">
            <p className="text-subhead font-semibold uppercase tracking-wider text-white/60 mb-8">Revvup</p>
            <div className="space-y-5">
              {[
                { label: 'Commission', value: 'Zero. Forever.' },
                { label: 'Listings', value: 'Unlimited' },
                { label: 'Visibility', value: 'Earned by quality*' },
                { label: 'Our inventory', value: 'None. We don\'t sell.' },
                { label: 'Your profile', value: 'Full brand page' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-subhead text-white/70">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-subhead font-semibold">{item.value}</span>
                    <CheckCircle2 className="w-4 h-4 text-white/60" />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-caption1 text-white/50 mt-6">*Based on listing quality, response time, and buyer engagement.</p>
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
    <>
      <MacOSWindow url="car-marketplace.ae" contentClassName="flex flex-col regular:flex-row aspect-[3/4] compact:aspect-[4/3] regular:aspect-[16/9] large:aspect-[2.4/1] overflow-visible">
          {/* Left - Others: Cluttered fees with stacked cars */}
          <div className="flex-1 p-4 compact:p-6 large:p-14 pt-6 compact:pt-8 large:pt-16 pb-6 compact:pb-8 large:pb-16 flex flex-col items-center justify-center border-b regular:border-b-0 regular:border-r border-white/5 overflow-visible">
            <span className="text-[9px] compact:text-caption2 large:text-caption1 text-white/30 mb-4 compact:mb-6 large:mb-8">Others</span>
            
            <div className="relative w-full max-w-3xl py-3 compact:py-4">
              {/* 3 car cards - stacked/overlapping */}
              <div className="relative h-32 compact:h-44 large:h-56 xlarge:h-80 w-full flex items-center justify-center">
                {/* Card 1 - back left - hidden on mobile */}
                <div className="hidden compact:block absolute left-2 large:left-4 xlarge:left-8 top-4 compact:top-6 large:top-8 w-20 compact:w-28 large:w-40 xlarge:w-56 aspect-[4/3] rounded-md large:rounded-lg overflow-hidden border border-white/10 shadow-lg -rotate-3 opacity-60 compact:opacity-70">
                  <Image src={m3} alt="" className="w-full h-full object-cover" sizes="(max-width: 640px) 0px, (max-width: 1280px) 160px, 224px" />
                </div>
                
                {/* Card 2 - back right - hidden on mobile */}
                <div className="hidden compact:block absolute right-2 large:right-4 xlarge:right-8 top-4 compact:top-6 large:top-8 w-20 compact:w-28 large:w-40 xlarge:w-56 aspect-[4/3] rounded-md large:rounded-lg overflow-hidden border border-white/10 shadow-lg rotate-3 opacity-60 compact:opacity-70">
                  <Image src={m5} alt="" className="w-full h-full object-cover" sizes="(max-width: 640px) 0px, (max-width: 1280px) 160px, 224px" />
                </div>
                
                {/* Card 3 - front center */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 compact:top-0 w-36 compact:w-36 large:w-48 xlarge:w-72 aspect-[4/3] rounded-lg large:rounded-xl overflow-hidden border border-white/10 shadow-xl z-10">
                  <Image src={m8} alt="" className="w-full h-full object-cover" sizes="(max-width: 640px) 144px, (max-width: 1280px) 192px, 288px" />
                </div>
                
                {/* Moving mouse cursor */}
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
                  style={{ animation: 'cursor-move 3s ease-in-out infinite' }}
                >
                  <div className="relative">
                    <svg className="w-4 h-4 compact:w-5 compact:h-5 large:w-7 large:h-7 xlarge:w-8 xlarge:h-8 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4 4l16 6.5-6.5 2-2 6.5z"/>
                    </svg>
                    <div className="absolute -bottom-0.5 -right-0.5 w-1 h-1 compact:w-1.5 compact:h-1.5 large:w-2.5 large:h-2.5 rounded-full bg-destructive animate-pulse" />
                  </div>
                </div>
              </div>
              
              {/* Fee badges - floating around the cards */}
              <div className="absolute top-0 compact:top-1 large:top-0 left-4 compact:left-6 large:left-10 px-1.5 compact:px-2 large:px-3 py-0.5 compact:py-1 large:py-1.5 rounded-md bg-destructive text-[7px] compact:text-[9px] large:text-caption1 xlarge:text-subhead font-bold text-white shadow-lg -rotate-6 z-20">
                Premium 299
              </div>
              <div className="absolute top-0 compact:top-1 large:top-0 right-4 compact:right-6 large:right-10 px-1.5 compact:px-2 large:px-3 py-0.5 compact:py-1 large:py-1.5 rounded-md bg-orange-500 text-[7px] compact:text-[9px] large:text-caption1 xlarge:text-subhead font-semibold text-white shadow-lg rotate-6 z-20">
                Boost 149
              </div>
              <div className="absolute bottom-0 compact:bottom-1 large:bottom-0 left-1/2 -translate-x-1/2 px-1.5 compact:px-2 large:px-3 py-0.5 compact:py-1 large:py-1.5 rounded-md bg-rose-600 text-[7px] compact:text-[9px] large:text-caption1 xlarge:text-subhead font-semibold text-white shadow-lg z-20">
                5% commission
              </div>
            </div>
            
            <p className="text-[8px] compact:text-[9px] large:text-caption2 xlarge:text-caption1 text-white/30 mt-4 compact:mt-6 large:mt-8">Click this. Pay that.</p>
          </div>
          
          {/* Right - Revvup: Clean proposition */}
          <div className="w-full regular:w-[200px] large:w-[280px] xlarge:w-[360px] p-6 compact:p-10 large:p-16 flex flex-col items-center justify-center min-h-[160px] compact:min-h-0">
            <span className="text-[9px] compact:text-caption2 large:text-caption1 text-primary mb-4 compact:mb-6 large:mb-10">Revvup</span>
            
            <div className="flex flex-col items-center">
              {/* Giant zero */}
              <div 
                className="text-display1 compact:text-display2 large:text-display4 xlarge:text-display5 font-bold text-primary leading-none"
                style={{ animation: 'glow-zero 3s ease-in-out infinite' }}
              >
                0
              </div>
              <span className="text-caption1 compact:text-subhead large:text-callout text-primary/80 font-medium mt-1 compact:mt-2">paid visibility</span>
            </div>
            
            <p className="text-[8px] compact:text-[9px] large:text-caption2 xlarge:text-caption1 text-white/30 mt-4 compact:mt-6 large:mt-10">Quality ranks higher</p>
          </div>
      </MacOSWindow>
    </>
  );
}
