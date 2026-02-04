/**
 * Slide: The Problem
 * Why the marketplace game is broken.
 */

'use client';

export function SlideTheProblem() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            The Problem
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
            The Marketplace Game Is Rigged.
          </h2>
        </div>

        {/* Pain Points */}
        <div className="space-y-8 max-w-2xl mx-auto">
          <p className="text-xl sm:text-2xl text-center text-muted-foreground">
            You list a car. <span className="text-foreground font-medium">You pay per listing.</span>
          </p>
          <p className="text-xl sm:text-2xl text-center text-muted-foreground">
            It sells. <span className="text-foreground font-medium">They take 3-5%.</span>
          </p>
          <p className="text-xl sm:text-2xl text-center text-muted-foreground">
            Want visibility? <span className="text-foreground font-medium">Pay to boost.</span>
          </p>
          <p className="text-xl sm:text-2xl text-center text-muted-foreground">
            And they sell cars too. <span className="text-foreground font-medium">Against you.</span>
          </p>
        </div>

      </div>
    </section>
  );
}
