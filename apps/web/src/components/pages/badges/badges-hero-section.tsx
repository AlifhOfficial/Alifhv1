/**
 * Badges Hero Section - Alifh Badges Page
 * Clean hero - honour and recognition
 */

'use client';

import Image from 'next/image';

export function BadgesHeroSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Brand & Tagline */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Honours & Recognition
          </p>
          <h1 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
            Badges at Alifh.
            <br />
            <span className="text-muted-foreground/70">Earned. Not bought.</span>
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto pt-2">
            Hand-picked by Team Alifh. Recognition for those who embody our values.
          </p>
        </div>

        {/* Hero Image */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[2.4/1] overflow-hidden rounded-lg mb-16">
          <Image
            src="/Abstract/B1.png"
            alt="Alifh Badges"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1400px) 100vw, 1400px"
          />
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-12 md:gap-20 pt-8 border-t border-border/40">
          <div className="text-center space-y-1">
            <div className="text-2xl font-semibold tracking-tight text-[#0066FF]">10</div>
            <div className="text-xs text-muted-foreground">Badge types</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-semibold tracking-tight text-[#0066FF]">0</div>
            <div className="text-xs text-muted-foreground">For sale</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-semibold tracking-tight text-[#0066FF]">1</div>
            <div className="text-xs text-muted-foreground">Team decides</div>
          </div>
        </div>

      </div>
    </section>
  );
}
