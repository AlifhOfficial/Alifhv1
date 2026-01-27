/**
 * Partner Hero Section - Alifh Partners Page
 * Strong visual hook - direct, confident, no fluff
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthRequired } from '@/hooks/use-auth-required';
import { AuthRequiredModal } from '@/components/auth/auth-required-modal';

// ============================================================================
// INFOGRAPHIC: Partner Hero - Listing UI video showcase
// ============================================================================

function HeroInfographic() {
  return (
    <div className="relative w-full aspect-[16/9] sm:aspect-[2.2/1] rounded-lg overflow-hidden bg-sidebar border border-border/40 p-3 sm:p-5 lg:p-8">
      {/* Listing UI video - full width showcase */}
      <div className="relative w-full h-full rounded-lg overflow-hidden border border-border/30 shadow-2xl">
        <video 
          src="/Marketing/lisitng.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover object-top"
        />
      </div>
      
      {/* Subtle label */}
      <div className="absolute bottom-5 sm:bottom-7 lg:bottom-10 left-1/2 -translate-x-1/2">
        <span className="px-3 sm:px-4 py-1.5 rounded-full bg-background/90 backdrop-blur-sm border border-border/50 text-[10px] sm:text-xs font-medium text-muted-foreground shadow-lg">
          Your listings look this good
        </span>
      </div>
    </div>
  );
}

function ApplyButton() {
  const router = useRouter();
  const { isAuthenticated, showModal, openModal, closeModal } = useAuthRequired({
    feature: "apply to become a partner",
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
        className="w-full sm:w-auto h-12 px-10 bg-primary text-primary-foreground text-base font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
      >
        Apply to Partner
      </button>
      <AuthRequiredModal
        open={showModal}
        onClose={closeModal}
        feature="apply to become a partner"
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
        <div className="text-center mb-16 space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            For Dealers
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
            They take. We don't.
            <br />
            <span className="text-muted-foreground">Simple as that.</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            Zero commission. Flat monthly fee. Everything included.
          </p>
        </div>

        {/* Main CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <ApplyButton />
          <Link
            href="/pricing"
            className="w-full sm:w-auto h-12 px-10 bg-muted text-foreground text-base font-semibold rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
          >
            See Pricing
          </Link>
        </div>

        {/* Hero Infographic */}
        <div className="mb-16">
          <HeroInfographic />
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-12 md:gap-20 pt-8 border-t border-border/40">
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold tracking-tight text-primary">0%</div>
            <div className="text-sm text-muted-foreground">Commission</div>
          </div>
          <div className="w-px h-10 bg-border/30 hidden sm:block" />
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold tracking-tight text-primary">∞</div>
            <div className="text-sm text-muted-foreground">Listings</div>
          </div>
          <div className="w-px h-10 bg-border/30 hidden sm:block" />
          <div className="text-center space-y-1">
            <div className="text-3xl font-bold tracking-tight text-primary">0</div>
            <div className="text-sm text-muted-foreground">Cars we sell</div>
          </div>
        </div>

      </div>
    </section>
  );
}
