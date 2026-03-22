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
      className="w-full h-11 bg-foreground text-background text-sm font-semibold rounded-lg hover:bg-foreground/90 transition-colors flex items-center justify-center"
    >
      Contact Us
    </Link>
  );
}

export function PricingTiersSection() {
  return (
    <section id="tiers" className="pt-16 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">

        {/* Founding Program callout */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
            <span>
              <span className="font-semibold text-foreground">Founding Dealer Program</span>
              {' '}— Three months full access. No credit card. Direct line to our team.
            </span>
          </span>
        </div>

        {/* Two Cards */}
        <div className="grid md:grid-cols-2 gap-px max-w-4xl mx-auto border border-border/40 rounded-xl overflow-hidden">

          {/* Flow Card */}
          <div className="p-10 bg-sidebar flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">Flow</span>
              <span className="text-xs font-semibold text-primary">Recommended</span>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-semibold tracking-tight">AED 7,000</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 uppercase tracking-wider font-medium">per showroom</p>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed flex-1">
              Unlimited listings, bookings, leads, messaging, and analytics. Every feature we offer — nothing locked behind a higher tier.
            </p>

            <FlowApplyButton />
          </div>

          {/* Black Card */}
          <div className="p-10 bg-sidebar flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest">Black</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Limited spots</span>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs text-muted-foreground">from</span>
                <span className="text-4xl font-semibold tracking-tight">AED 21,000</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 uppercase tracking-wider font-medium">per showroom</p>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed flex-1">
              Everything in Flow, plus premium brand presence, custom showroom page, and a dedicated support line.
            </p>

            <BlackContactButton />
          </div>

        </div>

        {/* Footer notes */}
        <div className="text-center mt-10 max-w-lg mx-auto space-y-2">
          <p className="text-xs text-muted-foreground">
            Pricing may change as we scale. Limited rate-lock spots available for early commitments.
          </p>
          <Link
            href="/partner"
            className="inline-block text-sm text-primary hover:text-primary/80 transition-colors mt-2"
          >
            See all platform features →
          </Link>
        </div>

      </div>
    </section>
  );
}
