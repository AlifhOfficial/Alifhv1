/**
 * Partner Closing Section - Alifh Partners Page
 * Strong close - video + CTA with pricing link
 */

'use client';

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
        className="w-full sm:w-auto h-12 px-10 bg-muted text-foreground text-base font-semibold rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
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

export function PartnerClosingSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Video Showcase */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            See it in action
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            Clean. Fast. Simple.
            <br />
            <span className="text-muted-foreground">The way it should be.</span>
          </h2>
        </div>

        {/* Video Container */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[2.4/1] overflow-hidden rounded-lg mb-20">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/video/hero1x.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Final CTA Section */}
        <div className="text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            Ready to stop playing games?
          </h2>
          <p className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Two options. Same platform. Same features. Different levels of attention.
            Most dealers start with Flow.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/pricing"
              className="w-full sm:w-auto h-12 px-10 bg-primary text-primary-foreground text-base font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
            >
              See Pricing
            </Link>
            <ApplyButton />
          </div>
          
          <div className="pt-4">
            <Link
              href="/contact"
              className="text-base text-muted-foreground hover:text-foreground transition-colors"
            >
              Have questions? Talk to us →
            </Link>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="flex items-center justify-center gap-10 md:gap-16 pt-16 mt-16 border-t border-border/40">
          <div className="text-center space-y-1">
            <div className="text-3xl font-bold tracking-tight text-primary">0%</div>
            <div className="text-sm text-muted-foreground">Commission</div>
          </div>
          <div className="w-px h-10 bg-border/30 hidden sm:block" />
          <div className="text-center space-y-1">
            <div className="text-3xl font-bold tracking-tight text-primary">∞</div>
            <div className="text-sm text-muted-foreground">Listings</div>
          </div>
          <div className="w-px h-10 bg-border/30 hidden sm:block" />
          <div className="text-center space-y-1">
            <div className="text-3xl font-bold tracking-tight text-primary">1</div>
            <div className="text-sm text-muted-foreground">Flat fee</div>
          </div>
          <div className="w-px h-10 bg-border/30 hidden sm:block" />
          <div className="text-center space-y-1">
            <div className="text-3xl font-bold tracking-tight text-primary">0</div>
            <div className="text-sm text-muted-foreground">Games</div>
          </div>
        </div>

      </div>
    </section>
  );
}
