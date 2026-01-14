/**
 * Closing Section - Alifh Home Page
 * Consistent with Hero Section design patterns
 */

'use client';

import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';

export function ClosingSection() {
  return (
    <section className="relative bg-background">

      {/* Section 1: Philosophy with Side Image */}
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Content Side */}
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                What we stand for
              </p>
              
              <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
                Built by Car People.
                <br />
                <span className="text-muted-foreground/70">For Car People.</span>
              </h2>
              
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                We're the same people at track days and car meets. We built this because listing fees never made sense to us.
              </p>

              {/* Principles - Simplified */}
              <div className="pt-4 border-t border-border/40 flex flex-wrap gap-x-6 gap-y-2">
                <span className="text-sm text-foreground flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#0066FF]" />Clarity over noise</span>
                <span className="text-sm text-foreground flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#0066FF]" />Honesty over pressure</span>
                <span className="text-sm text-foreground flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#0066FF]" />Quality over volume</span>
              </div>
            </div>

            {/* Image Side */}
            <div className="relative">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <Image
                  src="/Abstract/rsx6.png"
                  alt="Abstract design"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Video Showcase */}
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          
          <div className="text-center mb-16 space-y-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
              Browse. Book. Done.
              <br />
              <span className="text-muted-foreground/70">No Friction.</span>
            </h2>
          </div>

          {/* Video Container */}
          <div className="relative w-full aspect-[16/9] sm:aspect-[2.4/1] overflow-hidden rounded-lg">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/video/hero1x.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>

    </section>
  );
}
