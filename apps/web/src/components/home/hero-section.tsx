/**
 * Hero Section - Alifh Home Page
 * Clean, minimal hero following Alifh Design System
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="pt-28 sm:pt-32 pb-24 px-6">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Brand Mark */}
        <div className="text-center mb-6">
          <span className="text-xs font-normal tracking-[0.2em] uppercase text-muted-foreground">
            Alifh
          </span>
        </div>

        {/* Headline */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal text-foreground tracking-tight leading-[1.1]">
            Buy and sell cars
            <br />
            <span className="text-muted-foreground">without the guesswork</span>
          </h1>
        </div>

        {/* Supporting Copy */}
        <div className="text-center mb-10">
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            Every listing includes VIN history. No hidden fees.
            <br className="hidden sm:block" />
            No pressure. Just clarity.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16 max-w-sm sm:max-w-none mx-auto">
          <Link
            href="/listings"
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white text-sm font-normal rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            Browse Cars
          </Link>
          <Link
            href="/sell"
            className="w-full sm:w-auto px-6 py-2.5 bg-transparent border border-border text-foreground text-sm font-normal rounded-lg hover:bg-muted/50 transition-colors text-center"
          >
            List Your Car — Free
          </Link>
        </div>

        {/* Hero Image */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[2.4/1] overflow-hidden rounded-2xl mb-20">
          <Image
            src="/Images/hero_img.png"
            alt="Alifh - UAE Car Marketplace"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1600px) 100vw, 1600px"
          />
        </div>

        {/* Value Props */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 max-w-3xl mx-auto">
          <div className="text-center">
            <p className="text-sm text-foreground mb-1.5">
              VIN on every listing
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Check the history before you visit. No surprises.
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-foreground mb-1.5">
              Always free to list
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Selling your car shouldn't cost you money.
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-foreground mb-1.5">
              Book test drives online
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Skip the calls. Schedule directly with sellers.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
