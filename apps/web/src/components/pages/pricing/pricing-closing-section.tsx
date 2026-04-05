/**
 * Pricing Closing Section
 * Final CTA - clear recommendation
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
        className="w-full sm:w-auto h-11 px-8 bg-primary text-primary-foreground text-subhead font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
      >
        Apply for Flow
      </button>
      <AuthRequiredModal open={showModal} onClose={closeModal} feature="apply for the Founding Dealer Program" redirectTo="/user-dashboard/requests" />
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
        className="w-full sm:w-auto h-11 px-8 bg-muted border border-border/40 text-foreground text-subhead font-semibold rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
      >
        Apply for Black
      </button>
      <AuthRequiredModal open={showModal} onClose={closeModal} feature="apply for Black" redirectTo="/user-dashboard/requests" />
    </>
  );
}

export function PricingClosingSection() {
  return (
    <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Final CTA */}
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
            Ready?
          </span>
          <h2 className="text-title2 sm:text-title1 lg:text-display font-semibold tracking-tight">
            Most dealers start with Flow.
            <br />
            <span className="text-muted-foreground">We’ll tell you if you need more.</span>
          </h2>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <FlowApplyButton />
            <BlackApplyButton />
          </div>
          
          <div className="pt-2">
            <Link
              href="/contact"
              className="text-subhead text-muted-foreground hover:text-foreground transition-colors"
            >
              Not sure which? Talk to us →
            </Link>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="flex items-center justify-center gap-12 md:gap-20 pt-16 mt-16 border-t border-border/40">
          <div className="text-center space-y-1">
            <div className="text-title2 font-semibold tracking-tight text-primary">0%</div>
            <div className="text-subhead text-muted-foreground">Commission</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-title2 font-semibold tracking-tight text-primary">∞</div>
            <div className="text-subhead text-muted-foreground">Per showroom</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-title2 font-semibold tracking-tight text-primary">0</div>
            <div className="text-subhead text-muted-foreground">Lock-ins</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-title2 font-semibold tracking-tight text-primary">0</div>
            <div className="text-subhead text-muted-foreground">Games</div>
          </div>
        </div>

        {/* Cross-link */}
        <div className="text-center mt-12">
          <Link
            href="/partner"
            className="text-subhead text-muted-foreground hover:text-primary transition-colors"
          >
            Learn more about partnering with Revvup →
          </Link>
        </div>

      </div>
    </section>
  );
}
