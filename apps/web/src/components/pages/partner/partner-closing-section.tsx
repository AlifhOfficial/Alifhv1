/**
 * Partner Closing Section - Revvup Partners Page
 * Strong close - video + CTA with pricing link
 */

'use client';

import { useRouter } from 'next/navigation';
import { useAuthRequired } from '@/hooks/use-auth-required';
import { AuthRequiredModal } from '@/components/auth/auth-required-modal';
import { MacOSWindow } from '@/components/ui/macos-window';

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
        className="w-full compact:w-auto h-12 px-10 bg-primary text-primary-foreground text-callout font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
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

export function PartnerClosingSection() {
  return (
    <section className="pt-28 pb-20 px-4 compact:px-6 large:px-8">
      <div className="max-w-[1600px] mx-auto">

        {/* Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
            Ready?
          </span>
          <h2 className="text-title2 compact:text-title1 large:text-display font-semibold tracking-tight">
            Join the Founding Program.
            <br />
            <span className="text-muted-foreground">Limited spots. Shape the platform.</span>
          </h2>
        </div>

        {/* Infographic */}
        <JoinRevvupInfographic />

        {/* CTA Button */}
        <div className="flex justify-center mt-12">
          <FoundingProgramButton />
        </div>

      </div>
    </section>
  );
}

// ============================================================================
// INFOGRAPHIC: Join Revvup - Encouraging macOS window
// ============================================================================

function JoinRevvupInfographic() {
  return (
    <MacOSWindow url="revvup.ae/partners" contentClassName="flex items-center justify-center min-h-[300px] compact:min-h-[400px] large:min-h-[560px] xlarge:min-h-[680px] p-4 compact:p-8 large:p-16">
      <div className="text-center">
        <p className="text-title1 compact:text-display1 large:text-display3 xlarge:text-display5 font-bold text-white tracking-tight">
          Your Move.
        </p>
      </div>
    </MacOSWindow>
  );
}
