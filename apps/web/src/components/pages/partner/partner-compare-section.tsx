/**
 * Partner Compare Section - Revvup Partners Page
 * Clean side-by-side with visual infographic
 */

import { MarketingImage as Image } from '@/components/pages/marketing-image';
import { CheckCircle2 } from 'lucide-react';
import { m4, m5 } from '@/components/pages/marketing-image-assets';

export function PartnerCompareSection() {
  return (
    <section className="pt-28 pb-20 px-4 compact:px-6 large:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        <div className="text-center mb-16 space-y-5">
          <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
            Side by side
          </span>
          <h2 className="text-title2 compact:text-title1 large:text-display font-semibold tracking-tight">
            The difference.
          </h2>
        </div>

        {/* Visual Infographic */}
        <div className="mb-12">
          <CompareInfographic />
        </div>

        {/* Comparison Grid */}
        <div className="grid compact:grid-cols-2 gap-px bg-border/40 rounded-lg overflow-hidden border border-border/40 max-w-5xl mx-auto">
          
          {/* Others */}
          <div className="p-8 bg-sidebar">
            <p className="text-subhead font-semibold uppercase tracking-wider text-muted-foreground/60 mb-8">Typical platforms</p>
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
                  <span className="text-subhead text-muted-foreground">{item.label}</span>
                  <span className="text-subhead text-foreground/60">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revvup */}
          <div className="p-8 bg-primary text-primary-foreground">
            <p className="text-subhead font-semibold uppercase tracking-wider text-white/60 mb-8">Revvup</p>
            <div className="space-y-6">
              {[
                { label: 'Commission', value: 'Zero. Forever.' },
                { label: 'Listings', value: 'Unlimited' },
                { label: 'Visibility', value: 'Earned, not paid' },
                { label: 'Features', value: 'All included' },
                { label: 'Our inventory', value: 'None. We don\'t sell.' },
                { label: 'Your profile', value: 'Full brand page' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-subhead text-white/70">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-subhead font-semibold">{item.value}</span>
                    <CheckCircle2 className="w-5 h-5 text-white/60" />
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

// ============================================================================
// INFOGRAPHIC: Visual comparison with animated cursors
// ============================================================================

function CompareInfographic() {
  return (
    <div className="relative w-full aspect-[16/9] compact:aspect-[2.4/1] rounded-lg overflow-hidden bg-sidebar border border-border/40">

      <div className="h-full flex">
        {/* Left - Others */}
        <div className="flex-1 flex flex-col border-r border-border/20">
          <div className="px-6 compact:px-8 large:px-10 pt-6 compact:pt-8 large:pt-10">
            <span className="text-caption1 text-muted-foreground/60">Others</span>
          </div>
          
          <div className="flex-1 flex items-center justify-center px-4 compact:px-8 large:px-12 py-6">
            <div className="relative">
              {/* Car image - faded */}
              <div className="w-32 compact:w-40 large:w-48 aspect-[4/3] rounded-xl overflow-hidden border border-border/30">
                <Image src={m5} alt="" className="w-full h-full object-cover opacity-50 grayscale" sizes="(max-width: 640px) 128px, (max-width: 1024px) 160px, 192px" />
              </div>
              
              {/* Fee badges */}
              <div className="absolute -top-2 -right-2 px-2 py-1 rounded-lg bg-destructive text-[9px] font-bold text-white shadow-xl rotate-3">
                -5%
              </div>
              <div className="absolute top-8 -left-2 px-1.5 py-0.5 rounded-lg bg-destructive/80 text-[8px] font-semibold text-white shadow-lg -rotate-6">
                +Listing
              </div>
              <div className="absolute -bottom-1 right-4 px-1.5 py-0.5 rounded-lg bg-destructive/70 text-[8px] font-semibold text-white shadow-lg rotate-2">
                +Boost
              </div>
            </div>
          </div>
          
          <div className="px-6 compact:px-8 large:px-10 pb-6 compact:pb-8 large:pb-10">
            <p className="text-caption1 text-muted-foreground/50 text-center">Fees eat profit</p>
          </div>
        </div>
        
        {/* Right - Revvup */}
        <div className="flex-1 flex flex-col">
          <div className="px-6 compact:px-8 large:px-10 pt-6 compact:pt-8 large:pt-10">
            <span className="text-caption1 text-primary">Revvup</span>
          </div>
          
          <div className="flex-1 flex items-center justify-center px-4 compact:px-8 large:px-12 py-6">
            <div className="relative">
              {/* Car image - vibrant */}
              <div className="w-32 compact:w-40 large:w-48 aspect-[4/3] rounded-xl overflow-hidden border-2 border-primary/40">
                <Image src={m4} alt="" className="w-full h-full object-cover" sizes="(max-width: 640px) 128px, (max-width: 1024px) 160px, 192px" />
              </div>
              
              {/* Single clean badge */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <div className="px-3 py-1 rounded-full bg-primary text-caption1 font-semibold text-white shadow-xl shadow-primary/25">
                  100% yours
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 compact:px-8 large:px-10 pb-6 compact:pb-8 large:pb-10">
            <p className="text-caption1 text-primary/70 text-center">Keep every dirham</p>
          </div>
        </div>
      </div>
    </div>
  );
}
