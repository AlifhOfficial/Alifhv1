/**
 * Partner Compare Section - Alifh Partners Page
 * Clean side-by-side - visual impact
 */

import { CheckCircle2 } from 'lucide-react';

export function PartnerCompareSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        <div className="text-center mb-16 space-y-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0066FF]">
            Side by side
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground tracking-tight leading-[1.15]">
            Elsewhere vs. Here.
            <br />
            <span className="text-muted-foreground/60">You decide.</span>
          </h2>
        </div>

        {/* Comparison Grid */}
        <div className="grid sm:grid-cols-2 gap-px bg-border/40 rounded-lg overflow-hidden border border-border/40 max-w-4xl mx-auto">
          
          {/* Others */}
          <div className="p-8 bg-sidebar">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60 mb-8">Typical platforms</p>
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
                  <span className="text-[13px] text-muted-foreground">{item.label}</span>
                  <span className="text-[13px] text-foreground/60">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alifh */}
          <div className="p-8 bg-[#0066FF] text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/60 mb-8">Alifh</p>
            <div className="space-y-6">
              {[
                { label: 'Commission', value: 'Zero. Forever.' },
                { label: 'Listings', value: 'Unlimited per showroom' },
                { label: 'Visibility', value: 'Quality-based' },
                { label: 'Features', value: 'All included' },
                { label: 'Our inventory', value: 'We don\'t sell cars' },
                { label: 'Your profile', value: 'Full brand page' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-[13px] text-white/70">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold">{item.value}</span>
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
