import Link from 'next/link';
import { revvupab2 } from '@/components/pages/marketing-image-assets';
import { PublicSellButton } from '@/components/shared/public-sell-button';

export function HeroSection() {
  return (
    <section className="pt-28 pb-20 px-4 compact:px-6 large:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Brand & Tagline */}
        <div className="text-center mb-8 space-y-5">
          <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
            UAE Car Marketplace
          </span>
          <h1 className="text-title2 compact:text-title1 large:text-display font-semibold tracking-tight">
            Buy and sell cars.
            <br />
            <span className="text-muted-foreground">Free. Forever.</span>
          </h1>
          <p className="text-subhead compact:text-callout text-muted-foreground">
            More than a marketplace. Join the Revolution.
          </p>
        </div>

        {/* Main CTAs */}
        <div className="flex flex-col compact:flex-row items-center justify-center gap-3 mb-16">
          <Link
            href="/listings"
            className="w-full compact:w-auto h-11 px-8 bg-primary text-primary-foreground text-subhead font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
          >
            Browse Cars
          </Link>
          <PublicSellButton className="w-full compact:w-auto h-11 px-8 bg-muted text-foreground text-subhead font-semibold rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center">
            Sell Your Car
          </PublicSellButton>
        </div>

        {/* Hero Image — native img for LCP: fetchpriority=high, direct CDN URL, no proxy chain */}
        <div className="relative w-full aspect-[16/9] compact:aspect-[2.4/1] overflow-hidden rounded-lg mb-8">
          <img
            src={revvupab2}
            alt="Revvup - UAE Car Marketplace"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-8 compact:gap-12 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-title2 font-semibold tracking-tight text-primary mb-1">AED 0</div>
            <div className="text-subhead text-muted-foreground">Listing fee</div>
          </div>
          <div className="w-px h-10 bg-border/30" />
          <div className="text-center">
            <div className="text-title2 font-semibold tracking-tight text-primary mb-1">1:1</div>
            <div className="text-subhead text-muted-foreground">One car, one listing</div>
          </div>
          <div className="w-px h-10 bg-border/30" />
          <div className="text-center">
            <div className="text-title2 font-semibold tracking-tight text-primary mb-1">24/7</div>
            <div className="text-subhead text-muted-foreground">Book test drives</div>
          </div>
        </div>

        {/* Description */}
        <p className="text-center text-callout text-muted-foreground max-w-lg mx-auto mt-8">
          List as many cars as you want — completely free, forever. Made for individuals.
        </p>

      </div>
    </section>
  );
}
