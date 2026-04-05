/**
 * About Team Section
 * Brief team mention - quote card style like vision commitment
 */

'use client';

import { MarketingImage as Image } from '@/components/pages/marketing-image';
import { revx2 } from '@/components/pages/marketing-image-assets';

export function AboutTeamSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
            The Team
          </span>
          <h2 className="text-title2 sm:text-title1 lg:text-display font-semibold tracking-tight">
            Small Team.
            <br />
            <span className="text-muted-foreground">Big standards.</span>
          </h2>
        </div>

        {/* Image */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-sidebar border border-border/40 mb-12">
          <Image
            src={revx2}
            alt="The Revvup Team"
            fill
            className="object-cover"
            sizes="(max-width: 1600px) 100vw, 1600px"
          />
        </div>

        {/* Description */}
        <p className="text-callout text-muted-foreground max-w-lg mx-auto text-center mb-12 leading-relaxed">
          We're a small, focused team in Dubai. Car enthusiasts who got tired of the status quo 
          and decided to build something better.
        </p>

        {/* Quote Card */}
        <div className="max-w-3xl mx-auto">
          <div className="p-8 rounded-xl bg-primary text-primary-foreground text-center">
            <blockquote className="text-headline sm:text-title3 font-medium leading-relaxed">
              "Self-funded. Independent. No investors, no board meetings, no exit strategy. 
              Just building a product we'd want to use ourselves."
            </blockquote>
          </div>
        </div>

      </div>
    </section>
  );
}
