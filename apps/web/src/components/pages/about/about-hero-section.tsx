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
        <div className="max-w-2xl mx-auto text-center mb-16 space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            About
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            We got tired of complaining.
            <br />
            <span className="text-muted-foreground">So we built something.</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            The automotive platform the UAE deserved from the start.
          </p>
        </div>

        {/* Hero Image */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[2.4/1] overflow-hidden rounded-lg">
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
