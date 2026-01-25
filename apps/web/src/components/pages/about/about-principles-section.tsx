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
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0066FF]">
            Principles
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground tracking-tight leading-[1.15]">
            The things we won't compromise on.
          </h2>
        </div>

        {/* Core Values */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          <div className="p-8 rounded-lg bg-[#0066FF] text-white text-center">
            <h3 className="text-lg font-semibold mb-2">Trust</h3>
            <p className="text-[13px] text-white/70">Earned, not claimed.</p>
          </div>
          <div className="p-8 rounded-lg border border-border/40 bg-sidebar text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">Clarity</h3>
            <p className="text-[13px] text-muted-foreground">No fine print. No surprises.</p>
          </div>
          <div className="p-8 rounded-lg border border-border/40 bg-sidebar text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">Community</h3>
            <p className="text-[13px] text-muted-foreground">Built by enthusiasts, for enthusiasts.</p>
          </div>
        </div>

        {/* Principles */}
        <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
          {[
            'Clarity over noise',
            'Honesty over pressure',
            'People over profits',
            'Long-term over short-term',
            'Less is more',
          ].map((item, i) => (
            <div key={i} className="px-4 py-2 rounded-full border border-border/40 bg-sidebar">
              <span className="text-[13px] text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
