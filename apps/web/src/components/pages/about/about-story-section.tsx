/**
 * About Story Section
 * The problem we saw. Why we built this.
 */

'use client';

import Image from 'next/image';

export function AboutStorySection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* The Problem */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-16">
          <div className="space-y-5">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              The Problem
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
              The UAE car market
              <br />
              <span className="text-muted-foreground">needed a reset.</span>
            </h2>
          </div>
          <div className="space-y-4 text-base text-muted-foreground leading-relaxed">
            <p>
              Hidden VINs. Pay-to-rank. Platforms that sell cars and compete with their own users.
            </p>
            <p>
              Private sellers paying AED 1,000 just to list. Dealers buying tokens. 
              A system built to extract—not to serve.
            </p>
          </div>
        </div>

        {/* Image */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[3/1] overflow-hidden rounded-lg mb-16">
          <Image
            src="/Abstract/rsxx8.png"
            alt="Alifh"
            fill
            className="object-cover"
            sizes="(max-width: 1400px) 100vw, 1400px"
          />
        </div>

        {/* What We Did */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div className="space-y-5">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              What We Did
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
              Built it from scratch.
              <br />
              <span className="text-muted-foreground">Every feature. Every line.</span>
            </h2>
          </div>
          <div className="space-y-4 text-base text-muted-foreground leading-relaxed">
            <p>
              No boilerplate. No template stamped with a logo. 
              Designed with care, built with purpose.
            </p>
            <p>
              A small team in Dubai. Car people building for car people. 
              That's it.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
