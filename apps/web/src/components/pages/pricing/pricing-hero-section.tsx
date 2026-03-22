/**
 * Pricing Hero Section
 * Simple. Transparent. No games.
 */

export function PricingHeroSection() {
  return (
    <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 border-b border-border/20">
      <div className="max-w-[1600px] mx-auto">

        <div className="max-w-3xl mx-auto text-center mb-16 space-y-5">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary block">
            Pricing
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
            Simple. Transparent.
            <br />
            <span className="text-muted-foreground">No games.</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Two options. Same platform. Same core features. Different levels of attention and presence.
          </p>
        </div>

        <div className="flex items-center justify-center gap-12 sm:gap-20">
          <div className="text-center space-y-1.5">
            <div className="text-4xl font-semibold tracking-tight text-primary">0%</div>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Commission</div>
          </div>
          <div className="w-px h-14 bg-border/30" />
          <div className="text-center space-y-1.5">
            <div className="text-4xl font-semibold tracking-tight">∞</div>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Listings</div>
          </div>
          <div className="w-px h-14 bg-border/30" />
          <div className="text-center space-y-1.5">
            <div className="text-4xl font-semibold tracking-tight">0</div>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Hidden fees</div>
          </div>
        </div>

      </div>
    </section>
  );
}
