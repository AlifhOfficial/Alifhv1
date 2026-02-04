/**
 * Slide: Pricing
 * Simple, predictable.
 */

'use client';

export function SlidePricing() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-sidebar">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Pricing
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
            Simple. Predictable.
          </h2>
        </div>

        {/* Price */}
        <div className="text-center mb-16">
          <span className="text-6xl sm:text-7xl lg:text-8xl font-bold text-foreground">AED 7,000</span>
          <span className="text-xl sm:text-2xl text-muted-foreground">/month</span>
        </div>

        {/* Zero fees */}
        <div className="flex flex-wrap justify-center gap-12 sm:gap-16">
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-primary mb-2">AED 0</p>
            <p className="text-sm sm:text-base text-muted-foreground">per listing</p>
          </div>
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-primary mb-2">AED 0</p>
            <p className="text-sm sm:text-base text-muted-foreground">per sale</p>
          </div>
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-primary mb-2">AED 0</p>
            <p className="text-sm sm:text-base text-muted-foreground">hidden fees</p>
          </div>
        </div>

      </div>
    </section>
  );
}
