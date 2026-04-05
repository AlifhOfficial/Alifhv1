/**
 * Badges List Section - Revvup Badges Page
 * Clean card layout - matching legal page patterns
 */

export function BadgesListSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <p className="text-caption1 uppercase tracking-widest text-muted-foreground/70 mb-3">
            Recognition
          </p>
          <h2 className="text-title3 font-semibold text-foreground tracking-tight">
            We see you. We recognize you.
          </h2>
        </div>

        {/* User Badges */}
        <section className="mb-10">
          <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
            01. User Badges
          </h3>
          <div className="rounded-xl border border-border/40 bg-sidebar p-5">
            <div className="space-y-3">
              <BadgeItem name="Revvup First" desc="Early believers who trusted us from day one" />
              <BadgeItem name="Ambassador" desc="Official representatives of Revvup" />
              <BadgeItem name="Community" desc="Exclusive community members" />
              <BadgeItem name="Founding Member" desc="Part of our origin story" />
              <BadgeItem name="Hero" desc="Going above and beyond for others" last />
            </div>
          </div>
        </section>

        {/* Dealer Badges */}
        <section>
          <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
            02. Dealer Badges
          </h3>
          <div className="rounded-xl border border-border/40 bg-sidebar p-5">
            <div className="space-y-3">
              <BadgeItem name="Revvup Choice" desc="Hand-picked by Team Revvup" />
              <BadgeItem name="Luxury" desc="Premium vehicle specialists" />
              <BadgeItem name="Trusted" desc="Verified and reliable dealers" />
              <BadgeItem name="Top Performer" desc="Best in class, quarterly" />
              <BadgeItem name="Founding Partner" desc="With us from day one" last />
            </div>
          </div>
        </section>

      </div>
    </section>
  );
}

function BadgeItem({ name, desc, last }: { name: string; desc: string; last?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-4 ${!last ? 'pb-3 border-b border-border/20' : ''}`}>
      <span className="text-subhead font-medium text-foreground">{name}</span>
      <span className="text-subhead text-muted-foreground text-right">{desc}</span>
    </div>
  );
}
