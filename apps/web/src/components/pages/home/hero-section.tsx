/**
 * Hero Section - Revvup Home Page
 * Clean, minimal hero following Revvup Design System
 */

'use client';

import { MarketingImage as Image } from '@/components/pages/marketing-image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthRequired } from '@/hooks/use-auth-required';
import { AuthRequiredModal } from '@/components/auth/auth-required-modal';
import { revvupab2 } from '@/components/pages/marketing-image-assets';

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

        {/* Hero Image */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[2.4/1] overflow-hidden rounded-lg mb-8">
          <Image
            src={revvupab2}
            alt="Revvup - UAE Car Marketplace"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1600px) 100vw, 1600px"
          />
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-8 sm:gap-12 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-2xl font-semibold tracking-tight text-primary mb-1">AED 0</div>
            <div className="text-sm text-muted-foreground">Listing fee</div>
          </div>
          <div className="w-px h-10 bg-border/30" />
          <div className="text-center">
            <div className="text-2xl font-semibold tracking-tight text-primary mb-1">1:1</div>
            <div className="text-sm text-muted-foreground">One car, one listing</div>
          </div>
          <div className="w-px h-10 bg-border/30" />
          <div className="text-center">
            <div className="text-2xl font-semibold tracking-tight text-primary mb-1">24/7</div>
            <div className="text-sm text-muted-foreground">Book test drives</div>
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
