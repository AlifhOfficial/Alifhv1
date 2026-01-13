/**
 * Pricing Tiers Section
 * Alifh Flow (recommended) vs Alifh Black (white-glove)
 */

'use client';

import Link from 'next/link';
import { CheckCircle2, Sparkles } from 'lucide-react';

export function PricingTiersSection() {
  return (
    <section id="tiers" className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">

        {/* Pricing Cards - Side by side */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          
          {/* Alifh Flow */}
          <div className="p-8 rounded-lg bg-[#0066FF] text-white relative">
            <div className="absolute -top-3 left-8">
              <span className="px-3 py-1 rounded-md bg-white text-[#0066FF] text-xs font-medium">
                Recommended
              </span>
            </div>
            
            <div className="pt-4">
              <p className="text-xs uppercase tracking-widest text-white/60 mb-2">
                Alifh Flow
              </p>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-semibold tracking-tight">AED 7,000</span>
                <span className="text-sm text-white/60">/month</span>
              </div>
              <p className="text-sm text-white/70 leading-relaxed mb-8">
                Everything you need. No limitations. No upsells. 
                What 95% of dealers should choose.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  'Unlimited listings',
                  'Test drive booking system',
                  'Lead management dashboard',
                  'Listing-based messaging',
                  'Staff role management',
                  'Analytics & inventory tracking',
                  'Verified partner badge',
                  'Google Reviews integration',
                  'Dealer profile page',
                  'All platform features',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-white/60" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/become-partner?plan=flow"
                className="w-full h-11 px-8 bg-white text-[#0066FF] text-sm font-medium rounded-lg hover:bg-white/90 transition-colors flex items-center justify-center"
              >
                Start with Flow
              </Link>
            </div>
          </div>

          {/* Alifh Black */}
          <div className="p-8 rounded-lg border-2 border-foreground bg-foreground text-background relative">
            <div className="absolute -top-3 left-8">
              <span className="px-3 py-1 rounded-md bg-background text-foreground text-xs font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Black
              </span>
            </div>
            
            <div className="pt-4">
              <p className="text-xs uppercase tracking-widest text-background/60 mb-2">
                Alifh Black
              </p>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-sm text-background/60">starts at</span>
                <span className="text-4xl font-semibold tracking-tight">AED 21,000</span>
                <span className="text-sm text-background/60">/mo</span>
              </div>
              <p className="text-sm text-background/70 leading-relaxed mb-8">
                Everything in Flow, plus dedicated brand tailoring. 
                For brands where every detail matters.
              </p>

              <p className="text-xs uppercase tracking-widest text-background/50 mb-3">
                Everything in Flow, plus:
              </p>
              <div className="space-y-3 mb-8">
                {[
                  'Custom showroom page',
                  'Dedicated onboarding',
                  'Brand consultation',
                  'Priority support',
                  'Quarterly reviews',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-background/60" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>

              {/* What it's NOT */}
              <div className="p-4 rounded-lg bg-background/10 mb-8">
                <p className="text-xs text-background/50 mb-2">What Black is not:</p>
                <p className="text-xs text-background/60">More features • Better visibility • Premium placement</p>
              </div>

              <Link
                href="/become-partner?plan=black"
                className="w-full h-11 px-8 bg-background text-foreground text-sm font-medium rounded-lg hover:bg-background/90 transition-colors flex items-center justify-center"
              >
                Apply for Black
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom note */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">The difference isn't features—it's attention.</span> 
            {' '}Flow is self-service. Black is concierge. Both work. Both convert.
          </p>
        </div>

      </div>
    </section>
  );
}
