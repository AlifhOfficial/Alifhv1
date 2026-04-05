/**
 * Vision Hero Section - Inspired by We the UAE 2031
 * SEO-optimized content showing our aspirations in line with national goals
 */

'use client';

import { MarketingImage as Image } from '@/components/pages/marketing-image';
import { visionHeroUae2031 } from '@/components/pages/marketing-image-assets';

export function VisionHeroSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
            Inspired by We the UAE 2031
          </span>
          <h1 className="text-title2 sm:text-title1 lg:text-display font-semibold tracking-tight">
            Towards New Peaks.
            <br />
            <span className="text-muted-foreground">In Automotive.</span>
          </h1>
        </div>

        {/* Hero Image */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-sidebar border border-border/40 mb-12">
          <Image
            src={visionHeroUae2031}
            alt="Revvup - Inspired by We the UAE 2031 Vision"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1600px) 100vw, 1600px"
          />
        </div>

        {/* Description */}
        <p className="text-callout text-muted-foreground max-w-lg mx-auto text-center mb-12 leading-relaxed">
          'We the UAE 2031' represents a national plan to continue the UAE's development path. 
          As a private sector company, we're inspired by this vision.
        </p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-12 md:gap-20 pt-8 border-t border-border/40">
          <div className="text-center space-y-1">
            <div className="text-title2 font-bold tracking-tight text-primary">4</div>
            <div className="text-subhead text-muted-foreground">Pillars</div>
          </div>
          <div className="w-px h-10 bg-border/30 hidden sm:block" />
          <div className="text-center space-y-1">
            <div className="text-title2 font-bold tracking-tight text-primary">2031</div>
            <div className="text-subhead text-muted-foreground">Target Year</div>
          </div>
          <div className="w-px h-10 bg-border/30 hidden sm:block" />
          <div className="text-center space-y-1">
            <div className="text-title2 font-bold tracking-tight text-primary">3T</div>
            <div className="text-subhead text-muted-foreground">AED GDP Goal</div>
          </div>
        </div>

      </div>
    </section>
  );
}
