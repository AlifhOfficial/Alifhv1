/**
 * Pricing Tiers Section
 * Revvup Flow (recommended) vs Revvup Black (white-glove)
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthRequired } from '@/hooks/use-auth-required';
import { AuthRequiredModal } from '@/components/auth/auth-required-modal';

function FlowApplyButton() {
  const router = useRouter();
  const { isAuthenticated, showModal, openModal, closeModal } = useAuthRequired({
    feature: "apply for the Founding Dealer Program",
    redirectTo: "/user-dashboard/requests",
  });

  return (
    <>
      <button
        onClick={() => isAuthenticated ? router.push('/user-dashboard/requests') : openModal()}
        className="w-full h-11 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
      >
        Apply for Founding Program
      </button>
      <AuthRequiredModal open={showModal} onClose={closeModal} feature="apply for the Founding Dealer Program" redirectTo="/user-dashboard/requests" />
    </>
  );
}

function BlackContactButton() {
  return (
    <Link
      href="/contact?type=dealer&plan=black"
      className="w-full h-11 bg-muted border border-border text-foreground text-sm font-semibold rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
    >
      Contact Us
    </Link>
  );
}

export function PricingTiersSection() {
  return (
    <section id="tiers" className="pt-12 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">

        {/* Two Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          
          {/* Flow Card */}
          <div className="p-8 rounded-xl bg-sidebar border border-border/40 flex flex-col">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary mb-6 block">Flow</span>
            
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-3xl font-semibold tracking-tight">AED 7,000</span>
              <span className="text-sm text-muted-foreground">/mo</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">per showroom</p>
            
            <p className="text-base text-muted-foreground leading-relaxed mb-2 flex-1">
              Unlimited listings, bookings, leads, messaging, and analytics.
            </p>
            <p className="text-xs text-primary mb-6">
              Most dealers start here.
            </p>

            <FlowApplyButton />
          </div>

          {/* Black Card */}
          <div className="p-8 rounded-xl bg-sidebar border border-border/40 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-semibold uppercase tracking-wider">Black</span>
              <span className="text-xs uppercase tracking-wider font-medium text-muted-foreground px-2 py-0.5 rounded-full border border-border/40">
                Limited spots
              </span>
            </div>
            
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-sm text-muted-foreground">from</span>
              <span className="text-3xl font-semibold tracking-tight">AED 21,000</span>
              <span className="text-sm text-muted-foreground">/mo</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">per showroom</p>
            
            <p className="text-base text-muted-foreground leading-relaxed mb-2 flex-1">
              Everything in Flow, plus premium branding and dedicated support.
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              For established showrooms.
            </p>

            <BlackContactButton />
          </div>

        </div>

        {/* Note */}
        <p className="text-center text-sm text-muted-foreground mt-10 max-w-md mx-auto">
          Three months full access. No credit card. Founding partners secure a locked rate.
        </p>
        
        {/* Link to Partner Page */}
        <div className="text-center mt-6">
          <Link
            href="/partner"
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            See all platform features →
          </Link>
        </div>

      </div>
    </section>
  );
}
