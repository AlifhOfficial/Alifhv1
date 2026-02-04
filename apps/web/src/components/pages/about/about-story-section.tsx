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
        
        {/* The Problem - Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            The Problem
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            The UAE car market
            <br />
            <span className="text-muted-foreground">needed a reset.</span>
          </h2>
        </div>

        {/* Image */}
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-lg mb-8">
          <Image
            src="/Abstract/pic3.png"
            alt="The problem we saw"
            fill
            className="object-cover"
            sizes="(max-width: 1400px) 100vw, 1400px"
          />
        </div>

        {/* Description below image - Small paragraphs */}
        <div className="max-w-3xl mx-auto text-center mb-20 space-y-6">
          <p className="text-sm sm:text-base font-medium text-muted-foreground leading-relaxed">
            In the UAE, listing a car costs AED 500-1,000. Want visibility? Pay more. Need placement? Pay again. Platforms compete with their own dealers, hide VINs, and run pay-to-rank schemes designed to extract money, not serve people. The market didn't need another player. It needed a reset.
          </p>
        </div>

        {/* What We Did */}
        <div className="max-w-3xl mx-auto text-center">
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
        </div>

        {/* Image for What We Did */}
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-lg my-8">
          <Image
            src="/Abstract/pic2.png"
            alt="Built from scratch"
            fill
            className="object-cover"
            sizes="(max-width: 1400px) 100vw, 1400px"
          />
        </div>

        <div className="max-w-3xl mx-auto text-center space-y-6">
          <p className="text-sm sm:text-base font-medium text-muted-foreground leading-relaxed">
            We're a small team in Dubai. Car people who know the market. Developers who care about craft. We built it from scratch because shortcuts become problems later. Every feature exists for a reason. Every line of code serves a purpose. No templates, no borrowed frameworks, no fluff. Just honest work.
          </p>
        </div>

      </div>
    </section>
  );
}
