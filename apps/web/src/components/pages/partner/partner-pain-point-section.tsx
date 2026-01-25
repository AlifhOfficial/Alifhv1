/**
 * Partner Pain Point Section - Alifh Partners Page
 * Visual comparison - their games vs our simplicity
 */

import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';

export function PartnerPainPointSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Image Side */}
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
            <Image
              src="/Abstract/rs20.png"
              alt="Abstract"
              fill
              className="object-cover"
            />
          </div>

          {/* Content Side */}
          <div className="space-y-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0066FF]">
              The marketplace game
            </p>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground tracking-tight leading-[1.15]">
              Commission. Credits. Upsells.
              <br />
              <span className="text-muted-foreground/60">Sound familiar?</span>
            </h2>
            
            <p className="text-[15px] text-muted-foreground leading-relaxed max-w-lg">
              They compete with you by selling their own cars. Then charge you for visibility on their platform.
            </p>
            
            <div className="flex items-center gap-8 pt-4">
              <div className="text-center space-y-1">
                <div className="text-xl font-bold tracking-tight text-foreground">3-5%</div>
                <div className="text-[13px] text-muted-foreground">Their cut</div>
              </div>
              <div className="w-px h-10 bg-border/30" />
              <div className="text-center space-y-1">
                <div className="text-xl font-bold tracking-tight text-foreground">AED 99+</div>
                <div className="text-[13px] text-muted-foreground">Per listing</div>
              </div>
              <div className="w-px h-10 bg-border/30" />
              <div className="text-center space-y-1">
                <div className="text-xl font-bold tracking-tight text-foreground">∞</div>
                <div className="text-[13px] text-muted-foreground">Add-ons</div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="grid sm:grid-cols-2 gap-px bg-border/40 rounded-lg overflow-hidden border border-border/40 max-w-4xl mx-auto mt-20">
          
          {/* Others */}
          <div className="p-8 bg-sidebar">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60 mb-8">Others</p>
            <div className="space-y-4">
              {[
                'Commission on every sale',
                'Credits that expire',
                'Pay per listing per day',
                'Premium to be seen',
                'They sell cars too',
              ].map((item, i) => (
                <p key={i} className="text-[13px] text-muted-foreground/60">{item}</p>
              ))}
            </div>
          </div>

          {/* Alifh */}
          <div className="p-8 bg-[#0066FF] text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/60 mb-8">Alifh</p>
            <div className="space-y-4">
              {[
                'Zero commission',
                'No credits, no tokens',
                'Unlimited listings per showroom',
                'Quality earns visibility',
                'We never sell cars',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white/60" />
                  <span className="text-[13px] font-semibold">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
