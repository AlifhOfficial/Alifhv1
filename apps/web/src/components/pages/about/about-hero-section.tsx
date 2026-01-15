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
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
            About
          </p>
          <h1 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight mb-4">
            We got tired of complaining.
            <br />
            <span className="text-muted-foreground/70">So we built something.</span>
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
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
