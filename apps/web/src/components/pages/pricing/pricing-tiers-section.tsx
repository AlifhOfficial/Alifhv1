/**
 * Pricing Tiers Section
 * Alifh Flow (recommended) vs Alifh Black (white-glove)
 */

'use client';

import Link from 'next/link';

export function PricingTiersSection() {
  return (
    <section id="tiers" className="pt-12 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">

        {/* Two Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          
          {/* Flow Card */}
          <div className="p-8 rounded-xl bg-sidebar border border-sidebar-border">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-6">Flow</p>
            
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-3xl font-semibold tracking-tight text-foreground">AED 7,000</span>
              <span className="text-sm text-muted-foreground">/mo</span>
            </div>
            <p className="text-xs text-muted-foreground/70 mb-6">per showroom</p>
            
            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
              Unlimited listings, bookings, leads, messaging, and analytics.
            </p>

            <Link
              href="/user-dashboard/requests"
              className="block w-full h-10 bg-[#0066FF] text-white text-sm font-medium rounded-lg hover:bg-[#0066FF]/90 transition-colors flex items-center justify-center"
            >
              Start with Flow
            </Link>
          </div>

          {/* Black Card */}
          <div className="p-8 rounded-xl bg-sidebar border border-sidebar-border">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-6">Black</p>
            
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-sm text-muted-foreground">from</span>
              <span className="text-3xl font-semibold tracking-tight text-foreground">AED 21,000</span>
              <span className="text-sm text-muted-foreground">/mo</span>
            </div>
            <p className="text-xs text-muted-foreground/70 mb-6">per showroom</p>
            
            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
              Everything in Flow, plus custom branding, a dedicated showroom page, and white-glove support.
            </p>

            <Link
              href="/user-dashboard/requests"
              className="block w-full h-10 bg-muted border border-border text-foreground text-sm font-medium rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
            >
              Apply for Black
            </Link>
          </div>

        </div>

        {/* Note */}
        <p className="text-center text-xs text-muted-foreground/70 mt-8 max-w-md mx-auto">
          Same features. Same platform. Same rankings. Black is branding—not advantage.
        </p>

      </div>
    </section>
  );
}
