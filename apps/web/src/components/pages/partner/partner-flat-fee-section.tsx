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
    <div className="relative w-full rounded-lg overflow-hidden bg-sidebar border border-border/40">
      {/* Typing animation CSS */}
      <style>{`
        @keyframes typing {
          from { max-width: 0 }
          to { max-width: 500px }
        }
        @keyframes blink {
          50% { border-color: transparent }
        }
        .typing-text {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          border-right: 2px solid hsl(var(--primary));
          animation: typing 2.5s steps(28, end) forwards, blink 0.75s step-end infinite;
        }
      `}</style>
      
      <div className="flex flex-col-reverse md:flex-row min-h-[auto] md:min-h-[560px] lg:min-h-[720px]">
        {/* Left - macOS window with 3 car cards (80% on desktop) */}
        <div className="w-full md:w-[80%] flex flex-col md:border-r border-t md:border-t-0 border-border/20 p-3 sm:p-6 lg:p-12">
          <span className="text-[10px] sm:text-xs font-medium text-muted-foreground/60 mb-3 sm:mb-6">Your inventory</span>
          
          <div className="flex-1 flex flex-col items-center justify-center relative w-full">
            {/* macOS Window Frame */}
            <div className="w-full md:h-[85%] flex flex-col">
              <div className="rounded-lg overflow-hidden shadow-2xl border border-white/10 flex-1 flex flex-col">
                {/* macOS Title Bar */}
                <div className="bg-[#28282a] px-3 sm:px-5 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 border-b border-black/20">
                  {/* Traffic Light Buttons */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ff5f57]" />
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#febc2e]" />
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#28c840]" />
                  </div>
                  {/* Navigation Arrows - hidden on mobile */}
                  <div className="hidden sm:flex items-center gap-1 ml-1">
                    <div className="w-5 h-5 flex items-center justify-center text-white/30">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                      </svg>
                    </div>
                    <div className="w-5 h-5 flex items-center justify-center text-white/30">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </div>
                  {/* URL Bar */}
                  <div className="flex-1 flex justify-center">
                    <div className="bg-[#1c1c1e] rounded-md px-2 sm:px-4 py-1 sm:py-1.5 flex items-center gap-1.5 sm:gap-2 max-w-[100px] sm:max-w-[280px]">
                      <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white/40 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                      </svg>
                      <span className="text-[8px] sm:text-sm text-white/60 font-medium truncate">alifh.ae/dashboard</span>
                    </div>
                  </div>
                  {/* Right spacer */}
                  <div className="w-6 sm:w-24" />
                </div>
                
                {/* Window Content */}
                <div className="bg-[#000] p-3 sm:p-6 lg:p-14 flex-1 flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-8 w-full max-w-4xl">
                    {/* Card 1 */}
                    <div className="flex flex-col overflow-hidden rounded-lg sm:rounded-xl bg-[#141414] border border-white/10 shadow-sm hover:shadow-xl hover:border-white/20 transition-all">
                      <div className="aspect-[3/2] w-full overflow-hidden bg-muted/20">
                        <img src="/Marketing/m14.jpeg" alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="flex items-center justify-between gap-1 sm:gap-2 p-2 sm:p-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] sm:text-sm lg:text-base font-semibold truncate text-white">Landcruiser</p>
                          <div className="flex items-center gap-0.5 sm:gap-1 mt-0.5">
                            <p className="text-[7px] sm:text-xs lg:text-sm text-white/50 truncate">IS Motors</p>
                            <CheckCircle2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 flex-shrink-0 text-blue-500" />
                          </div>
                        </div>
                        <img src="/Marketing/avatarmock.png" alt="" className="w-5 h-5 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full object-cover flex-shrink-0 border border-white/10" />
                      </div>
                    </div>
                    
                    {/* Card 2 */}
                    <div className="flex flex-col overflow-hidden rounded-lg sm:rounded-xl bg-[#141414] border border-white/10 shadow-sm hover:shadow-xl hover:border-white/20 transition-all">
                      <div className="aspect-[3/2] w-full overflow-hidden bg-muted/20">
                        <img src="/Marketing/m15.jpeg" alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="flex items-center justify-between gap-1 sm:gap-2 p-2 sm:p-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] sm:text-sm lg:text-base font-semibold truncate text-white">Lexus</p>
                          <div className="flex items-center gap-0.5 sm:gap-1 mt-0.5">
                            <p className="text-[7px] sm:text-xs lg:text-sm text-white/50 truncate">IS Motors</p>
                            <CheckCircle2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 flex-shrink-0 text-blue-500" />
                          </div>
                        </div>
                        <img src="/Marketing/avatarmock.png" alt="" className="w-5 h-5 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full object-cover flex-shrink-0 border border-white/10" />
                      </div>
                    </div>
                    
                    {/* Card 3 */}
                    <div className="flex flex-col overflow-hidden rounded-lg sm:rounded-xl bg-[#141414] border border-white/10 shadow-sm hover:shadow-xl hover:border-white/20 transition-all">
                      <div className="aspect-[3/2] w-full overflow-hidden bg-muted/20">
                        <img src="/Marketing/m17.jpeg" alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="flex items-center justify-between gap-1 sm:gap-2 p-2 sm:p-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] sm:text-sm lg:text-base font-semibold truncate text-white">McLaren</p>
                          <div className="flex items-center gap-0.5 sm:gap-1 mt-0.5">
                            <p className="text-[7px] sm:text-xs lg:text-sm text-white/50 truncate">IS Motors</p>
                            <CheckCircle2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 flex-shrink-0 text-blue-500" />
                          </div>
                        </div>
                        <img src="/Marketing/avatarmock.png" alt="" className="w-5 h-5 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full object-cover flex-shrink-0 border border-white/10" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Typing animated text below cards */}
            <p className="typing-text mt-4 sm:mt-10 text-sm sm:text-lg lg:text-xl text-primary font-medium inline-block">
              + ∞ more listings included
            </p>
          </div>
        </div>
        
        {/* Right - One subscription (20% on desktop) */}
        <div className="w-full md:w-[20%] flex flex-col items-center justify-center py-6 md:py-4 px-4 sm:p-6 lg:p-10">
          <span className="text-[10px] sm:text-xs font-medium text-primary mb-3 sm:mb-8">Your cost</span>
          <div className="text-center">
            <div className="text-4xl sm:text-6xl lg:text-7xl font-bold text-primary tracking-tight">1</div>
            <p className="text-xs sm:text-base text-primary/80 mt-2 sm:mt-4 font-medium">subscription</p>
            <p className="text-[10px] sm:text-sm text-muted-foreground/50 mt-0.5 sm:mt-1">per month</p>
          </div>
        </div>
      </div>
    </div>
  );
}
