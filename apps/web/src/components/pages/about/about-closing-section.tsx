/**
 * About Closing Section
 * The invitation. Personal. Genuine.
 */

'use client';

import Link from 'next/link';

export function AboutClosingSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Final message */}
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0066FF]">
            Car enthusiasts first
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground tracking-tight leading-[1.15]">
            We're not building a company.
            <br />
            <span className="text-muted-foreground/60">We're building a culture.</span>
          </h2>
          <p className="text-[15px] text-muted-foreground leading-relaxed">
            If this resonates—if you're tired of the games and want something real—we'd 
            love to have you. Not as a customer. As part of the community.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6">
            <Link
              href="/contact"
              className="w-full sm:w-auto h-11 px-8 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
            >
              Get in Touch
            </Link>
            <Link
              href="/knowledge/akh"
              className="w-full sm:w-auto h-11 px-8 bg-muted text-foreground text-sm font-medium rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
            >
              Knowledge Hub
            </Link>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="flex items-center justify-center gap-10 md:gap-16 pt-16 mt-16 border-t border-border/40">
          <div className="text-center space-y-1">
            <div className="text-xl font-bold tracking-tight text-[#0066FF]">Trust</div>
            <div className="text-[13px] text-muted-foreground">First</div>
          </div>
          <div className="w-px h-10 bg-border/30 hidden sm:block" />
          <div className="text-center space-y-1">
            <div className="text-xl font-bold tracking-tight text-[#0066FF]">Clarity</div>
            <div className="text-[13px] text-muted-foreground">Always</div>
          </div>
          <div className="w-px h-10 bg-border/30 hidden sm:block" />
          <div className="text-center space-y-1">
            <div className="text-xl font-bold tracking-tight text-[#0066FF]">Less</div>
            <div className="text-[13px] text-muted-foreground">Is more</div>
          </div>
        </div>

      </div>
    </section>
  );
}
