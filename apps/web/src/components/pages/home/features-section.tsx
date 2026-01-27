/**
 * Features Section - Built in Dubai
 * Platform features and capabilities
 */

'use client';

import Link from 'next/link';
import { Clock, PenLine, Zap, Timer } from 'lucide-react';

export function FeaturesSection() {
  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Built in Dubai
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            Everything You Need.
            <br />
            <span className="text-muted-foreground">Nothing You Don't.</span>
          </h2>
        </div>

        {/* Infographic */}
        <div className="mb-12">
          <BuiltInDubaiInfographic />
        </div>

        {/* Description */}
        <p className="text-base text-muted-foreground max-w-md mx-auto text-center mb-16 leading-relaxed">
          Local team. Clean experience. Every feature designed with purpose.
        </p>

        {/* Feature Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16">
          <FeatureCard 
            icon={Clock}
            title="Book anytime"
            description="Found your car at 2 AM? Book a test drive instantly."
          />

          <FeatureCard 
            icon={PenLine}
            title="Unlimited edits"
            description="Update your listing anytime. No restrictions."
          />

          <FeatureCard 
            icon={Zap}
            title="Actually fast"
            description='Not "loading spinner" fast. Actually fast.'
          />

          {/* Highlighted Card */}
          <div className="p-6 rounded-xl bg-primary text-primary-foreground">
            <Timer className="w-5 h-5 text-primary-foreground/70 mb-3" />
            <h3 className="text-base font-semibold mb-1.5">Auto-expire listings</h3>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              No messaging about cars that sold 3 months ago.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/about"
            className="w-full sm:w-auto h-12 px-10 bg-primary text-primary-foreground text-base font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
          >
            Meet the team
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
    <div className="relative w-full aspect-[16/9] sm:aspect-[2.4/1] rounded-lg overflow-hidden bg-sidebar border border-border/40">
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float-up {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>

      <div className="h-full flex flex-col lg:flex-row">
        {/* Left - What you see */}
        <div className="flex-1 relative p-6 lg:p-10 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-border/10">
          <span className="text-xs font-medium text-primary mb-4">What you see</span>
          
          {/* Clean car grid - no ads, no banners */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-md lg:max-w-lg">
            {['/Marketing/m4.jpeg', '/Marketing/m5.jpeg', '/Marketing/m7.jpeg', '/Marketing/m8.jpeg', '/Marketing/m9.jpeg', '/Marketing/m1.jpeg'].map((src, i) => (
              <div 
                key={i}
                className="aspect-[4/3] rounded-lg overflow-hidden border border-border/20"
                style={{ animation: `float-up 3s ease-in-out infinite ${i * 0.15}s` }}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-4">Just cars. That's it.</p>
        </div>
        
        {/* Right - What you don't see */}
        <div className="flex-1 p-6 lg:p-10 flex flex-col justify-center">
          <span className="text-xs font-medium text-muted-foreground/60 mb-4">What you don't see</span>
          
          {/* List of things we don't have */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3 text-muted-foreground/40">
              <div className="w-4 h-4 rounded border border-current flex items-center justify-center text-[10px]">✕</div>
              <span className="text-sm line-through">Banner ads</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground/40">
              <div className="w-4 h-4 rounded border border-current flex items-center justify-center text-[10px]">✕</div>
              <span className="text-sm line-through">Sponsored listings</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground/40">
              <div className="w-4 h-4 rounded border border-current flex items-center justify-center text-[10px]">✕</div>
              <span className="text-sm line-through">Pop-up promotions</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground/40">
              <div className="w-4 h-4 rounded border border-current flex items-center justify-center text-[10px]">✕</div>
              <span className="text-sm line-through">Dealer upsells</span>
            </div>
          </div>
          
          <p className="text-[11px] text-muted-foreground mt-6">
            Built by people who got tired of the noise.
          </p>
        </div>
      </div>
    </div>
  );
}
