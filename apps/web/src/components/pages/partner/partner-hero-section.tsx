/**
 * Partner Hero Section - Revvup Partners Page
 * Clean, minimal hero following Revvup Design System
 * Matches home page hero style with masked video effect
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthRequired } from '@/hooks/use-auth-required';
import { AuthRequiredModal } from '@/components/auth/auth-required-modal';

function TrialButton() {
  const router = useRouter();
  const { isAuthenticated, showModal, openModal, closeModal } = useAuthRequired({
    feature: "start your free trial",
    redirectTo: "/user-dashboard/requests",
  });

  const handleClick = () => {
    if (isAuthenticated) {
      router.push('/user-dashboard/requests');
    } else {
      openModal();
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="w-full sm:w-auto h-11 px-8 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
      >
        Start 30-Day Free Trial
      </button>
      <AuthRequiredModal
        open={showModal}
        onClose={closeModal}
        feature="start your free trial"
        redirectTo="/user-dashboard/requests"
      />
    </>
  );
}

export function PartnerHeroSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Brand & Tagline */}
        <div className="text-center mb-8 space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            For Dealers
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            Keep 100%.
            <br />
            <span className="text-muted-foreground">Zero commission.</span>
          </h1>
          <p className="text-sm sm:text-base font-medium text-muted-foreground">
            Flat fee. Unlimited listings. Join the Revolution.
          </p>
        </div>

        {/* Main CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <TrialButton />
          <Link
            href="/pricing"
            className="w-full sm:w-auto h-11 px-8 bg-muted text-foreground text-sm font-semibold rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
          >
            See Pricing
          </Link>
        </div>

        {/* Hero Video */}
        <div className="relative w-full overflow-hidden rounded-lg mb-8">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            className="w-full h-auto"
          >
            <source src="/Marketing_Media/phero.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-12 md:gap-20 pt-8">
          <div className="text-center space-y-1">
            <p className="text-xl font-semibold tracking-tight text-primary">0%</p>
            <span className="text-sm text-muted-foreground">Commission</span>
          </div>
          <div className="w-px h-10 bg-border/30 hidden sm:block" />
          <div className="text-center space-y-1">
            <p className="text-xl font-semibold tracking-tight text-primary">∞</p>
            <span className="text-sm text-muted-foreground">Listings</span>
          </div>
          <div className="w-px h-10 bg-border/30 hidden sm:block" />
          <div className="text-center space-y-1">
            <p className="text-xl font-semibold tracking-tight text-primary">1</p>
            <span className="text-sm text-muted-foreground">Flat fee</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-center text-sm text-muted-foreground max-w-md mx-auto mt-8">
          No credit card required. List alongside any other platform.
        </p>

      </div>
    </section>
  );
}
