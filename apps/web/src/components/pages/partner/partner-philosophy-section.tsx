/**
 * Partner Philosophy Section - Alifh Partners Page
 * Core message - infrastructure, not competition
 */

import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';

export function PartnerPhilosophySection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Content Side */}
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Our philosophy
            </p>
            
            <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
              We don't sell cars.
              <br />
              <span className="text-muted-foreground/70">We never will.</span>
            </h2>
            
            <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
              You're the expert. We're just infrastructure—your sales channel. Nothing more.
            </p>

            {/* Principles */}
            <div className="pt-4 border-t border-border/40 space-y-3">
              {[
                { title: 'Infrastructure only', desc: 'We build roads, you drive' },
                { title: 'Never competing', desc: 'Zero cars owned by Alifh' },
                { title: 'You\'re the expert', desc: 'We enable, not teach' },
              ].map((principle, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#0066FF] shrink-0" />
                  <span className="text-sm font-medium text-foreground">{principle.title}</span>
                  <span className="text-xs text-muted-foreground">— {principle.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Image Side */}
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
            <Image
              src="/Marketing_Assets/A3.png"
              alt="Abstract"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
