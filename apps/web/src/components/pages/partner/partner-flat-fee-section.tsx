/**
 * Partner Flat Fee Section - Revvup Partners Page
 * Visual grid - what's included, no bloat
 */

'use client';

import { CheckCircle2 } from 'lucide-react';
import { MacOSWindow } from '@/components/ui/macos-window';
import { getStaticUrl } from '@/utils';

export function PartnerFlatFeeSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            The Revvup model
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            One price. Everything included.
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
            <h3 className="text-base font-semibold mb-1">Your margins stay yours</h3>
            <p className="text-sm text-white/60">
              We don't take a cut. Ever.
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
            <p className="text-sm text-muted-foreground">Hidden fees</p>
          </div>
        </div>

        {/* Micro-summary - Reset attention */}
        <div className="mt-16 text-center">
          <p className="text-sm font-medium text-muted-foreground bg-muted/50 inline-block px-6 py-3 rounded-full">
            In short: Flat fee. No commission. No competition.
          </p>
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
    <div className="relative w-full rounded-lg overflow-hidden bg-sidebar border border-border/40 p-3 sm:p-6 lg:p-12">
      {/* Typing animation CSS */}
      <style>{`
        @keyframes typing {
          from { max-width: 0 }
          to { max-width: 500px }
        }
        @keyframes blink {
          50% { border-color: transparent }
        }
        @keyframes glow-one {
          0%, 100% { text-shadow: 0 0 40px rgba(0, 102, 255, 0.3); }
          50% { text-shadow: 0 0 60px rgba(0, 102, 255, 0.5); }
        }
        .typing-text {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          border-right: 2px solid hsl(var(--primary));
          animation: typing 2.5s steps(28, end) forwards, blink 0.75s step-end infinite;
        }
      `}</style>

<MacOSWindow url="revvup.ae/dashboard" contentClassName="flex flex-col md:flex-row aspect-[4/3] sm:aspect-[16/9] md:aspect-[2.4/1]">
          {/* Left - Your inventory with car cards */}
          <div className="flex-1 p-4 sm:p-8 lg:p-12 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5">
            <span className="text-[10px] sm:text-xs font-medium text-white/30 mb-4 sm:mb-6">Your inventory</span>
            
            <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6 w-full max-w-3xl">
              {/* Card 1 */}
              <div className="flex flex-col overflow-hidden rounded-lg sm:rounded-xl bg-[#141414] border border-white/10 shadow-sm">
                <div className="aspect-[3/2] w-full overflow-hidden bg-muted/20">
                  <img src={getStaticUrl("/Marketing/m14.jpeg")} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center justify-between gap-1 sm:gap-2 p-1.5 sm:p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[8px] sm:text-xs lg:text-sm font-semibold truncate text-white">Landcruiser</p>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <p className="text-[6px] sm:text-[10px] lg:text-xs text-white/50 truncate">IS Motors</p>
                      <CheckCircle2 className="w-2 h-2 sm:w-3 sm:h-3 flex-shrink-0 text-blue-500" />
                    </div>
                  </div>
                  <img src={getStaticUrl("/Marketing/avatarmock.png")} alt="" className="w-4 h-4 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full object-cover flex-shrink-0 border border-white/10" />
                </div>
              </div>
              
              {/* Card 2 */}
              <div className="flex flex-col overflow-hidden rounded-lg sm:rounded-xl bg-[#141414] border border-white/10 shadow-sm">
                <div className="aspect-[3/2] w-full overflow-hidden bg-muted/20">
                  <img src={getStaticUrl("/Marketing/m15.jpeg")} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center justify-between gap-1 sm:gap-2 p-1.5 sm:p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[8px] sm:text-xs lg:text-sm font-semibold truncate text-white">Lexus</p>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <p className="text-[6px] sm:text-[10px] lg:text-xs text-white/50 truncate">IS Motors</p>
                      <CheckCircle2 className="w-2 h-2 sm:w-3 sm:h-3 flex-shrink-0 text-blue-500" />
                    </div>
                  </div>
                  <img src={getStaticUrl("/Marketing/avatarmock.png")} alt="" className="w-4 h-4 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full object-cover flex-shrink-0 border border-white/10" />
                </div>
              </div>
              
              {/* Card 3 */}
              <div className="flex flex-col overflow-hidden rounded-lg sm:rounded-xl bg-[#141414] border border-white/10 shadow-sm">
                <div className="aspect-[3/2] w-full overflow-hidden bg-muted/20">
                  <img src={getStaticUrl("/Marketing/m17.jpeg")} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center justify-between gap-1 sm:gap-2 p-1.5 sm:p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[8px] sm:text-xs lg:text-sm font-semibold truncate text-white">McLaren</p>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <p className="text-[6px] sm:text-[10px] lg:text-xs text-white/50 truncate">IS Motors</p>
                      <CheckCircle2 className="w-2 h-2 sm:w-3 sm:h-3 flex-shrink-0 text-blue-500" />
                    </div>
                  </div>
                  <img src={getStaticUrl("/Marketing/avatarmock.png")} alt="" className="w-4 h-4 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full object-cover flex-shrink-0 border border-white/10" />
                </div>
              </div>
            </div>
            
            {/* Typing animated text below cards */}
            <p className="typing-text mt-4 sm:mt-8 text-xs sm:text-base lg:text-lg text-primary font-medium">
              + ∞ more listings included
            </p>
          </div>
          
          {/* Right - One subscription */}
          <div className="w-full md:w-[280px] lg:w-[360px] p-8 sm:p-12 lg:p-16 flex flex-col items-center justify-center">
            <span className="text-[10px] sm:text-xs font-medium text-primary mb-8 sm:mb-10">Your cost</span>
            
            <div className="flex flex-col items-center">
              {/* Giant one */}
              <div 
                className="text-7xl sm:text-8xl lg:text-9xl font-bold text-primary leading-none"
                style={{ animation: 'glow-one 3s ease-in-out infinite' }}
              >
                1
              </div>
              <span className="text-sm sm:text-base text-primary/80 font-medium mt-2">subscription</span>
            </div>
            
            <p className="text-[10px] sm:text-xs text-white/30 mt-8 sm:mt-10">per month</p>
          </div>
      </MacOSWindow>
    </div>
  );
}
