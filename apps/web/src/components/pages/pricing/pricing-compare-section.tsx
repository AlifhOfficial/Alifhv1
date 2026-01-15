/**
 * Pricing Compare Section
 * What both include + comparison to typical marketplaces
 */

'use client';

import { CheckCircle2 } from 'lucide-react';

export function PricingCompareSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            What you always get
          </p>
          <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
            Both plans. Same promise.
            <br />
            <span className="text-muted-foreground/70">No exceptions.</span>
          </h2>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-20">
          {[
            { title: 'Zero commission', desc: 'Not 1%. Not "just this time." Never.' },
            { title: 'Unlimited listings', desc: 'Per showroom. 10 cars or 500.' },
            { title: 'No per-listing fees', desc: 'No credits. No tokens. No daily charges.' },
            { title: 'All features included', desc: 'Booking, leads, analytics, messaging.' },
            { title: 'Quality-based ranking', desc: 'Visibility is earned, not bought.' },
            { title: 'Month-to-month', desc: 'No long-term contracts. Cancel anytime.' },
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-lg border border-border/40 bg-background">
              <CheckCircle2 className="w-5 h-5 text-[#0066FF] mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Comparison Section */}
        <div className="text-center mb-12 space-y-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Compare
          </p>
          <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
            You know the math.
            <br />
            <span className="text-muted-foreground/70">Per-listing fees. Commission. Boosts. Add-ons.</span>
          </h2>
        </div>

        {/* Simple comparison */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          
          {/* Others */}
          <div className="p-8 rounded-lg border border-border/40 bg-background">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-6">
              Typical marketplace
            </p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Per-listing daily fees</p>
              <p>3-5% commission on every sale</p>
              <p>Upsells for basic features</p>
              <p>Boost packages to stay visible</p>
              <p>Premium placements (pay-to-win)</p>
            </div>
            <div className="pt-6 mt-6 border-t border-border/40">
              <p className="text-sm text-muted-foreground/60">
                It adds up. You know it does.
              </p>
            </div>
          </div>

          {/* Alifh */}
          <div className="p-8 rounded-lg bg-[#0066FF] text-white">
            <p className="text-xs uppercase tracking-widest text-white/60 mb-6">
              Alifh Flow
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white/60" />
                <span className="text-sm">Flat fee per showroom</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white/60" />
                <span className="text-sm">Zero commission</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white/60" />
                <span className="text-sm">Unlimited listings per showroom</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white/60" />
                <span className="text-sm">All features included</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white/60" />
                <span className="text-sm">No upsells, no boosts</span>
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-white/20">
              <p className="text-2xl font-semibold tracking-tight">AED 7,000</p>
              <p className="text-sm text-white/70">/month · launch pricing</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
