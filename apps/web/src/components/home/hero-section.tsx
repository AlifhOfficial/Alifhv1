/**
 * Hero Section - Alifh Home Page
 * Clean, minimal hero following Alifh Design System
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="pt-28 pb-20 px-4">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Brand & Tagline */}
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight">
            Alifh<span className="text-primary">™</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Buy and sell cars. Done right.
          </p>
        </div>

        {/* Hero Image */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[2.4/1] overflow-hidden rounded-lg mb-8">
          <Image
            src="/Images/Hero_img.png"
            alt="Automotive marketplace"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1400px) 100vw, 1400px"
          />
        </div>

        {/* Introduction */}
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <p className="text-sm text-muted-foreground leading-relaxed">
            List for free. Browse verified inventory. Save favorites. Book test drives—all in one place.
          </p>
        </div>

        {/* Main CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <Link
            href="/listings"
            className="w-full sm:w-auto h-10 px-6 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
          >
            Browse Cars
          </Link>
          <Link
            href="/sell"
            className="w-full sm:w-auto h-10 px-6 bg-muted text-foreground text-sm font-medium rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
          >
            Sell Your Car
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-12 md:gap-16 pt-8 border-t border-border/40">
          <div className="text-center space-y-1">
            <div className="text-2xl font-semibold tracking-tight text-foreground">Free</div>
            <div className="text-xs text-muted-foreground">List unlimited</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-semibold tracking-tight text-foreground">VIN</div>
            <div className="text-xs text-muted-foreground">Every listing</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-semibold tracking-tight text-foreground">Book</div>
            <div className="text-xs text-muted-foreground">Test drives</div>
          </div>
        </div>

      </div>
    </section>
  );
}
