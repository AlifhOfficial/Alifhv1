/**
 * Badges Closing Section - Alifh Badges Page
 * Simple principles
 */

'use client';

export function BadgesClosingSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            How it works
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            Assigned by Team Alifh.
            <br />
            <span className="text-muted-foreground">Not algorithms.</span>
          </h2>
          <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            We look for people who embody our values: transparency, integrity, and genuine care.
          </p>
        </div>

        {/* Simple list */}
        <div className="max-w-md mx-auto space-y-4">
          {[
            'Hand-picked by our team',
            'Cannot be purchased',
            'Based on merit only',
            'Visible on your profile',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-border/40 bg-sidebar">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
