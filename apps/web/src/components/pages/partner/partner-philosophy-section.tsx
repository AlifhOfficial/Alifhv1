/**
 * Partner Philosophy Section - Revvup Partners Page
 * Core message - infrastructure, not competition
 */

import { MarketingImage as Image } from '@/components/pages/marketing-image';
import { CheckCircle2 } from 'lucide-react';
import { m5, m6, m7 } from '@/components/pages/marketing-image-assets';

export function PartnerPhilosophySection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header - Centered */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Our philosophy
          </span>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            We're infrastructure.
            <br />
            <span className="text-muted-foreground">Not competition.</span>
          </h2>
        </div>

        {/* Infographic */}
        <div className="mb-12">
          <PhilosophyInfographic />
        </div>

        {/* Description */}
        <p className="text-base text-muted-foreground leading-relaxed max-w-lg mx-auto text-center mb-16">
          You're the expert. We're just infrastructure—your sales channel. Nothing more.
        </p>

        {/* Principles - Card grid */}
        <div className="grid sm:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {[
            { title: 'Infrastructure only', desc: 'We build roads, you drive' },
            { title: 'Never competing', desc: 'Zero cars owned by Revvup' },
            { title: 'You\'re the expert', desc: 'We enable, not teach' },
          ].map((principle, i) => (
            <div key={i} className="p-6 rounded-xl border border-border/40 bg-sidebar">
              <CheckCircle2 className="w-5 h-5 text-primary mb-3" />
              <h3 className="text-base font-semibold mb-1">{principle.title}</h3>
              <p className="text-sm text-muted-foreground">{principle.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

// ============================================================================
// INFOGRAPHIC: Zero inventory visualization
// ============================================================================

function PhilosophyInfographic() {
  return (
    <div className="relative w-full aspect-[16/9] sm:aspect-[2.4/1] rounded-lg overflow-hidden bg-sidebar border border-border/40">

      <div className="h-full flex">
        {/* Left - Others have inventory */}
        <div className="flex-1 flex flex-col border-r border-border/20">
          <div className="px-6 sm:px-8 lg:px-10 pt-6 sm:pt-8 lg:pt-10">
            <span className="text-xs font-medium text-muted-foreground/60">Their inventory</span>
          </div>
          
          <div className="flex-1 flex items-center justify-center px-4 sm:px-8 lg:px-12 py-6">
            <div className="relative w-32 sm:w-40 lg:w-48">
              <div className="absolute top-0 left-0 w-20 sm:w-24 aspect-[4/3] rounded-lg overflow-hidden border border-border/30 opacity-40 -rotate-6 shadow-lg">
                <Image src={m5} alt="" className="w-full h-full object-cover grayscale" sizes="(max-width: 640px) 80px, 96px" />
              </div>
              <div className="absolute top-2 left-4 w-20 sm:w-24 aspect-[4/3] rounded-lg overflow-hidden border border-border/30 opacity-50 rotate-3 shadow-lg">
                <Image src={m6} alt="" className="w-full h-full object-cover grayscale" sizes="(max-width: 640px) 80px, 96px" />
              </div>
              <div className="absolute top-4 left-8 w-20 sm:w-24 aspect-[4/3] rounded-lg overflow-hidden border border-border/30 opacity-60 -rotate-2 shadow-lg">
                <Image src={m7} alt="" className="w-full h-full object-cover grayscale" sizes="(max-width: 640px) 80px, 96px" />
              </div>
            </div>
          </div>
          
          <div className="px-6 sm:px-8 lg:px-10 pb-6 sm:pb-8 lg:pb-10">
            <p className="text-xs text-muted-foreground/50 text-center">They compete with you</p>
          </div>
        </div>
        
        {/* Right - Revvup has zero */}
        <div className="flex-1 flex flex-col">
          <div className="px-6 sm:px-8 lg:px-10 pt-6 sm:pt-8 lg:pt-10">
            <span className="text-xs font-medium text-primary">Our inventory</span>
          </div>
          
          <div className="flex-1 flex items-center justify-center px-4 sm:px-8 lg:px-12 py-6">
            <div className="text-center">
              <div className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold text-primary/20 tracking-tight">0</div>
            </div>
          </div>
          
          <div className="px-6 sm:px-8 lg:px-10 pb-6 sm:pb-8 lg:pb-10">
            <p className="text-xs text-primary/70 text-center">We never compete</p>
          </div>
        </div>
      </div>
    </div>
  );
}
