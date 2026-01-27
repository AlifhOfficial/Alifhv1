/**
 * Partner Pain Point Section - Alifh Partners Page
 * Visual comparison - their games vs our simplicity
 */

'use client';

import { CheckCircle2, X } from 'lucide-react';

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
          They compete with you by selling their own cars. Then charge you for visibility on their platform.
        </p>

        {/* Comparison Cards */}
        <div className="grid sm:grid-cols-2 gap-px bg-border/40 rounded-lg overflow-hidden border border-border/40 max-w-5xl mx-auto">
          
          {/* Others */}
          <div className="p-8 bg-sidebar">
            <span className="text-sm font-semibold text-muted-foreground/60 mb-8 block">Others</span>
            <div className="space-y-4">
              {[
                'Commission on every sale',
                'Credits that expire',
                'Pay per listing per day',
                'Premium to be seen',
                'They sell cars too',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <X className="w-5 h-5 text-muted-foreground/40" />
                  <span className="text-base text-muted-foreground/60">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alifh */}
          <div className="p-8 bg-primary text-primary-foreground">
            <span className="text-sm font-semibold text-white/60 mb-8 block">Alifh</span>
            <div className="space-y-4">
              {[
                'Zero commission',
                'No credits, no tokens',
                'Unlimited listings per showroom',
                'Quality earns visibility',
                'We never sell cars',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-white/60" />
                  <span className="text-base font-semibold">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

// ============================================================================
// INFOGRAPHIC: Marketplace Game - Click chaos vs zero
// ============================================================================

function MarketplaceGameInfographic() {
  return (
    <div className="relative w-full aspect-[16/9] sm:aspect-[2.4/1] rounded-lg overflow-hidden bg-sidebar border border-border/40">
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes glow-zero {
          0%, 100% { text-shadow: 0 0 40px rgba(0, 102, 255, 0.3); }
          50% { text-shadow: 0 0 60px rgba(0, 102, 255, 0.5); }
        }
      `}</style>

      <div className="h-full flex">
        {/* Left - Others: Car with click prompts */}
        <div className="flex-1 flex flex-col items-center justify-center border-r border-border/20 p-4 sm:p-6 lg:p-8">
          <span className="text-xs font-medium text-muted-foreground/60 mb-4 sm:mb-6">Others</span>
          
          <div className="relative">
            {/* Car image */}
            <div className="w-40 sm:w-56 lg:w-72 aspect-[4/3] rounded-lg overflow-hidden border border-border/30 opacity-60">
              <img 
                src="/Marketing/m5.jpeg" 
                alt="" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Click prompts with cursors */}
            <div className="absolute -top-3 -right-2 sm:-right-6 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground/50" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4l16 6.5-6.5 2-2 6.5z"/>
              </svg>
              <span className="text-[8px] sm:text-[9px] text-muted-foreground/50">boost this</span>
            </div>
            
            <div className="absolute top-6 sm:top-8 -left-2 sm:-left-8 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground/50" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4l16 6.5-6.5 2-2 6.5z"/>
              </svg>
              <span className="text-[8px] sm:text-[9px] text-muted-foreground/50">pay to feature</span>
            </div>
            
            <div className="absolute -bottom-2 left-4 sm:left-6 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground/50" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4l16 6.5-6.5 2-2 6.5z"/>
              </svg>
              <span className="text-[8px] sm:text-[9px] text-muted-foreground/50">renew listing</span>
            </div>
            
            <div className="absolute bottom-8 sm:bottom-10 -right-2 sm:-right-10 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground/50" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4l16 6.5-6.5 2-2 6.5z"/>
              </svg>
              <span className="text-[8px] sm:text-[9px] text-muted-foreground/50">buy credits</span>
            </div>
          </div>
          
          <p className="text-[10px] sm:text-xs text-muted-foreground/50 mt-6 sm:mt-8">Click, click, click...</p>
        </div>
        
        {/* Right - Alifh: Big zero */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-10">
          <span className="text-xs font-medium text-primary mb-6 sm:mb-8">Alifh</span>
          
          {/* Giant zero */}
          <div 
            className="text-7xl sm:text-8xl lg:text-9xl font-bold text-primary"
            style={{ animation: 'glow-zero 3s ease-in-out infinite' }}
          >
            0
          </div>
          
          <div className="mt-4 sm:mt-6 text-center">
            <span className="text-xs sm:text-sm text-primary/70">per listing</span>
            <span className="block text-[10px] sm:text-xs text-muted-foreground/50 mt-1">per boost, per feature, per sale</span>
          </div>
        </div>
      </div>
    </div>
  );
}
