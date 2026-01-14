/**
 * Pricing Closing Section
 * Final CTA - clear recommendation
 */

'use client';

import Link from 'next/link';

export function PricingClosingSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Final CTA */}
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Ready?
          </p>
          <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
            Most dealers should start with Flow.
            <br />
            <span className="text-muted-foreground/70">We'll tell you honestly if you need more.</span>
          </h2>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/become-partner?plan=flow"
              className="w-full sm:w-auto h-11 px-8 bg-[#0066FF] text-white text-sm font-medium rounded-lg hover:bg-[#0066FF]/90 transition-colors flex items-center justify-center shadow-sm"
            >
              Apply for Flow — AED 7K/mo
            </Link>
            <Link
              href="/become-partner?plan=black"
              className="w-full sm:w-auto h-11 px-8 bg-muted border border-border/40 text-foreground text-sm font-medium rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
            >
              Apply for Black — starts at AED 21K/mo
            </Link>
          </div>
          
          <div className="pt-2">
            <Link
              href="/contact"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Not sure which? Talk to us →
            </Link>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="flex items-center justify-center gap-12 md:gap-20 pt-16 mt-16 border-t border-border/40">
          <div className="text-center space-y-1">
            <div className="text-2xl font-semibold tracking-tight text-[#0066FF]">0%</div>
            <div className="text-xs text-muted-foreground">Commission</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-semibold tracking-tight text-[#0066FF]">∞</div>
            <div className="text-xs text-muted-foreground">Listings</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-semibold tracking-tight text-[#0066FF]">0</div>
            <div className="text-xs text-muted-foreground">Lock-ins</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-semibold tracking-tight text-[#0066FF]">0</div>
            <div className="text-xs text-muted-foreground">Games</div>
          </div>
        </div>

        {/* Cross-link */}
        <div className="text-center mt-12">
          <Link
            href="/partner"
            className="text-sm text-muted-foreground hover:text-[#0066FF] transition-colors"
          >
            Learn more about partnering with Alifh →
          </Link>
        </div>

      </div>
    </section>
  );
}
