/**
 * Closing Section - Revvup Home Page
 * Consistent with Hero Section design patterns
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { useAuthRequired } from '@/hooks/use-auth-required';
import { AuthRequiredModal } from '@/components/auth/auth-required-modal';
import { MacOSWindow } from '@/components/ui/macos-window';
import { getStaticUrl } from '@/utils';

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

export function ClosingSection() {
  return (
    <section className="relative bg-background">

      {/* Section 1: Philosophy with Infographic */}
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Built by car people
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
              We get it.
            </h2>
          </div>

          {/* Infographic */}
          <div className="mb-12">
            <CarPeopleInfographic />
          </div>

          {/* Description */}
          <p className="text-base text-muted-foreground max-w-lg mx-auto text-center mb-12 leading-relaxed">
            We built the marketplace we wished existed. No fees, no clutter, just cars.
          </p>

          {/* Principles */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-12">
            <span className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />Free for private sellers
            </span>
            <span className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />New & used cars
            </span>
            <span className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />Based in Dubai
            </span>
          </div>

          {/* CTA - Main page CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/listings"
              className="w-full sm:w-auto h-11 px-8 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
            >
              Browse Cars
            </Link>
            <SellButton />
          </div>
        </div>
      </div>

    </section>
  );
}

// ============================================================================
// INFOGRAPHIC: Car People - Video in macOS window
// ============================================================================

function CarPeopleInfographic() {
  return (
    <MacOSWindow url="revvup.ae" contentClassName="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[2.4/1]">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
      >
        <source src={getStaticUrl("/Marketing/classiccar.mp4")} type="video/mp4" />
      </video>
    </MacOSWindow>
  );
}
