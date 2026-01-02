/**
 * Hero Section - Alifh Home Page
 * Clean, minimal hero following Alifh Design System
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Brand & Tagline */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Alifh
          </p>
          <h1 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
            Buy and sell cars.
            <br />
            <span className="text-muted-foreground/70">Done right.</span>
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto pt-2">
            Browse listings. Book test drives. List your car—free.
          </p>
        </div>

        {/* Main CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <Link
            href="/listings"
            className="w-full sm:w-auto h-11 px-8 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
          >
            Browse Cars
          </Link>
          <Link
            href="/sell"
            className="w-full sm:w-auto h-11 px-8 bg-muted text-foreground text-sm font-medium rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
          >
            Sell Your Car
          </Link>
        </div>

        {/* Hero Image */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[2.4/1] overflow-hidden rounded-lg mb-16">
          <Image
            src="/Images/Hero_img.png"
            alt="Automotive marketplace"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1400px) 100vw, 1400px"
          />
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-12 md:gap-20 pt-8 border-t border-border/40">
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
