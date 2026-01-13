/**
 * Partner Closing Section - Alifh Partners Page
 * Strong close - video + CTA with pricing link
 */

'use client';

import Link from 'next/link';

export function PartnerClosingSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Video Showcase */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            See it in action
          </p>
          <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
            Clean. Fast. Simple.
            <br />
            <span className="text-muted-foreground/70">The way it should be.</span>
          </h2>
        </div>

        {/* Video Container */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[2.4/1] overflow-hidden rounded-lg mb-20">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/video/hero1x.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Final CTA Section */}
        <div className="text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
            Ready to stop playing games?
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Two options. Same platform. Same features. Different levels of attention.
            Most dealers start with Flow.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/pricing"
              className="w-full sm:w-auto h-11 px-8 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
            >
              See Pricing
            </Link>
            <Link
              href="/become-partner"
              className="w-full sm:w-auto h-11 px-8 bg-muted text-foreground text-sm font-medium rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
            >
              Apply to Partner
            </Link>
          </div>
          
          <div className="pt-4">
            <Link
              href="/contact"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Have questions? Talk to us →
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
            <div className="text-2xl font-semibold tracking-tight text-[#0066FF]">1</div>
            <div className="text-xs text-muted-foreground">Flat fee</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-semibold tracking-tight text-[#0066FF]">0</div>
            <div className="text-xs text-muted-foreground">Games</div>
          </div>
        </div>

      </div>
    </section>
  );
}
