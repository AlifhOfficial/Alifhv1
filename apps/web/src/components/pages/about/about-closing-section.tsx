/**
 * About Closing Section
 * Simple invitation.
 */

'use client';

import Link from 'next/link';

export function AboutClosingSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Message */}
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Get Involved
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            This is just the beginning.
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            We're not building a company. We're building a culture of clarity, honesty, and respect.
            If that resonates—we'd love to hear from you.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/listings"
              className="w-full sm:w-auto h-11 px-8 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
            >
              Browse Cars
            </Link>
            <Link
              href="/partners"
              className="w-full sm:w-auto h-11 px-8 bg-muted text-foreground text-sm font-semibold rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
            >
              Partner With Us
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
