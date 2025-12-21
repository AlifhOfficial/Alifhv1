/**
 * Closing Section - Alifh Home Page
 * Unapologetic trust statement with full-width video
 */

import Link from 'next/link';

export function ClosingSection() {
  return (
    <section>
      
      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 py-24">
        <h2 className="text-2xl sm:text-3xl font-medium text-foreground tracking-tight leading-[1.1] mb-4 max-w-2xl">
          We didn't build this to compete.
          <br />
          We built it because nothing else worked.
        </h2>
        
        <p className="text-sm sm:text-base text-muted-foreground/70 max-w-lg mb-8 leading-relaxed">
          No investors telling us to add more ads. No shareholders demanding 
          we squeeze every penny. Just a simple promise: if we know something, 
          you know it too.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-16">
          <Link
            href="/listings"
            className="h-10 px-6 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
          >
            Start Browsing
          </Link>
          <Link
            href="/partner"
            className="h-10 px-6 bg-muted text-foreground text-sm font-medium rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
          >
            Partner With Us
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div>
            <p className="text-2xl font-semibold text-foreground">100%</p>
            <p className="text-xs text-muted-foreground">VIN verified</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-foreground">0</p>
            <p className="text-xs text-muted-foreground">Listing fees</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-foreground">0</p>
            <p className="text-xs text-muted-foreground">Ads. Ever.</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-foreground">24/7</p>
            <p className="text-xs text-muted-foreground">Online booking</p>
          </div>
        </div>
      </div>

      {/* Full Width Video */}
      <div className="max-w-[1400px] mx-auto px-4 pb-24">
        <div className="relative w-full aspect-[16/9] sm:aspect-[2.4/1] rounded-lg overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/video/hero1x.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

    </section>
  );
}
