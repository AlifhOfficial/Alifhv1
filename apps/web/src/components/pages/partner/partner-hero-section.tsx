/**
 * Partner Hero Section - Revvup Partners Page
 * Clean, minimal hero following Revvup Design System
 * Matches home page hero style with masked video effect
 */

'use client';

import { MarketingImage as Image } from '@/components/pages/marketing-image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthRequired } from '@/hooks/use-auth-required';
import { AuthRequiredModal } from '@/components/auth/auth-required-modal';
import { homescreen } from '@/components/pages/marketing-image-assets';

function FoundingProgramButton() {
  const router = useRouter();
  const { isAuthenticated, showModal, openModal, closeModal } = useAuthRequired({
    feature: "apply for the Founding Dealer Program",
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
        className="w-full compact:w-auto h-11 px-8 bg-primary text-primary-foreground text-subhead font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
      >
        Apply for Founding Program
      </button>
      <AuthRequiredModal
        open={showModal}
        onClose={closeModal}
        feature="apply for the Founding Dealer Program"
        redirectTo="/user-dashboard/requests"
      />
    </>
  );
}

export function PartnerHeroSection() {
  return (
    <section className="pt-28 pb-20 px-4 compact:px-6 large:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Brand & Tagline */}
        <div className="text-center mb-8 space-y-5">
          <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
            For Dealers
          </span>
          <h1 className="text-title2 compact:text-title1 large:text-display font-semibold tracking-tight">
            Keep 100%.
            <br />
            <span className="text-muted-foreground">Zero commission.</span>
          </h1>
          <p className="text-subhead compact:text-callout text-muted-foreground">
            Flat fee. Unlimited listings. Join the Revolution.
          </p>
        </div>

        {/* Main CTAs */}
        <div className="flex flex-col compact:flex-row items-center justify-center gap-3 mb-16">
          <FoundingProgramButton />
          <Link
            href="/pricing"
            className="w-full compact:w-auto h-11 px-8 bg-muted text-foreground text-subhead font-semibold rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
          >
            See Pricing
          </Link>
        </div>

        {/* Hero Image */}
        <div className="relative w-full overflow-hidden rounded-lg mb-8">
          <Image
            src={homescreen}
            alt="Revvup - For Dealers"
            width={1600}
            height={900}
            priority
            className="w-full h-auto"
            sizes="(max-width: 1600px) 100vw, 1600px"
          />
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-8 compact:gap-12 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-title2 font-semibold tracking-tight text-primary mb-1">0%</div>
            <div className="text-subhead text-muted-foreground">Commission</div>
          </div>
          <div className="w-px h-10 bg-border/30" />
          <div className="text-center">
            <div className="text-title2 font-semibold tracking-tight text-primary mb-1">∞</div>
            <div className="text-subhead text-muted-foreground">Listings</div>
          </div>
          <div className="w-px h-10 bg-border/30" />
          <div className="text-center">
            <div className="text-title2 font-semibold tracking-tight text-primary mb-1">1</div>
            <div className="text-subhead text-muted-foreground">Flat fee</div>
          </div>
        </div>

        {/* Description */}
        <p className="text-center text-subhead text-muted-foreground max-w-md mx-auto mt-8">
          No credit card to get started. List alongside any other platform.
        </p>

      </div>
    </section>
  );
}
