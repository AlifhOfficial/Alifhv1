/**
 * Become Partner Closing Section
 * Simple link to learn more
 */

import Link from 'next/link';

export function BecomePartnerClosingSection() {
  return (
    <section className="pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        <div className="pt-8 border-t border-border/40">
          <p className="text-sm text-muted-foreground">
            Want to know what you get as a partner?{' '}
            <Link href="/partners" className="text-foreground font-medium hover:underline">
              See the full breakdown →
            </Link>
          </p>
        </div>

      </div>
    </section>
  );
}
