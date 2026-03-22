/**
 * Pricing Compare Section
 * Revvup vs typical marketplaces - subtle, not loud
 */

import { CheckCircle2 } from 'lucide-react';

export function PricingCompareSection() {
  return (
    <section className="pt-16 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">

        {/* Simple inline comparison */}
        <div className="max-w-2xl mx-auto">
          
          <span className="text-sm font-semibold uppercase tracking-wider text-primary text-center mb-8 block">
            What's different
          </span>

          <div className="space-y-4">
            {[
              { label: 'Commission', others: '3-5% per sale', alifh: '0%' },
              { label: 'Listings', others: 'Per-listing fees', alifh: 'Unlimited' },
              { label: 'Visibility', others: 'Pay to boost', alifh: 'Quality-based' },
              { label: 'Features', others: 'Upsells & add-ons', alifh: 'All included' },
              { label: 'Contracts', others: 'Lock-ins', alifh: 'Month-to-month' },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-[1fr,1fr,1fr] gap-4 items-center py-3 border-b border-border/30 last:border-0">
                <span className="text-sm text-muted-foreground">{row.label}</span>
                <span className="text-sm text-muted-foreground/60 line-through">{row.others}</span>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-medium">{row.alifh}</span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
