/**
 * Hero Section - Revvup Home Page
 * Clean, minimal hero following Revvup Design System
 */

'use client';

import { useId } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthRequired } from '@/hooks/use-auth-required';
import { AuthRequiredModal } from '@/components/auth/auth-required-modal';

function SellButton() {
  const router = useRouter();
  const { isAuthenticated, showModal, openModal, closeModal } = useAuthRequired({
    feature: "create listings",
    redirectTo: "/user-dashboard/listings/new",
  });

  const handleClick = () => {
    if (isAuthenticated) {
      router.push('/user-dashboard/listings/new');
    } else {
      openModal();
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="w-full sm:w-auto h-11 px-8 bg-muted text-foreground text-sm font-semibold rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
      >
        Sell Your Car
      </button>
      <AuthRequiredModal
        open={showModal}
        onClose={closeModal}
        feature="create listings"
        redirectTo="/user-dashboard/listings/new"
      />
    </>
  );
}

export function HeroSection() {
  const maskId = useId();
  
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Brand & Tagline */}
        <div className="text-center mb-8 space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            UAE Car Marketplace
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            Buy and sell cars.
            <br />
            <span className="text-muted-foreground">Free. Forever.</span>
          </h1>
          <p className="text-sm sm:text-base font-medium text-muted-foreground">
            More than a marketplace. Join the Revolution.
          </p>
        </div>

        {/* Main CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <Link
            href="/listings"
            className="w-full sm:w-auto h-11 px-8 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
          >
            Browse Cars
          </Link>
          <SellButton />
        </div>

        {/* Hero Video */}
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-lg mb-8">
          {/* Background Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            suppressHydrationWarning
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/Marketing/k.mp4" type="video/mp4" />
          </video>
          
          {/* SVG Mask - Video shows through text */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <mask id={maskId}>
                <rect width="100%" height="100%" fill="white" />
                <text
                  x="50%"
                  y="50%"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fill="black"
                  fontSize="18"
                  fontWeight="bold"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  letterSpacing="-0.02em"
                >
                  Revvup
                </text>
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="black" mask={`url(#${maskId})`} />
          </svg>
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-12 md:gap-20 pt-8">
          <div className="text-center space-y-1">
            <p className="text-xl font-semibold tracking-tight text-primary">AED 0</p>
            <span className="text-sm text-muted-foreground">Listing fee</span>
          </div>
          <div className="w-px h-10 bg-border/30 hidden sm:block" />
          <div className="text-center space-y-1">
            <p className="text-xl font-semibold tracking-tight text-primary">VIN</p>
            <span className="text-sm text-muted-foreground">Required on every car</span>
          </div>
          <div className="w-px h-10 bg-border/30 hidden sm:block" />
          <div className="text-center space-y-1">
            <p className="text-xl font-semibold tracking-tight text-primary">24/7</p>
            <span className="text-sm text-muted-foreground">Book test drives</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-center text-base text-muted-foreground max-w-lg mx-auto mt-8">
          List as many cars as you want — completely free, forever. Made for individuals.
        </p>

      </div>
    </section>
  );
}