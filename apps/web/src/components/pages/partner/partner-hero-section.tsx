/**
 * Partner Hero Section - Revvup Partners Page
 * Strong visual hook - direct, confident, no fluff
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthRequired } from '@/hooks/use-auth-required';
import { AuthRequiredModal } from '@/components/auth/auth-required-modal';

// ============================================================================
// VIDEO SHOWCASE
// ============================================================================

function HeroVideo() {
  return (
    <div className="relative w-full max-w-5xl mx-auto">
      <video 
        src="/Marketing/Hero2.mp4" 
        autoPlay 
        loop 
        muted 
        playsInline
        className="w-full h-auto rounded-xl"
      />
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
        className="w-full sm:w-auto h-11 px-8 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            Keep 100%.
            <br />
            <span className="text-muted-foreground">Zero commission.</span>
          </h1>
          <p className="text-base text-muted-foreground">
            Flat fee. Unlimited listings.
          </p>
        </div>

        {/* Main CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <ApplyButton />
          <Link
            href="/pricing"
            className="w-full sm:w-auto h-11 px-8 bg-muted text-foreground text-sm font-semibold rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
          >
            See Pricing
          </Link>
        </div>

        {/* Hero Infographic - MacBook-style Video Frame */}
        <div className="mb-16">
          <HeroVideo />
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
            <div className="text-2xl font-bold tracking-tight text-primary">1</div>
            <div className="text-sm text-muted-foreground">Flat fee</div>
          </div>
        </div>

      </div>
    </section>
  );
}
