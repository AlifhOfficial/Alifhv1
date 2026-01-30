/**
 * About Principles Section
 * What we stand for. Non-negotiables.
 */

'use client';

export function AboutPrinciplesSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            How we work
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            Non-negotiables.
          </h2>
        </div>

        {/* Core Values */}
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mb-16">
          <div className="p-6 sm:p-8 rounded-lg bg-primary text-primary-foreground text-center">
            <h3 className="text-sm sm:text-base font-semibold mb-2">No commission</h3>
            <p className="text-xs sm:text-sm text-white/70">Your margins stay yours.</p>
          </div>
          <div className="p-6 sm:p-8 rounded-lg border border-border/40 bg-sidebar text-center">
            <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2">No inventory</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">We don't compete with you.</p>
          </div>
          <div className="p-6 sm:p-8 rounded-lg border border-border/40 bg-sidebar text-center">
            <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2">No games</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">What you see is what you get.</p>
          </div>
        </div>

        {/* Principles */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 max-w-3xl mx-auto">
          {[
            'Transparency by default',
            'Quality over quantity',
            'Long-term thinking',
            'Enthusiasts first',
            'Less is more',
          ].map((item, i) => (
            <div key={i} className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-border/40 bg-sidebar">
              <span className="text-xs sm:text-sm text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
