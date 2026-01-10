/**
 * Partner Closing Section - Alifh Partners Page
 * Final push with clear CTA
 */

import Link from 'next/link';
import Image from 'next/image';

export function PartnerClosingSection() {
  return (
    <section>
      
      {/* Content */}
      <div className="max-w-[1600px] mx-auto px-4 py-24">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
          Limited availability
        </p>
        <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight mb-4 max-w-2xl">
          50 signature spots.
          <br />
          <span className="text-muted-foreground/70">Quality over volume.</span>
        </h2>
        
        <p className="text-sm text-muted-foreground max-w-xl mb-8 leading-relaxed">
          We're not chasing every dealer in the UAE. We want partners who care about doing things right—dealers ready for tools that actually work.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-16">
          <Link
            href="/become-partner"
            className="h-11 px-8 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
          >
            Apply for Partnership
          </Link>
          <Link
            href="/contact"
            className="h-11 px-8 bg-muted text-foreground text-sm font-medium rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
          >
            Have Questions?
          </Link>
        </div>

        {/* Partner Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div>
            <p className="text-2xl font-semibold text-foreground">0%</p>
            <p className="text-xs text-muted-foreground">Commission on sales</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-foreground">∞</p>
            <p className="text-xs text-muted-foreground">Listings included</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-foreground">1</p>
            <p className="text-xs text-muted-foreground">Simple monthly fee</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-foreground">24/7</p>
            <p className="text-xs text-muted-foreground">Booking for your cars</p>
          </div>
        </div>

        {/* Final Note */}
        <div className="border-t border-border/40 pt-12">
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            <span className="text-foreground font-medium">P.S.</span> — If you're tired of platforms that compete with you or nickel-and-dime every feature, let's talk.
          </p>
        </div>
      </div>

    </section>
  );
}
