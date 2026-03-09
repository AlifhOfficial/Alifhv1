/**
 * Partner Closing Section - Revvup Partners Page
 * Strong close - video + CTA with pricing link
 */

'use client';

import Link from 'next/link';
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
        className="w-full sm:w-auto h-12 px-10 bg-primary text-primary-foreground text-base font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
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
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">

        {/* Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Ready?
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
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
    <MacOSWindow url="revvup.ae/partners" contentClassName="flex items-center justify-center min-h-[480px] sm:min-h-[560px] lg:min-h-[680px] p-6 sm:p-10 lg:p-16">
      <div className="text-center">
        <p className="text-5xl sm:text-7xl lg:text-9xl font-bold text-white tracking-tight">
          Your Move.
        </p>
      </div>
    </MacOSWindow>
  );
}
