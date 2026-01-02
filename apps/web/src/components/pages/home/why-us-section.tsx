/**
 * Why Us Section - Alifh Home Page
 * Bold, unapologetic value proposition
 */

import Image from 'next/image';

export function WhyUsSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">

        {/* Header - Left Aligned */}
        <div className="mb-16">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
            How we're different
          </p>
          <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight mb-4">
            Built for clarity.
            <br />
            <span className="text-muted-foreground/70">Not complexity.</span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl">
            We stripped away everything that makes buying cars confusing.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="mb-20">
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
        <div className="mb-20">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
              Simple process
            </p>
            <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
              Three steps.
              <br />
              <span className="text-muted-foreground/70">That's it.</span>
            </h2>
          </div>
          
          <div className="max-w-2xl mx-auto space-y-6">
            {[
              { step: '01', title: 'Every car has a VIN', desc: 'Full history before you visit. No surprises.' },
              { step: '02', title: 'Book test drives online', desc: '3 AM? No problem. Pick a slot, show up.' },
              { step: '03', title: 'Honest listings only', desc: 'Scratches? Disclosed. History? Shown.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-full border border-border/60 flex items-center justify-center flex-shrink-0 bg-background">
                  <span className="text-xs font-medium text-muted-foreground">{item.step}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">{item.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
