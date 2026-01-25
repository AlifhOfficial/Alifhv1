/**
 * Pricing Tiers Section
 * Alifh Flow (recommended) vs Alifh Black (white-glove)
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthRequired } from '@/hooks/use-auth-required';
import { AuthRequiredModal } from '@/components/auth/auth-required-modal';

function FlowApplyButton() {
  const router = useRouter();
  const { isAuthenticated, showModal, openModal, closeModal } = useAuthRequired({
    feature: "apply for Flow",
    redirectTo: "/user-dashboard/requests",
  });

  return (
    <>
      <button
        onClick={() => isAuthenticated ? router.push('/user-dashboard/requests') : openModal()}
        className="w-full h-10 bg-[#0066FF] text-white text-sm font-medium rounded-lg hover:bg-[#0066FF]/90 transition-colors flex items-center justify-center"
      >
        Start with Flow
      </button>
      <AuthRequiredModal open={showModal} onClose={closeModal} feature="apply for Flow" redirectTo="/user-dashboard/requests" />
    </>
  );
}

function BlackApplyButton() {
  const router = useRouter();
  const { isAuthenticated, showModal, openModal, closeModal } = useAuthRequired({
    feature: "apply for Black",
    redirectTo: "/user-dashboard/requests",
  });

  return (
    <>
      <button
        onClick={() => isAuthenticated ? router.push('/user-dashboard/requests') : openModal()}
        className="w-full h-10 bg-muted border border-border text-foreground text-sm font-medium rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
      >
        Apply for Black
      </button>
      <AuthRequiredModal open={showModal} onClose={closeModal} feature="apply for Black" redirectTo="/user-dashboard/requests" />
    </>
  );
}

export function PricingTiersSection() {
  return (
    <section id="tiers" className="pt-12 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">

        {/* Two Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          
          {/* Flow Card */}
          <div className="p-8 rounded-xl bg-sidebar border border-border/40">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0066FF] mb-6">Flow</p>
            
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-3xl font-semibold tracking-tight text-foreground">AED 7,000</span>
              <span className="text-[13px] text-muted-foreground/60">/mo</span>
            </div>
            <p className="text-[13px] text-muted-foreground/60 mb-6">per showroom</p>
            
            <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
              Unlimited listings, bookings, leads, messaging, and analytics.
            </p>

            <FlowApplyButton />
          </div>

          {/* Black Card */}
          <div className="p-8 rounded-xl bg-sidebar border border-border/40">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground">Black</p>
              <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground/60 px-2 py-0.5 rounded-full border border-border/40">
                Limited spots
              </span>
            </div>
            
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-[13px] text-muted-foreground/60">from</span>
              <span className="text-3xl font-semibold tracking-tight text-foreground">AED 21,000</span>
              <span className="text-[13px] text-muted-foreground/60">/mo</span>
            </div>
            <p className="text-[13px] text-muted-foreground/60 mb-6">per showroom</p>
            
            <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
              Everything in Flow, plus custom branding, a dedicated showroom page, and white-glove support.
            </p>

            <BlackApplyButton />
          </div>

        </div>

        {/* Note */}
        <p className="text-center text-[13px] text-muted-foreground/60 mt-10 max-w-md mx-auto">
          Same features. Same platform. Same rankings. Black is branding—not advantage.
        </p>

      </div>
    </section>
  );
}
