/**
 * Partner Flat Fee Section - Alifh Partners Page
 * Visual grid - what's included, no bloat
 */

'use client';

import { CheckCircle2 } from 'lucide-react';

export function PartnerFlatFeeSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            The Alifh model
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            One price. Everything.
            <br />
            <span className="text-muted-foreground">That's it.</span>
          </h2>
        </div>

        {/* Infographic */}
        <div className="mb-12">
          <UnlimitedListingsInfographic />
        </div>

        {/* Description */}
        <p className="text-base text-muted-foreground leading-relaxed max-w-lg mx-auto text-center mb-16">
          Your margins are yours. We succeed when you succeed—not by skimming off your sales.
        </p>

        {/* Feature Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-16">
          <FeatureCard 
            title="Unlimited listings"
            description="10 or 1,000. Same price."
          />
          <FeatureCard 
            title="All features"
            description="No add-ons. No tiers."
          />
          <FeatureCard 
            title="No credits"
            description="No tokens. No wallet."
          />
          
          {/* Highlighted Card */}
          <div className="p-6 rounded-xl bg-primary text-primary-foreground">
            <CheckCircle2 className="w-5 h-5 text-white/70 mb-3" />
            <h3 className="text-base font-semibold mb-1">Zero commission</h3>
            <p className="text-sm text-white/60">
              On any sale. Ever.
            </p>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 lg:gap-16 pt-12 border-t border-border/40 max-w-5xl mx-auto">
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold tracking-tight text-primary">AED 0</div>
            <p className="text-sm text-muted-foreground">Per listing</p>
          </div>
          <div className="w-px h-8 bg-border/30 hidden sm:block" />
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold tracking-tight text-primary">AED 0</div>
            <p className="text-sm text-muted-foreground">Per sale</p>
          </div>
          <div className="w-px h-8 bg-border/30 hidden sm:block" />
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold tracking-tight text-primary">AED 0</div>
            <p className="text-sm text-muted-foreground">To boost</p>
          </div>
          <div className="w-px h-8 bg-border/30 hidden sm:block" />
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold tracking-tight text-primary">AED 0</div>
            <p className="text-sm text-muted-foreground">Hidden fees</p>
          </div>
        </div>

      </div>
    </section>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface FeatureCardProps {
  title: string;
  description: string;
}

function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="p-6 rounded-xl border border-border/40 bg-sidebar">
      <CheckCircle2 className="w-5 h-5 text-primary/80 mb-3" />
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

// ============================================================================
// INFOGRAPHIC: Unlimited Listings - Visual grid showing scale
// ============================================================================

function UnlimitedListingsInfographic() {
  return (
    <div className="relative w-full aspect-video sm:aspect-[2.4/1] rounded-lg overflow-hidden bg-sidebar border border-border/40">
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes card-pop-1 { 0%, 10% { opacity: 0; transform: scale(0.8); } 20%, 100% { opacity: 1; transform: scale(1); } }
        @keyframes card-pop-2 { 0%, 20% { opacity: 0; transform: scale(0.8); } 30%, 100% { opacity: 1; transform: scale(1); } }
        @keyframes card-pop-3 { 0%, 30% { opacity: 0; transform: scale(0.8); } 40%, 100% { opacity: 1; transform: scale(1); } }
        @keyframes card-pop-4 { 0%, 40% { opacity: 0; transform: scale(0.8); } 50%, 100% { opacity: 1; transform: scale(1); } }
        @keyframes card-pop-5 { 0%, 50% { opacity: 0; transform: scale(0.8); } 60%, 100% { opacity: 1; transform: scale(1); } }
        @keyframes card-pop-6 { 0%, 60% { opacity: 0; transform: scale(0.8); } 70%, 100% { opacity: 1; transform: scale(1); } }
        @keyframes cost-stay { 0%, 80% { opacity: 0.5; } 90%, 100% { opacity: 1; } }
      `}</style>

      <div className="h-full flex">
        {/* Left - Growing inventory grid */}
        <div className="flex-1 flex flex-col border-r border-border/20 p-4 sm:p-6 lg:p-8">
          <span className="text-xs font-medium text-muted-foreground/60 mb-4">Your inventory</span>
          
          <div className="flex-1 flex items-center justify-center">
            <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
              {/* Car cards that pop in */}
              <div 
                className="w-24 sm:w-36 lg:w-44 xl:w-52 aspect-[4/3] rounded-lg overflow-hidden border border-border/20 shadow-sm"
                style={{ animation: 'card-pop-1 8s ease-out infinite' }}
              >
                <img src="/Marketing/m3.jpeg" alt="" className="w-full h-full object-cover" />
              </div>
              <div 
                className="w-24 sm:w-36 lg:w-44 xl:w-52 aspect-[4/3] rounded-lg overflow-hidden border border-border/20 shadow-sm"
                style={{ animation: 'card-pop-2 8s ease-out infinite' }}
              >
                <img src="/Marketing/m4.jpeg" alt="" className="w-full h-full object-cover" />
              </div>
              <div 
                className="w-24 sm:w-36 lg:w-44 xl:w-52 aspect-[4/3] rounded-lg overflow-hidden border border-border/20 shadow-sm"
                style={{ animation: 'card-pop-3 8s ease-out infinite' }}
              >
                <img src="/Marketing/m5.jpeg" alt="" className="w-full h-full object-cover" />
              </div>
              <div 
                className="w-24 sm:w-36 lg:w-44 xl:w-52 aspect-[4/3] rounded-lg overflow-hidden border border-border/20 shadow-sm"
                style={{ animation: 'card-pop-4 8s ease-out infinite' }}
              >
                <img src="/Marketing/m6.jpeg" alt="" className="w-full h-full object-cover" />
              </div>
              <div 
                className="w-24 sm:w-36 lg:w-44 xl:w-52 aspect-[4/3] rounded-lg overflow-hidden border border-border/20 shadow-sm"
                style={{ animation: 'card-pop-5 8s ease-out infinite' }}
              >
                <img src="/Marketing/m7.jpeg" alt="" className="w-full h-full object-cover" />
              </div>
              {/* Plus more indicator */}
              <div 
                className="w-24 sm:w-36 lg:w-44 xl:w-52 aspect-[4/3] rounded-lg border border-dashed border-primary/40 bg-primary/5 flex items-center justify-center"
                style={{ animation: 'card-pop-6 8s ease-out infinite' }}
              >
                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary/60">+∞</span>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground/50 text-center mt-4">Add as many as you want</p>
        </div>
        
        {/* Right - Cost stays zero */}
        <div className="w-40 sm:w-56 lg:w-72 flex flex-col p-4 sm:p-6 lg:p-8">
          <span className="text-xs font-medium text-primary mb-4">Your cost per listing</span>
          
          <div 
            className="flex-1 flex items-center justify-center"
            style={{ animation: 'cost-stay 8s ease-out infinite' }}
          >
            <div className="text-center">
              <div className="text-7xl sm:text-8xl lg:text-9xl font-bold text-foreground tracking-tighter leading-none">0</div>
              <p className="text-base sm:text-lg text-muted-foreground mt-2">always</p>
            </div>
          </div>
          
          <p className="text-xs text-primary/60 text-center mt-4">No matter how many</p>
        </div>
      </div>
    </div>
  );
}
