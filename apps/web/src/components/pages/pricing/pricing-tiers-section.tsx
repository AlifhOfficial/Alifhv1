/**
 * Pricing Tiers Section
 * Alifh Flow (recommended) vs Alifh Black (white-glove)
 */

'use client';

import Link from 'next/link';
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

export function PricingTiersSection() {
  return (
    <section id="tiers" className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">

        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Choose your path
          </p>
          <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
            Two options. Same platform.
            <br />
            <span className="text-muted-foreground/70">Different levels of attention.</span>
          </h2>
        </div>

        {/* Mix & Match Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-[1200px] mx-auto">
          
          {/* Flow - Main Card */}
          <div className="lg:col-span-2 p-8 rounded-lg bg-[#0066FF] text-white flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase tracking-widest text-white/60">Alifh Flow</p>
              <span className="px-2.5 py-1 rounded-full bg-white/20 text-[10px] font-medium uppercase tracking-wider">
                Recommended
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-semibold tracking-tight">AED 7,000</span>
              <span className="text-sm text-white/60">/month</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed mb-6">
              Everything you need. No limitations. No upsells. What 95% of dealers choose.
            </p>
            <Link
              href="/become-partner?plan=flow"
              className="mt-auto h-11 px-6 bg-white text-[#0066FF] text-sm font-medium rounded-lg hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
            >
              Start with Flow
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Flow Features - Grid */}
          {[
            { title: 'Unlimited listings', desc: '10 cars or 1,000. Same price.' },
            { title: 'Test drive booking', desc: 'Customers book directly.' },
            { title: 'Lead management', desc: 'Track every inquiry.' },
            { title: 'Listing messaging', desc: 'In-platform communication.' },
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-lg border border-border/40 bg-background">
              <CheckCircle2 className="w-5 h-5 text-[#0066FF] mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}

          {/* More Flow Features */}
          {[
            { title: 'Staff management', desc: 'Roles & permissions.' },
            { title: 'Analytics', desc: 'Views, leads, performance.' },
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-lg border border-border/40 bg-background">
              <CheckCircle2 className="w-5 h-5 text-[#0066FF] mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}

          {/* More features compact */}
          <div className="lg:col-span-2 p-6 rounded-lg border border-border/40 bg-background">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Also included</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                'Verified partner badge',
                'Google Reviews integration',
                'Dealer profile page',
                'All platform features',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0066FF] shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="max-w-[1200px] mx-auto my-16 flex items-center gap-6">
          <div className="flex-1 h-px bg-border/40" />
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Or go further</p>
          <div className="flex-1 h-px bg-border/40" />
        </div>

        {/* Black Tier */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-[1200px] mx-auto">
          
          {/* Black - Main Card */}
          <div className="lg:col-span-2 p-8 rounded-lg bg-muted border border-border/40 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Alifh Black</p>
              <span className="px-2.5 py-1 rounded-full bg-foreground/10 text-[10px] font-medium uppercase tracking-wider flex items-center gap-1 text-foreground">
                <Sparkles className="w-3 h-3" />
                Concierge
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-sm text-muted-foreground">from</span>
              <span className="text-4xl font-semibold tracking-tight text-foreground">AED 21,000</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Everything in Flow, plus dedicated brand tailoring. For brands where every detail matters.
            </p>
            <Link
              href="/become-partner?plan=black"
              className="mt-auto h-11 px-6 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2"
            >
              Apply for Black
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Black extras */}
          {[
            { title: 'Custom showroom page', desc: 'Tailored to your brand identity.' },
            { title: 'Dedicated onboarding', desc: 'White-glove setup experience.' },
            { title: 'Brand consultation', desc: 'Strategic positioning advice.' },
            { title: 'Priority support', desc: 'Direct line. Fast responses.' },
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-lg border border-border/40 bg-background">
              <Sparkles className="w-5 h-5 text-foreground/60 mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}

          {/* Clarification */}
          <div className="lg:col-span-2 p-6 rounded-lg border border-border/40 bg-muted/30">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">What Black is not</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Black doesn't give you more features, better visibility, or premium placement. 
              It's the same platform with more hands-on support. The difference is attention—not advantage.
            </p>
          </div>

        </div>

        {/* Bottom Summary */}
        <div className="flex items-center justify-center gap-12 pt-12 mt-12 border-t border-border/40 max-w-[800px] mx-auto">
          <div className="text-center space-y-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Flow</div>
            <div className="text-lg font-semibold tracking-tight text-foreground">Self-service</div>
          </div>
          <div className="w-px h-8 bg-border/40" />
          <div className="text-center space-y-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Black</div>
            <div className="text-lg font-semibold tracking-tight text-foreground">Concierge</div>
          </div>
          <div className="w-px h-8 bg-border/40" />
          <div className="text-center space-y-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Both</div>
            <div className="text-lg font-semibold tracking-tight text-[#0066FF]">Convert</div>
          </div>
        </div>

      </div>
    </section>
  );
}
