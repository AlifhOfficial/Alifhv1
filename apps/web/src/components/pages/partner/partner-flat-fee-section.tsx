/**
 * Partner Flat Fee Section - Alifh Partners Page
 * Visual grid - what's included, no bloat
 */

import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';

export function PartnerFlatFeeSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        <div className="text-center mb-16 space-y-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            The Alifh model
          </p>
          <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
            One price. Everything.
            <br />
            <span className="text-muted-foreground/70">That's it.</span>
          </h2>
        </div>

        {/* Mix & Match Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Image Card */}
          <div className="lg:col-span-2 aspect-[4/3] rounded-lg overflow-hidden">
            <Image
              src="/Abstract/rs4.png"
              alt="Abstract design"
              fill
              className="object-cover !relative"
            />
          </div>

          {/* Highlight Card */}
          <div className="lg:col-span-2 p-8 rounded-lg bg-[#0066FF] text-white flex flex-col justify-center">
            <p className="text-xs uppercase tracking-widest text-white/60 mb-4">Forever</p>
            <h3 className="text-2xl font-semibold mb-3 tracking-tight">
              Zero commission.
            </h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Your margins are yours. We succeed when you succeed—not by skimming off your sales.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="p-6 rounded-lg border border-border/40 bg-background">
            <CheckCircle2 className="w-5 h-5 text-[#0066FF] mb-3" />
            <h3 className="text-sm font-medium text-foreground mb-1">Unlimited listings</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              10 or 1,000. Same price.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border/40 bg-background">
            <CheckCircle2 className="w-5 h-5 text-[#0066FF] mb-3" />
            <h3 className="text-sm font-medium text-foreground mb-1">All features</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              No add-ons. No tiers.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border/40 bg-background">
            <CheckCircle2 className="w-5 h-5 text-[#0066FF] mb-3" />
            <h3 className="text-sm font-medium text-foreground mb-1">No credits</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              No tokens. No wallet.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border/40 bg-background">
            <CheckCircle2 className="w-5 h-5 text-[#0066FF] mb-3" />
            <h3 className="text-sm font-medium text-foreground mb-1">No upsells</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              What you see is what you get.
            </p>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="flex items-center justify-center gap-12 pt-12 mt-12 border-t border-border/40">
          <div className="text-center space-y-1">
            <div className="text-2xl font-semibold tracking-tight text-[#0066FF]">AED 0</div>
            <div className="text-xs text-muted-foreground">Per listing</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-semibold tracking-tight text-[#0066FF]">AED 0</div>
            <div className="text-xs text-muted-foreground">Per sale</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-semibold tracking-tight text-[#0066FF]">AED 0</div>
            <div className="text-xs text-muted-foreground">To boost</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-semibold tracking-tight text-[#0066FF]">AED 0</div>
            <div className="text-xs text-muted-foreground">Hidden fees</div>
          </div>
        </div>

      </div>
    </section>
  );
}
