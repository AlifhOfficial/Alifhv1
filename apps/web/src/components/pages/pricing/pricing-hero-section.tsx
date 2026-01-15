/**
 * Pricing Hero Section
 * Simple. Transparent. No games.
 */

'use client';

import Image from 'next/image';

export function PricingHeroSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Simple centered hero */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
            Pricing
          </p>
          <h1 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight mb-4">
            Simple. Transparent.
            <br />
            <span className="text-muted-foreground/70">No games.</span>
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Two options. Same platform. Same features. Different levels of attention.
          </p>
        </div>

        {/* Hero Image */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[2.4/1] overflow-hidden rounded-lg mb-12">
          <Image
            src="/Abstract/rs4.png"
            alt="Alifh Pricing"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1400px) 100vw, 1400px"
          />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="p-6 rounded-lg bg-[#0066FF] text-white text-center">
            <div className="text-2xl font-semibold tracking-tight mb-1">0%</div>
            <div className="text-xs text-white/70">Commission</div>
          </div>
          <div className="p-6 rounded-lg border border-border/40 bg-background text-center">
            <div className="text-2xl font-semibold tracking-tight text-foreground mb-1">∞</div>
            <div className="text-xs text-muted-foreground">Listings per showroom</div>
          </div>
          <div className="p-6 rounded-lg border border-border/40 bg-background text-center">
            <div className="text-2xl font-semibold tracking-tight text-foreground mb-1">0</div>
            <div className="text-xs text-muted-foreground">Hidden fees</div>
          </div>
        </div>

      </div>
    </section>
  );
}
