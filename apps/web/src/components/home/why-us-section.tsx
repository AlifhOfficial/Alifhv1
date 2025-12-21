/**
 * Why Us Section - Alifh Home Page
 * Bold, unapologetic value proposition
 */

export function WhyUsSection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="mb-12">
          <h2 className="text-xl sm:text-2xl font-medium text-foreground mb-2">
            Not your typical marketplace
          </h2>
          <p className="text-sm text-muted-foreground/70">
            And we're not trying to be.
          </p>
        </div>

        {/* Video Section - Full Width, No Overlay */}
        <div className="relative aspect-[16/9] sm:aspect-[2.4/1] rounded-lg overflow-hidden mb-24">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/video/hero1.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Comparison Table */}
        <div className="mb-24">
          <div className="border border-border/40 rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-3 bg-muted/30">
              <div className="p-4 border-r border-border/40">
                <p className="text-sm font-medium text-muted-foreground">Feature</p>
              </div>
              <div className="p-4 border-r border-border/40 text-center">
                <p className="text-sm font-medium text-muted-foreground">Others</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-sm font-medium text-foreground">Alifh</p>
              </div>
            </div>
            
            {/* Table Rows */}
            {[
              { feature: 'Listing fees', others: 'Pay per listing', alifh: 'Free forever' },
              { feature: 'Premium spots', others: 'Pay to be seen', alifh: 'Quality earns visibility' },
              { feature: 'Ads', others: 'Everywhere', alifh: 'Zero. None. Ever.' },
              { feature: 'VIN history', others: 'Optional or hidden', alifh: 'Required on every car' },
              { feature: 'Test drives', others: 'Call and negotiate', alifh: 'Book online instantly' },
              { feature: 'Hidden fees', others: 'Surprise charges', alifh: 'What you see is what you get' },
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

        {/* Flow: Our Standards */}
        <div className="mb-24">
          {/* Video above How it works */}
          <div className="relative aspect-[16/9] sm:aspect-[2.4/1] rounded-lg overflow-hidden mb-12">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/video/hero4.mp4" type="video/mp4" />
            </video>
          </div>

          <h2 className="text-xl sm:text-2xl font-medium text-foreground mb-12 text-center">
            How it works
          </h2>
          
          {/* Horizontal Flow */}
          <div className="hidden md:flex items-start justify-between gap-4">
            {[
              { step: '01', title: 'Every car has a VIN', desc: 'Full history before you visit. No surprises.' },
              { step: '02', title: 'Book test drives online', desc: '3 AM? No problem. Pick a slot, show up.' },
              { step: '03', title: 'Honest listings only', desc: 'Scratches? Disclosed. History? Shown.' },
            ].map((item, i) => (
              <div key={i} className="flex-1 relative">
                {/* Connector Line */}
                {i < 2 && (
                  <div className="absolute top-8 left-[60%] w-[80%] h-px bg-border/60" />
                )}
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-full border border-border/60 flex items-center justify-center mb-4 bg-background">
                    <span className="text-sm font-medium text-muted-foreground">{item.step}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground mb-2">{item.title}</p>
                  <p className="text-sm text-muted-foreground/70 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Mobile: Vertical Flow */}
          <div className="md:hidden space-y-8">
            {[
              { step: '01', title: 'Every car has a VIN', desc: 'Full history before you visit. No surprises.' },
              { step: '02', title: 'Book test drives online', desc: '3 AM? No problem. Pick a slot, show up.' },
              { step: '03', title: 'Honest listings only', desc: 'Scratches? Disclosed. History? Shown.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border border-border/60 flex items-center justify-center bg-background">
                    <span className="text-xs font-medium text-muted-foreground">{item.step}</span>
                  </div>
                  {i < 2 && <div className="w-px h-full bg-border/40 mt-2" />}
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-sm font-medium text-foreground mb-1">{item.title}</p>
                  <p className="text-sm text-muted-foreground/70 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left - Statement */}
          <div>
            <h2 className="text-xl sm:text-2xl font-medium text-foreground mb-4">
              Modern stack.<br />No compromises.
            </h2>
            <p className="text-sm text-muted-foreground/70 leading-relaxed mb-6">
              We use the best tools because you deserve the best experience. 
              Fastest load times. Strongest security. No legacy garbage slowing things down.
            </p>
            <p className="text-sm text-muted-foreground/70 leading-relaxed">
              We built Alifh because we were tired of the same broken experience. 
              We're not here to be another option. We're here to be the right one.
            </p>
          </div>

          {/* Right - Tech Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-6 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Runtime</p>
              <p className="text-lg font-medium text-foreground">Bun</p>
            </div>
            <div className="p-6 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Framework</p>
              <p className="text-lg font-medium text-foreground">Next.js</p>
            </div>
            <div className="p-6 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Database</p>
              <p className="text-lg font-medium text-foreground">PostgreSQL</p>
            </div>
            <div className="p-6 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Auth</p>
              <p className="text-lg font-medium text-foreground">Better Auth</p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
