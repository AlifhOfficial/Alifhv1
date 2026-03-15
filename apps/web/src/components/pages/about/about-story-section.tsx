/**
 * About Story Section
 * The problem and our approach - with feature cards like vision page
 */

'use client';

import { MarketingImage as Image } from '@/components/pages/marketing-image';
import { Ban, Eye, Users, Shield } from 'lucide-react';
import { revx3 } from '@/components/pages/marketing-image-assets';

export function AboutStorySection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Why We Exist
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            The UAE Car Market.
            <br />
            <span className="text-muted-foreground">Deserves better.</span>
          </h2>
        </div>

        {/* Image */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-sidebar border border-border/40 mb-12">
          <Image
            src={revx3}
            alt="Why Revvup exists"
            fill
            className="object-cover"
            sizes="(max-width: 1600px) 100vw, 1600px"
          />
        </div>

        {/* Description */}
        <p className="text-base text-muted-foreground max-w-lg mx-auto text-center mb-12 leading-relaxed">
          Platforms that charge AED 500+ to list. Pay-to-rank schemes. Hidden fees. 
          Dealers competing with their own users. We thought there had to be a better way.
        </p>

        {/* Feature Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="p-6 rounded-xl border border-border/40 bg-sidebar">
            <Ban className="w-5 h-5 text-primary/80 mb-3" />
            <h3 className="text-base font-semibold mb-1.5">No listing fees</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">List your car for free. Always.</p>
          </div>
          <div className="p-6 rounded-xl border border-border/40 bg-sidebar">
            <Eye className="w-5 h-5 text-primary/80 mb-3" />
            <h3 className="text-base font-semibold mb-1.5">No pay-to-rank</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Fair visibility for everyone.</p>
          </div>
          <div className="p-6 rounded-xl border border-border/40 bg-sidebar">
            <Users className="w-5 h-5 text-primary/80 mb-3" />
            <h3 className="text-base font-semibold mb-1.5">We don't compete</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">We connect. We don't sell cars.</p>
          </div>
          <div className="p-6 rounded-xl bg-primary text-primary-foreground">
            <Shield className="w-5 h-5 text-primary-foreground/70 mb-3" />
            <h3 className="text-base font-semibold mb-1.5">On your side</h3>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">Your success is our success.</p>
          </div>
        </div>

      </div>
    </section>
  );
}
