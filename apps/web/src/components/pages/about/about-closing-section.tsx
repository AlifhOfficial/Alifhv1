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
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Join us
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            This is just the beginning.
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            If you're tired of the games and want something real—we'd love to have you. 
            Not as a user. As part of what we're building.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6">
            <Link
              href="/contact"
              className="w-full sm:w-auto h-11 px-8 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
            >
              Get in Touch
            </Link>
            <Link
              href="/knowledge/akh"
              className="w-full sm:w-auto h-11 px-8 bg-muted text-foreground text-sm font-semibold rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
            >
              Knowledge Hub
            </Link>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-16 pt-12 sm:pt-16 mt-12 sm:mt-16 border-t border-border/40">
          <div className="text-center space-y-1">
            <div className="text-lg sm:text-2xl font-bold tracking-tight text-primary">Trust</div>
            <div className="text-xs sm:text-sm text-muted-foreground">First</div>
          </div>
          <div className="w-px h-8 sm:h-10 bg-border/30 hidden sm:block" />
          <div className="text-center space-y-1">
            <div className="text-lg sm:text-2xl font-bold tracking-tight text-primary">Dubai</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Based</div>
          </div>
          <div className="w-px h-8 sm:h-10 bg-border/30 hidden sm:block" />
          <div className="text-center space-y-1">
            <div className="text-lg sm:text-2xl font-bold tracking-tight text-primary">Independent</div>
            <div className="text-xs sm:text-sm text-muted-foreground">No VCs</div>
          </div>
          <div className="w-px h-8 sm:h-10 bg-border/30 hidden sm:block" />
          <div className="text-center space-y-1">
            <div className="text-lg sm:text-2xl font-bold tracking-tight text-primary">Long-term</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Always</div>
          </div>
        </div>

      </div>
    </section>
  );
}
