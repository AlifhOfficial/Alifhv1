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
            
            {/* Image Side */}
            <div className="relative order-2 lg:order-1">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <Image
                  src="/Abstract/rs6.png"
                  alt="Abstract design"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Content Side */}
            <div className="order-1 lg:order-2 space-y-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                What we stand for
              </p>
              
              <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
                Built by car people.
                <br />
                <span className="text-muted-foreground/70">For car people.</span>
              </h2>
              
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                We're the same people at track days, car meets, late-night debates about the E46 M3. 
                We built this because listing fees never made sense to us. VIN upfront. Free listings. 
                Online booking. No ads. That's the standard we think should exist.
              </p>

              {/* Principles */}
              <div className="pt-4 border-t border-border/40 space-y-3">
                {[
                  { title: 'Clarity over noise', desc: 'Simple beats flashy' },
                  { title: 'Honesty over pressure', desc: 'No fake urgency' },
                  { title: 'Quality over volume', desc: 'Standards matter' },
                  { title: 'People over profits', desc: 'We answer to users, not investors' },
                ].map((principle, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#0066FF] shrink-0" />
                    <span className="text-sm font-medium text-foreground">{principle.title}</span>
                    <span className="text-xs text-muted-foreground">— {principle.desc}</span>
                  </div>
                ))}
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
              <span className="text-muted-foreground/70">No friction.</span>
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
