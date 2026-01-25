/**
 * Partner Tools Section - Alifh Partners Page
 * Clean grid - tools that matter
 */

import Image from 'next/image';
import { Calendar, Users, MessageSquare, BarChart3, Package, Filter } from 'lucide-react';

export function PartnerToolsSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        <div className="text-center mb-16 space-y-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0066FF]">
            Your toolkit
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground tracking-tight leading-[1.15]">
            What you need.
            <br />
            <span className="text-muted-foreground/60">Nothing you don't.</span>
          </h2>
        </div>

        {/* Tools Grid - Mix & Match */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Image Card */}
          <div className="sm:col-span-2 lg:col-span-2 aspect-[16/9] rounded-lg overflow-hidden">
            <Image
              src="/Abstract/rs21.png"
              alt=""
              fill
              className="object-cover !relative"
            />
          </div>

          {/* Big Feature Card */}
          <div className="sm:col-span-2 lg:col-span-2 p-8 rounded-lg border border-border/40 bg-sidebar flex flex-col justify-center">
            <h3 className="text-lg font-semibold text-foreground mb-3 tracking-tight">
              Listing-based messaging
            </h3>
            <p className="text-[15px] text-muted-foreground leading-relaxed">
              Every chat tied to a car. Same customer, two cars? Two clean threads. No chaos.
            </p>
          </div>

          {/* Tool Cards */}
          <div className="p-6 rounded-lg border border-border/40 bg-sidebar">
            <Calendar className="w-5 h-5 text-[#0066FF] mb-3" />
            <h3 className="text-[15px] font-semibold text-foreground mb-1">Test drive booking</h3>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              Set slots. Buyers book direct.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border/40 bg-sidebar">
            <Filter className="w-5 h-5 text-[#0066FF] mb-3" />
            <h3 className="text-[15px] font-semibold text-foreground mb-1">Quality leads</h3>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              User-consented. Not spam.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border/40 bg-sidebar">
            <Package className="w-5 h-5 text-[#0066FF] mb-3" />
            <h3 className="text-[15px] font-semibold text-foreground mb-1">Inventory view</h3>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              All cars. One dashboard.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-[#0066FF] text-white">
            <BarChart3 className="w-5 h-5 text-white/80 mb-3" />
            <h3 className="text-[15px] font-semibold mb-1">Analytics</h3>
            <p className="text-[13px] text-white/70 leading-relaxed">
              Numbers that help you act.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
