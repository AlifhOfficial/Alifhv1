/**
 * About Closing Section
 * CTA matching vision page style
 */

'use client';

import Link from 'next/link';

export function AboutClosingSection() {
  return (
    <section className="pt-28 pb-20 px-4 compact:px-6 large:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
            Get Started
          </span>
          <h2 className="text-title2 compact:text-title1 large:text-display font-semibold tracking-tight">
            Ready to Try It?
            <br />
            <span className="text-muted-foreground">We'd love to have you.</span>
          </h2>
        </div>

        {/* Description */}
        <p className="text-callout text-muted-foreground max-w-lg mx-auto text-center mb-12 leading-relaxed">
          Whether you're buying your next car, selling one, or looking to partner with us—
          the door's open.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col compact:flex-row items-center justify-center gap-3">
          <Link
            href="/listings"
            className="w-full compact:w-auto h-12 px-10 bg-primary text-primary-foreground text-callout font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
          >
            Browse Cars
          </Link>
          <Link
            href="/user-dashboard/requests"
            className="w-full compact:w-auto h-12 px-10 border border-border/40 bg-sidebar text-foreground text-callout font-semibold rounded-lg hover:bg-sidebar/80 transition-colors flex items-center justify-center"
          >
            Partner With Us
          </Link>
        </div>

      </div>
    </section>
  );
}
