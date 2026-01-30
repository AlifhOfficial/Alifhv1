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
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              The problem
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
              The car market in the UAE
              <br />
              <span className="text-muted-foreground">has been broken for a while.</span>
            </h2>
          </div>
          <div className="space-y-4 text-base text-muted-foreground leading-relaxed">
            <p>
              Unverifiable service histories. Arbitrary pricing. That familiar feeling 
              you're about to get played.
            </p>
            <p>
              Dealers paying per listing. Buyers unsure who to trust. A system built 
              to extract—not to serve.
            </p>
          </div>
        </div>

        {/* Image */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[3/1] overflow-hidden rounded-lg mb-20">
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
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              The answer
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
              We're not reinventing the wheel.
              <br />
              <span className="text-muted-foreground">Just doing what should've been done.</span>
            </h2>
          </div>
          <div className="space-y-4 text-base text-muted-foreground leading-relaxed">
            <p>
              Transparency by default. Systems that protect. Information that's actually 
              useful.
            </p>
            <p>
              No jargon. No urgency tactics. Just people who love cars, building 
              what should already exist.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
