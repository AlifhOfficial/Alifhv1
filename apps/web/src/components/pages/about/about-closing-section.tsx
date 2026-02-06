/**
 * About Closing Section
 * CTA matching vision page style
 */

'use client';

import Link from 'next/link';

export function AboutClosingSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Get Started
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            Ready to Try It?
            <br />
            <span className="text-muted-foreground">We'd love to have you.</span>
          </h2>
        </div>

        {/* Description */}
        <p className="text-base text-muted-foreground max-w-lg mx-auto text-center mb-12 leading-relaxed">
          Whether you're buying your next car, selling one, or looking to partner with us—
          the door's open.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/listings"
            className="w-full sm:w-auto h-12 px-10 bg-primary text-primary-foreground text-base font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
          >
            Browse Cars
          </Link>
          <Link
            href="/partners"
            className="w-full sm:w-auto h-12 px-10 border border-border/40 bg-sidebar text-foreground text-base font-semibold rounded-lg hover:bg-sidebar/80 transition-colors flex items-center justify-center"
          >
            Partner With Us
          </Link>
        </div>

      </div>
    </section>
  );
}
