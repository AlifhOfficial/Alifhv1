/**
 * About Hero Section
 * Clean intro matching vision page style
 */

'use client';

import { MarketingImage as Image } from '@/components/pages/marketing-image';
import { revx } from '@/components/pages/marketing-image-assets';

export function AboutHeroSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            About Revvup
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            A Better Way to Buy & Sell Cars.
            <br />
            <span className="text-muted-foreground">In the UAE.</span>
          </h1>
        </div>

        {/* Hero Image */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-sidebar border border-border/40 mb-12">
          <Image
            src={revx}
            alt="Revvup - UAE Car Marketplace"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1600px) 100vw, 1600px"
          />
        </div>

        {/* Description */}
        <p className="text-base text-muted-foreground max-w-lg mx-auto text-center mb-12 leading-relaxed">
          No listing fees. No pay-to-rank schemes. No hidden agendas. 
          Just a clean platform for people who want to buy or sell cars without the games.
        </p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-12 md:gap-20 pt-8 border-t border-border/40">
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold tracking-tight text-primary">Dubai</div>
            <div className="text-sm text-muted-foreground">Built here</div>
          </div>
          <div className="w-px h-10 bg-border/30 hidden sm:block" />
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold tracking-tight text-primary">100%</div>
            <div className="text-sm text-muted-foreground">Independent</div>
          </div>
          <div className="w-px h-10 bg-border/30 hidden sm:block" />
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold tracking-tight text-primary">0</div>
            <div className="text-sm text-muted-foreground">Listing fees</div>
          </div>
        </div>

      </div>
    </section>
  );
}
