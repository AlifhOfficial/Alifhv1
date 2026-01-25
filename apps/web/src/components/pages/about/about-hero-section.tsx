/**
 * About Hero Section
 * Philosophical. Mystique. Clean.
 */

'use client';

import Image from 'next/image';

export function AboutHeroSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Simple centered opening */}
        <div className="max-w-2xl mx-auto text-center mb-12 space-y-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0066FF]">
            About
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground tracking-tight leading-[1.15]">
            We got tired of complaining.
            <br />
            <span className="text-muted-foreground/60">So we built something.</span>
          </h1>
          <p className="text-[15px] text-muted-foreground leading-relaxed max-w-md mx-auto">
            The clean, honest automotive ecosystem the UAE should have had years ago.
          </p>
        </div>

        {/* Hero Image */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[2.4/1] overflow-hidden rounded-lg">
          <Image
            src="/Abstract/rsxx7.png"
            alt="Alifh"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1400px) 100vw, 1400px"
          />
        </div>

      </div>
    </section>
  );
}
