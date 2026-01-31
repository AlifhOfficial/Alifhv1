/**
 * Features Section - Built in Dubai
 * Platform features and capabilities
 */

'use client';

import { Clock, PenLine, Zap, Timer } from 'lucide-react';

export function FeaturesSection() {
  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Made for UAE
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            Fast. Simple.
            <br />
            <span className="text-muted-foreground">Done right.</span>
          </h2>
        </div>

        {/* Infographic */}
        <div className="mb-12">
          <BuiltInDubaiInfographic />
        </div>

        {/* Description */}
        <p className="text-base text-muted-foreground max-w-md mx-auto text-center mb-12 leading-relaxed">
          Built in Dubai. For Dubai. By people tired of overpriced car sites.
        </p>

        {/* Feature Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <FeatureCard 
            icon={Clock}
            title="Book anytime"
            description="See a car you like at midnight? Book a test drive right there."
          />

          <FeatureCard 
            icon={PenLine}
            title="Edit anytime"
            description="Change price, photos, description. Unlimited updates."
          />

          <FeatureCard 
            icon={Zap}
            title="Blazing fast"
            description="Pages load instantly. No waiting. No spinners."
          />

          {/* Highlighted Card */}
          <div className="p-6 rounded-xl bg-primary text-primary-foreground">
            <Timer className="w-5 h-5 text-primary-foreground/70 mb-3" />
            <h3 className="text-base font-semibold mb-1.5">Fresh listings only</h3>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              Old listings auto-expire. No more sold cars.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 rounded-xl border border-border/40 bg-sidebar">
      <Icon className="w-5 h-5 text-primary/80 mb-3" />
      <h3 className="text-base font-semibold mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

// ============================================================================
// INFOGRAPHIC: Built in Dubai - Clean experience visualization
// ============================================================================

function BuiltInDubaiInfographic() {
  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-sidebar border border-border/40">
      <div className="flex flex-col md:flex-row">
        {/* Left - What you see (screenshot already has macOS window) */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-10 border-b md:border-b-0 md:border-r border-border/20">
          <span className="text-[10px] sm:text-xs font-medium text-primary mb-4 sm:mb-6">What you see</span>
          
          <div className="flex-1 flex items-center justify-center">
            <img 
              src="/Marketing/buyerview2.png" 
              alt="Alifh dashboard" 
              className="w-full h-auto object-contain rounded-lg"
            />
          </div>
          
          <p className="text-[9px] sm:text-xs text-primary/70 mt-4 sm:mt-6 text-center">Just cars. That's it.</p>
        </div>
        
        {/* Right - What you don't see */}
        <div className="w-full md:w-[280px] lg:w-[360px] flex flex-col justify-center p-6 sm:p-8 lg:p-12">
          <span className="text-[10px] sm:text-xs font-medium text-muted-foreground/60 mb-6 sm:mb-8">What you don't see</span>
          
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center gap-3 text-muted-foreground/40">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded border border-current flex items-center justify-center text-[10px] sm:text-xs">✕</div>
              <span className="text-xs sm:text-sm line-through">Banner ads</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground/40">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded border border-current flex items-center justify-center text-[10px] sm:text-xs">✕</div>
              <span className="text-xs sm:text-sm line-through">Sponsored listings</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground/40">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded border border-current flex items-center justify-center text-[10px] sm:text-xs">✕</div>
              <span className="text-xs sm:text-sm line-through">Pop-up promotions</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground/40">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded border border-current flex items-center justify-center text-[10px] sm:text-xs">✕</div>
              <span className="text-xs sm:text-sm line-through">Dealer upsells</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground/40">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded border border-current flex items-center justify-center text-[10px] sm:text-xs">✕</div>
              <span className="text-xs sm:text-sm line-through">Pay-to-rank</span>
            </div>
          </div>
          
          <p className="text-[9px] sm:text-xs text-muted-foreground/50 mt-6 sm:mt-8">No noise. Ever.</p>
        </div>
      </div>
    </div>
  );
}
