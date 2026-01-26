/**
 * Hero Section - Alifh Home Page
 * Clean, minimal hero following Alifh Design System
 */

'use client';

import Image from 'next/image';
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
        className="w-full sm:w-auto h-11 px-8 bg-muted text-foreground text-sm font-medium rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
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
        <div className="text-center mb-16 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0066FF]">
            Alifh
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-[2.5rem] font-semibold text-foreground tracking-tight leading-[1.2]">
            List Your Car. For Free.
            <br />
            <span className="text-muted-foreground/60">Like It Should Be.</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto">
            Browse. Book test drives. Sell. No fees. No ads. No catch.
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
          <SellButton />
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
        <div className="flex items-center justify-center gap-10 md:gap-16">
          <div className="text-center space-y-1">
            <div className="text-lg font-semibold tracking-tight text-[#0066FF]">Free</div>
            <div className="text-sm text-muted-foreground">For private sellers</div>
          </div>
          <div className="w-px h-10 bg-border/30 hidden sm:block" />
          <div className="text-center space-y-1">
            <div className="text-lg font-semibold tracking-tight text-[#0066FF]">VIN</div>
            <div className="text-sm text-muted-foreground">Every listing</div>
          </div>
          <div className="w-px h-10 bg-border/30 hidden sm:block" />
          <div className="text-center space-y-1">
            <div className="text-lg font-semibold tracking-tight text-[#0066FF]">Book</div>
            <div className="text-sm text-muted-foreground">Test drives</div>
          </div>
        </div>

      </div>
    </section>
  );
}