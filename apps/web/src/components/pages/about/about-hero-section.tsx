/**
 * About Hero Section
 * Company origin. Clean and direct.
 */

'use client';

import Image from 'next/image';

export function AboutHeroSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            About Revvup
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            We are not for sale.
          </h1>
          <p className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            No investors. No board meetings. No exit strategy. 
            Just a founder who got tired of complaining and decided to build.
          </p>
        </div>

        {/* Hero Image */}
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-lg mb-8">
          <Image
            src="/Abstract/pic4.png"
            alt="Revvup"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1400px) 100vw, 1400px"
          />
        </div>

        {/* Company Facts */}
        <div className="flex items-center justify-center gap-12 md:gap-20 pt-8 border-t border-border/40">
          <div className="text-center space-y-1">
            <p className="text-xl font-semibold tracking-tight text-primary">Dubai</p>
            <span className="text-sm text-muted-foreground">Built here</span>
          </div>
          <div className="w-px h-10 bg-border/30 hidden sm:block" />
          <div className="text-center space-y-1">
            <p className="text-xl font-semibold tracking-tight text-primary">Self-funded</p>
            <span className="text-sm text-muted-foreground">Zero VCs</span>
          </div>
          <div className="w-px h-10 bg-border/30 hidden sm:block" />
          <div className="text-center space-y-1">
            <p className="text-xl font-semibold tracking-tight text-primary">Long-term</p>
            <span className="text-sm text-muted-foreground">Here to stay</span>
          </div>
        </div>

      </div>
    </section>
  );
}
