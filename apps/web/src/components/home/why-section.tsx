/**
 * Why Section - Alifh Home Page
 * Clean comparison - cards on mobile, table on desktop
 */

export function WhySection() {
  const comparisons = [
    { feature: "Listing visibility", others: "Pay more = seen more", alifh: "Equal for everyone" },
    { feature: "VIN history", others: "Optional, often hidden", alifh: "Required on every car" },
    { feature: "Dealer profiles", others: "Name + phone number", alifh: "Full showroom, reviews, inventory" },
    { feature: "Test drive booking", others: "Call and hope", alifh: "Book online, pick a slot" },
    { feature: "Contact seller", others: "Phone tag, WhatsApp chaos", alifh: "In-app messaging" },
    { feature: "Show serious interest", others: "—", alifh: "Superlike alerts the seller" },
    { feature: "Save favorites", others: "Scattered across apps", alifh: "One place, synced" },
    { feature: "Pricing clarity", others: "Guess if it's fair", alifh: "AI market estimates" },
    { feature: "Ads", others: "Everywhere", alifh: "None" },
    { feature: "Listing fees", others: "Pay per listing", alifh: "Free, always" },
  ];

  return (
    <section className="py-32 px-6">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-medium text-foreground tracking-tight mb-3">
            What's different here
          </h2>
          <p className="text-sm md:text-base text-muted-foreground/80 font-light">
            Not better marketing. Actually different.
          </p>
        </div>

        {/* Mobile: Cards */}
        <div className="md:hidden space-y-3">
          {comparisons.map((item, index) => (
            <div key={index} className="border border-border/40 rounded-lg px-4 py-3">
              <p className="text-sm text-foreground mb-2.5">{item.feature}</p>
              <div className="space-y-1.5">
                <div className="flex items-start gap-3">
                  <span className="text-xs text-muted-foreground/60 w-14 shrink-0">Others</span>
                  <span className="text-xs text-muted-foreground">{item.others}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xs text-blue-600 w-14 shrink-0">Alifh</span>
                  <span className="text-xs text-foreground">{item.alifh}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Table */}
        <div className="hidden md:block border border-border/40 rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_200px_200px] bg-muted/30 border-b border-border/40">
            <div className="px-5 py-3">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Feature</span>
            </div>
            <div className="px-5 py-3 text-center border-l border-border/40">
              <span className="text-xs text-muted-foreground">Other platforms</span>
            </div>
            <div className="px-5 py-3 text-center border-l border-border/40">
              <span className="text-xs text-blue-600">On Alifh</span>
            </div>
          </div>

          {/* Table Rows */}
          {comparisons.map((item, index) => (
            <div 
              key={index} 
              className={`grid grid-cols-[1fr_200px_200px] ${index < comparisons.length - 1 ? 'border-b border-border/40' : ''}`}
            >
              <div className="px-5 py-3">
                <span className="text-sm text-foreground">{item.feature}</span>
              </div>
              <div className="px-5 py-3 border-l border-border/40">
                <span className="text-xs text-muted-foreground">{item.others}</span>
              </div>
              <div className="px-5 py-3 border-l border-border/40">
                <span className="text-xs text-foreground">{item.alifh}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground/70 mt-12 text-center">
          We're a V1 — more coming. But we'd rather ship less and do it right.
        </p>

      </div>
    </section>
  );
}
