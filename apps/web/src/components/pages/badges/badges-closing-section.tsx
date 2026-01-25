/**
 * Badges Closing Section - Alifh Badges Page
 * How it works - clean explanation
 */

'use client';

import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';

export function BadgesClosingSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            How it works
          </p>
          <h2 className="text-2xl sm:text-3xl font-medium text-foreground tracking-tight leading-tight">
            Assigned by Team Alifh.
            <br />
            <span className="text-muted-foreground/70">Not algorithms.</span>
          </h2>
        </div>

        {/* Mix & Match Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Image Card */}
          <div className="lg:col-span-2 aspect-[4/3] rounded-lg overflow-hidden">
            <Image
              src="/Abstract/b4.png"
              alt="Abstract design"
              fill
              className="object-cover !relative"
            />
          </div>

          {/* Big Feature Card */}
          <div className="lg:col-span-2 p-8 rounded-lg border border-border/40 bg-background flex flex-col justify-center">
            <h3 className="text-lg font-medium text-foreground mb-3 tracking-tight">
              Character over numbers
            </h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              We look for people and dealers who embody our values: transparency, integrity, and genuine care for the automotive community.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="p-6 rounded-lg border border-border/40 bg-background">
            <CheckCircle2 className="w-5 h-5 text-[#0066FF] mb-3" />
            <h3 className="text-sm font-medium text-foreground mb-1">Hand-picked</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every badge reviewed by our team.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border/40 bg-background">
            <CheckCircle2 className="w-5 h-5 text-[#0066FF] mb-3" />
            <h3 className="text-sm font-medium text-foreground mb-1">Not for sale</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Badges cannot be purchased.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border/40 bg-background">
            <CheckCircle2 className="w-5 h-5 text-[#0066FF] mb-3" />
            <h3 className="text-sm font-medium text-foreground mb-1">Merit based</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Recognition of who you are.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-[#0066FF] text-white">
            <CheckCircle2 className="w-5 h-5 text-white/80 mb-3" />
            <h3 className="text-sm font-medium mb-1">Visible trust</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Badges appear on your profile.
            </p>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="flex items-center justify-center gap-12 md:gap-20 pt-16 mt-16 border-t border-border/40">
          <div className="text-center space-y-1">
            <div className="text-xl font-semibold tracking-tight text-[#0066FF]">5</div>
            <div className="text-xs text-muted-foreground">User badges</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-xl font-semibold tracking-tight text-[#0066FF]">5</div>
            <div className="text-xs text-muted-foreground">Dealer badges</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-xl font-semibold tracking-tight text-[#0066FF]">0</div>
            <div className="text-xs text-muted-foreground">Shortcuts</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-xl font-semibold tracking-tight text-[#0066FF]">∞</div>
            <div className="text-xs text-muted-foreground">Integrity</div>
          </div>
        </div>

      </div>
    </section>
  );
}
