/**
 * Partner Compare Section - Revvup Partners Page
 * Clean side-by-side with visual infographic
 */

'use client';

import { CheckCircle2 } from 'lucide-react';

export function PartnerCompareSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        <div className="text-center mb-16 space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Side by side
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            The difference.
          </h2>
        </div>

        {/* Visual Infographic */}
        <div className="mb-12">
          <CompareInfographic />
        </div>

        {/* Comparison Grid */}
        <div className="grid sm:grid-cols-2 gap-px bg-border/40 rounded-lg overflow-hidden border border-border/40 max-w-5xl mx-auto">
          
          {/* Others */}
          <div className="p-8 bg-sidebar">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/60 mb-8">Typical platforms</p>
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

          {/* Revvup */}
          <div className="p-8 bg-primary text-primary-foreground">
            <p className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-8">Revvup</p>
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
                  <span className="text-sm text-white/70">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{item.value}</span>
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
    <div className="relative w-full aspect-[16/9] sm:aspect-[2.4/1] rounded-lg overflow-hidden bg-sidebar border border-border/40">

      <div className="h-full flex">
        {/* Left - Others */}
        <div className="flex-1 flex flex-col border-r border-border/20">
          <div className="px-6 sm:px-8 lg:px-10 pt-6 sm:pt-8 lg:pt-10">
            <span className="text-xs font-medium text-muted-foreground/60">Others</span>
          </div>
          
          <div className="flex-1 flex items-center justify-center px-4 sm:px-8 lg:px-12 py-6">
            <div className="relative">
              {/* Car image - faded */}
              <div className="w-32 sm:w-40 lg:w-48 aspect-[4/3] rounded-xl overflow-hidden border border-border/30">
                <img 
                  src="/Marketing/m5.jpeg" 
                  alt="" 
                  className="w-full h-full object-cover opacity-50 grayscale"
                />
              </div>
              
              {/* Fee badges */}
              <div className="absolute -top-2 -right-2 px-2 py-1 rounded-lg bg-red-500 text-[9px] font-bold text-white shadow-xl rotate-3">
                -5%
              </div>
              <div className="absolute top-8 -left-2 px-1.5 py-0.5 rounded-lg bg-red-500/80 text-[8px] font-semibold text-white shadow-lg -rotate-6">
                +Listing
              </div>
              <div className="absolute -bottom-1 right-4 px-1.5 py-0.5 rounded-lg bg-red-500/70 text-[8px] font-semibold text-white shadow-lg rotate-2">
                +Boost
              </div>
            </div>
          </div>
          
          <div className="px-6 sm:px-8 lg:px-10 pb-6 sm:pb-8 lg:pb-10">
            <p className="text-xs text-muted-foreground/50 text-center">Fees eat profit</p>
          </div>
        </div>
        
        {/* Right - Revvup */}
        <div className="flex-1 flex flex-col">
          <div className="px-6 sm:px-8 lg:px-10 pt-6 sm:pt-8 lg:pt-10">
            <span className="text-xs font-medium text-primary">Revvup</span>
          </div>
          
          <div className="flex-1 flex items-center justify-center px-4 sm:px-8 lg:px-12 py-6">
            <div className="relative">
              {/* Car image - vibrant */}
              <div className="w-32 sm:w-40 lg:w-48 aspect-[4/3] rounded-xl overflow-hidden border-2 border-primary/40">
                <img 
                  src="/Marketing/m4.jpeg" 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Single clean badge */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <div className="px-3 py-1 rounded-full bg-primary text-xs font-semibold text-white shadow-xl shadow-primary/25">
                  100% yours
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 sm:px-8 lg:px-10 pb-6 sm:pb-8 lg:pb-10">
            <p className="text-xs text-primary/70 text-center">Keep every dirham</p>
          </div>
        </div>
      </div>
    </div>
  );
}
