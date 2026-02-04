/**
 * Slide: The Solution
 * Zero commission. Flat fee. Unlimited listings.
 */

'use client';

export function SlideTheSolution() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-sidebar">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            The Solution
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
            Keep 100% of Every Sale.
          </h2>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            Zero commission. Flat monthly fee. Unlimited listings.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 sm:gap-16 max-w-3xl mx-auto">
          <div className="text-center">
            <p className="text-5xl sm:text-6xl lg:text-7xl font-bold text-primary mb-4">0%</p>
            <p className="text-sm sm:text-base text-muted-foreground">commission</p>
          </div>
          <div className="text-center">
            <p className="text-5xl sm:text-6xl lg:text-7xl font-bold text-primary mb-4">∞</p>
            <p className="text-sm sm:text-base text-muted-foreground">listings</p>
          </div>
          <div className="text-center">
            <p className="text-5xl sm:text-6xl lg:text-7xl font-bold text-primary mb-4">1</p>
            <p className="text-sm sm:text-base text-muted-foreground">flat fee</p>
          </div>
        </div>

      </div>
    </section>
  );
}
