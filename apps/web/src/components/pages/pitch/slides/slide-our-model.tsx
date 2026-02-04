/**
 * Slide: Our Model
 * What we stand for.
 */

'use client';

export function SlideOurModel() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-background py-24">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Our Model
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
            What We Stand For.
          </h2>
        </div>

        {/* Values Grid */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="border border-border rounded-xl p-8">
            <p className="text-foreground font-semibold text-xl mb-3">Zero Commission</p>
            <p className="text-muted-foreground text-lg">We don't take a cut. Ever. Your sale is yours.</p>
          </div>
          <div className="border border-border rounded-xl p-8">
            <p className="text-foreground font-semibold text-xl mb-3">No Pay-to-Win</p>
            <p className="text-muted-foreground text-lg">Quality determines visibility. Not your budget.</p>
          </div>
          <div className="border border-border rounded-xl p-8">
            <p className="text-foreground font-semibold text-xl mb-3">No Competition</p>
            <p className="text-muted-foreground text-lg">We're a platform, not a dealership. We don't compete.</p>
          </div>
          <div className="border border-border rounded-xl p-8">
            <p className="text-foreground font-semibold text-xl mb-3">Full Transparency</p>
            <p className="text-muted-foreground text-lg">One price. No hidden fees. No surprises.</p>
          </div>
        </div>

      </div>
    </section>
  );
}
