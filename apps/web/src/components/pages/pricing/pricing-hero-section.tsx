/**
 * Pricing Hero Section
 * Simple. Transparent. No games.
 */

'use client';

import { MarketingImage as Image } from '@/components/pages/marketing-image';
import { rsxx5 } from '@/components/pages/marketing-image-assets';

export function PricingHeroSection() {
  return (
    <section className="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Simple centered hero */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary mb-4 block">
            Pricing
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight mb-4">
            Simple. Transparent.
            <br />
            <span className="text-muted-foreground">No games.</span>
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Two options. Same platform. Same core features. Different levels of attention and presence.
          </p>
        </div>

        {/* Hero Image */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[2.4/1] overflow-hidden rounded-lg mb-12">
          <Image
            src={rsxx5}
            alt="Revvup Pricing"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1400px) 100vw, 1400px"
          />
        </div>

        {/* Stats row - floating style */}
        <div className="flex items-center justify-center gap-8 sm:gap-12 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-2xl font-semibold tracking-tight text-primary mb-1">0%</div>
            <div className="text-sm text-muted-foreground">Commission</div>
          </div>
          <div className="w-px h-10 bg-border/30" />
          <div className="text-center">
            <div className="text-2xl font-semibold tracking-tight mb-1">∞</div>
            <div className="text-sm text-muted-foreground">Listings per showroom</div>
          </div>
          <div className="w-px h-10 bg-border/30" />
          <div className="text-center">
            <div className="text-2xl font-semibold tracking-tight mb-1">0</div>
            <div className="text-sm text-muted-foreground">Hidden fees</div>
          </div>
        </div>

      </div>
    </section>
  );
}
