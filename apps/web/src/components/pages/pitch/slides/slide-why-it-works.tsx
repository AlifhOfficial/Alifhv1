/**
 * Slide: Why It Works
 * We don't compete with you.
 */

'use client';

export function SlideWhyItWorks() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Why It Works
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
            We Don't Compete With You.
          </h2>
        </div>

        {/* Points */}
        <div className="space-y-8 max-w-2xl mx-auto">
          <p className="text-xl sm:text-2xl text-center text-muted-foreground">
            We're not a dealership. We don't buy inventory.
          </p>
          <p className="text-xl sm:text-2xl text-center text-muted-foreground">
            We never compete with you for a sale.
          </p>
          <p className="text-xl sm:text-2xl text-center text-muted-foreground">
            We're your <span className="text-foreground font-medium">sales channel</span>—not your competitor.
          </p>
        </div>

      </div>
    </section>
  );
}
