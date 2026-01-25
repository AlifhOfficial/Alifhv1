/**
 * About Story Section
 * The why. Honest. Direct.
 */

'use client';

import Image from 'next/image';

export function AboutStorySection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* The Problem */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-20">
          <div className="space-y-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0066FF]">
              The problem
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground tracking-tight leading-[1.15]">
              The car market in the UAE
              <br />
              <span className="text-muted-foreground/60">has been broken for a while.</span>
            </h2>
          </div>
          <div className="space-y-4 text-[15px] text-muted-foreground leading-relaxed">
            <p>
              Listings with "full service history" that can't be verified. Prices that make 
              zero sense. That sinking feeling you're about to get played.
            </p>
            <p>
              Dealers stuck paying per listing. Buyers stuck wondering who pays first. 
              Everyone stuck in a system designed to extract, not to serve.
            </p>
          </div>
        </div>

        {/* Image */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[3/1] overflow-hidden rounded-lg mb-20">
          <Image
            src="/Abstract/rsxx8.png"
            alt="Alifh"
            fill
            className="object-cover"
            sizes="(max-width: 1400px) 100vw, 1400px"
          />
        </div>

        {/* The Answer */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div className="space-y-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0066FF]">
              The answer
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground tracking-tight leading-[1.15]">
              We're not reinventing the wheel.
              <br />
              <span className="text-muted-foreground/60">Just doing what should've been done.</span>
            </h2>
          </div>
          <div className="space-y-4 text-[15px] text-muted-foreground leading-relaxed">
            <p>
              Treating people like adults. Being straight about what we know and what we don't. 
              Building systems that actually protect instead of leaving people exposed.
            </p>
            <p>
              No corporate jargon. No fake urgency. Just real people who love cars, 
              building something real.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
