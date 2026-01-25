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
        className="w-full sm:w-auto h-11 px-8 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0066FF]">
            For Dealers
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground tracking-tight leading-[1.15]">
            They take. We don't.
            <br />
            <span className="text-muted-foreground/60">Simple as that.</span>
          </h1>
          <p className="text-[15px] text-muted-foreground leading-relaxed max-w-md mx-auto">
            Zero commission. Flat monthly fee. Everything included.
          </p>
        </div>

        {/* Main CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <ApplyButton />
          <Link
            href="/pricing"
            className="w-full sm:w-auto h-11 px-8 bg-muted text-foreground text-sm font-medium rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
          >
            See Pricing
          </Link>
        </div>

        {/* Hero Image */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[2.4/1] overflow-hidden rounded-lg mb-16">
          <Image
            src="/Abstract/rsxx2.png"
            alt="Partner with Alifh"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1400px) 100vw, 1400px"
          />
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-12 md:gap-20 pt-8 border-t border-border/40">
          <div className="text-center space-y-1">
            <div className="text-xl font-bold tracking-tight text-[#0066FF]">0%</div>
            <div className="text-[13px] text-muted-foreground">Commission</div>
          </div>
          <div className="w-px h-10 bg-border/30 hidden sm:block" />
          <div className="text-center space-y-1">
            <div className="text-xl font-bold tracking-tight text-[#0066FF]">∞</div>
            <div className="text-[13px] text-muted-foreground">Listings</div>
          </div>
          <div className="w-px h-10 bg-border/30 hidden sm:block" />
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold tracking-tight text-[#0066FF]">0</div>
            <div className="text-[13px] text-muted-foreground">Cars we sell</div>
          </div>
        </div>

      </div>
    </section>
  );
}
