/**
 * About Principles Section
 * Company values. Non-negotiables.
 */

'use client';

import Image from 'next/image';

export function AboutPrinciplesSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            What We Believe
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            Non-negotiables.
          </h2>
          <p className="text-sm sm:text-base font-medium text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            These aren't marketing slogans. They're the rules we won't break, even when it's hard.
          </p>
        </div>

        {/* Image for What We Believe */}
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-lg mb-12">
          <Image
            src="/Abstract/pic5.png"
            alt="Our principles"
            fill
            className="object-cover"
            sizes="(max-width: 1400px) 100vw, 1400px"
          />
        </div>

        {/* Values Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="p-6 rounded-xl bg-primary text-primary-foreground">
            <h3 className="text-base font-semibold mb-2">User first</h3>
            <p className="text-sm text-white/70">Every decision starts with: does this help them?</p>
          </div>
          <div className="p-6 rounded-xl border border-border/40 bg-sidebar">
            <h3 className="text-base font-semibold text-foreground mb-2">No ads. Ever.</h3>
            <p className="text-sm text-muted-foreground">Not now, not later. Not even if it means staying small.</p>
          </div>
          <div className="p-6 rounded-xl border border-border/40 bg-sidebar">
            <h3 className="text-base font-semibold text-foreground mb-2">Quality over quantity</h3>
            <p className="text-sm text-muted-foreground">We don't need every listing. Just the real ones.</p>
          </div>
          <div className="p-6 rounded-xl border border-border/40 bg-sidebar">
            <h3 className="text-base font-semibold text-foreground mb-2">Long-term thinking</h3>
            <p className="text-sm text-muted-foreground">Trust isn't built overnight. We're in no rush.</p>
          </div>
        </div>

        {/* Philosophy Tags */}
        <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto mt-12">
          {[
            'Less is more',
            'Honest first',
            'Trust is everything',
            'Clarity over noise',
            'Actions, not promises',
          ].map((item, i) => (
            <div key={i} className="px-4 py-2 rounded-full border border-border/40 bg-sidebar">
              <span className="text-sm text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
