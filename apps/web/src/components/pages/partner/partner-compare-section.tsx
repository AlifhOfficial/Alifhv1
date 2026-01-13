/**
 * Partner Compare Section - Alifh Partners Page
 * Clean side-by-side - visual impact
 */

import { CheckCircle2 } from 'lucide-react';

export function PartnerCompareSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        <div className="text-center mb-16 space-y-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Side by side
          </p>
          <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
            Elsewhere vs. Here.
            <br />
            <span className="text-muted-foreground/70">You decide.</span>
          </h2>
        </div>

        {/* Comparison Grid */}
        <div className="grid sm:grid-cols-2 gap-px bg-border/40 rounded-lg overflow-hidden border border-border/40 max-w-4xl mx-auto">
          
          {/* Others */}
          <div className="p-8 bg-background">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-8">Typical platforms</p>
            <div className="space-y-6">
              {[
                { label: 'Commission', value: '3-5% per sale' },
                { label: 'Listings', value: 'Pay per car' },
                { label: 'Visibility', value: 'Pay to rank' },
                { label: 'Features', value: 'Upsells everywhere' },
                { label: 'Their inventory', value: 'Compete with you' },
                { label: 'Your profile', value: 'Name + phone' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm text-foreground/60">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alifh */}
          <div className="p-8 bg-[#0066FF] text-white">
            <p className="text-xs uppercase tracking-widest text-white/60 mb-8">Alifh</p>
            <div className="space-y-6">
              {[
                { label: 'Commission', value: 'Zero. Forever.' },
                { label: 'Listings', value: 'Unlimited' },
                { label: 'Visibility', value: 'Quality-based' },
                { label: 'Features', value: 'All included' },
                { label: 'Our inventory', value: 'We don\'t sell cars' },
                { label: 'Your profile', value: 'Full brand page' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-sm text-white/70">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.value}</span>
                    <CheckCircle2 className="w-4 h-4 text-white/60" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
