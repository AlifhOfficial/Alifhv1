/**
 * Partner Value Section - Alifh Partners Page
 * Why partners should choose Alifh over typical marketplaces
 */

import Image from 'next/image';

export function PartnerValueSection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-[1400px] mx-auto">

        {/* Header - Left Aligned */}
        <div className="mb-16">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
            For partners
          </p>
          <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight mb-4">
            Your success.
            <br />
            <span className="text-muted-foreground/70">Our only metric.</span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl">
            No commissions. No competition. Just tools that help you sell more cars.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="mb-20">
          <div className="border border-border/40 rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-3 bg-muted/30">
              <div className="p-4 border-r border-border/40">
                <p className="text-sm font-medium text-muted-foreground">What Matters</p>
              </div>
              <div className="p-4 border-r border-border/40 text-center">
                <p className="text-sm font-medium text-muted-foreground">Typical Platforms</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-sm font-medium text-foreground">Alifh</p>
              </div>
            </div>
            
            {/* Table Rows */}
            {[
              { feature: 'Commission', others: 'Per sale cuts', alifh: 'Zero. You keep 100%.' },
              { feature: 'Listing fees', others: 'Pay per car, per month', alifh: 'Flat monthly subscription' },
              { feature: 'Visibility', others: 'Pay to be seen', alifh: 'Quality earns placement' },
              { feature: 'Competing with platform', others: 'They sell cars too', alifh: 'We never sell cars. Ever.' },
              { feature: 'Token/credit systems', others: 'Complex credit games', alifh: 'No tokens. No games.' },
              { feature: 'Lead quality', others: 'Random inquiries', alifh: 'Pre-qualified, filtered leads' },
              { feature: 'Your showroom', others: 'Generic profile', alifh: 'Full branded showroom page' },
              { feature: 'Integration fees', others: 'Pay for each feature', alifh: 'Everything included' },
              { feature: 'Test drive booking', others: 'Not available', alifh: 'Built-in scheduler' },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-3 border-t border-border/40">
                <div className="p-4 border-r border-border/40">
                  <p className="text-sm text-foreground">{row.feature}</p>
                </div>
                <div className="p-4 border-r border-border/40 text-center">
                  <p className="text-sm text-muted-foreground">{row.others}</p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-sm text-foreground">{row.alifh}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What You Get Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
              Your toolkit
            </p>
            <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
              Everything included.
              <br />
              <span className="text-muted-foreground/70">No add-ons.</span>
            </h2>
          </div>
          
          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Your Branded Showroom',
                desc: 'A dedicated page for your dealership. Banner, story, specializations—express yourself. No paragraph in a description box.',
              },
              {
                title: 'Quality Lead Flow',
                desc: 'Set your filters. When a matching listing goes live and the seller is open to offers, it shows up in your dashboard. No cold calling.',
              },
              {
                title: 'Test Drive Scheduler',
                desc: 'Set your available slots once. Every car gets the same calendar. Buyers book directly. No more phone tag at 11 PM.',
              },
              {
                title: 'Staff Management',
                desc: 'Add your salespeople. Assign cars to each. They see their inventory, their bookings, their leads. You see everything.',
              },
              {
                title: 'Analytics Dashboard',
                desc: 'Inventory value. Views. Favorites. Superlikes. Which cars are hot, which need repricing. Numbers that actually help.',
              },
            ].map((item, i) => (
              <div key={i} className="p-6 border border-border/40 rounded-lg">
                <p className="text-sm font-medium text-foreground mb-2">{item.title}</p>
                <p className="text-sm text-muted-foreground/70 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Philosophy Section */}
        <div className="mb-20">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
            Our approach
          </p>
          <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight mb-4">
            Serve, don't extract.
            <br />
            <span className="text-muted-foreground/70">That's the model.</span>
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xl">
            You're the expert at selling cars. We're here to make everything else easier.
          </p>
          
          <div className="space-y-3 max-w-xl">
              {[
                { label: 'No commission', desc: 'Your margin is yours.' },
                { label: 'No token games', desc: 'Pay once. Use everything.' },
                { label: 'No competing', desc: 'We don\'t sell cars. Period.' },
                { label: 'No ads on listings', desc: 'Clean. Professional.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border border-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

      </div>
    </section>
  );
}
