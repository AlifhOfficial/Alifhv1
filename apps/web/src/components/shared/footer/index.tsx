/**
 * Footer Component - Revvup
 * Clean, minimal, modern
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthRequired } from '@/hooks/use-auth-required';
import { AuthRequiredModal } from '@/components/auth/auth-required-modal';
import { Logo } from '@/components/shared/logo';

function SellLink({ className }: { className?: string }) {
  const router = useRouter();
  const { isAuthenticated, showModal, openModal, closeModal } = useAuthRequired({
    feature: "create listings",
    redirectTo: "/user-dashboard/listings/new",
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      router.push('/user-dashboard/listings/new');
    } else {
      openModal();
    }
  };

  return (
    <>
      <a href="/user-dashboard/listings/new" onClick={handleClick} className={className}>
        Sell
      </a>
      <AuthRequiredModal
        open={showModal}
        onClose={closeModal}
        feature="create listings"
        redirectTo="/user-dashboard/listings/new"
      />
    </>
  );
}

export function Footer() {
  const link = "text-sm text-muted-foreground hover:text-foreground transition-colors font-medium";

  return (
    <footer className="bg-sidebar rounded-t-3xl mt-16 sm:mt-20 lg:mt-24">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-10 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            
            {/* Brand - Takes more space */}
            <div className="lg:col-span-4 space-y-3">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
                Revvup
              </p>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                More than a marketplace. Join the Revolution.
              </p>
            </div>

            {/* Links Grid - Takes remaining space */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
              
              {/* Browse */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Browse</p>
                <div className="flex flex-col gap-3">
                  <Link href="/listings" className={link}>Cars</Link>
                  <SellLink className={link} />
                  <Link href="/black" className={link}>Black</Link>
                </div>
              </div>
              
              {/* Partners */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Partners</p>
                <div className="flex flex-col gap-3">
                  <Link href="/partner" className={link}>Become a Partner</Link>
                  <Link href="/pricing" className={link}>Pricing</Link>
                </div>
              </div>

              {/* Company */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Company</p>
                <div className="flex flex-col gap-3">
                  <Link href="/about" className={link}>About</Link>
                  <Link href="/vision" className={link}>Vision 2031</Link>
                  <Link href="/faq" className={link}>FAQ</Link>
                  <Link href="/contact" className={link}>Contact</Link>
                </div>
              </div>
              
              {/* Legal */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Legal</p>
                <div className="flex flex-col gap-3">
                  <Link href="/terms-of-service" className={link}>Terms</Link>
                  <Link href="/privacy-policy" className={link}>Privacy</Link>
                  <Link href="/refund-policy" className={link}>Refunds</Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar - No border, lighter separation */}
        <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-muted-foreground/70 font-medium">
            © {new Date().getFullYear()} AISH CAPITALS FZCO · Dubai, UAE
          </p>
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <Link href="/dealer-agreement" className="text-xs text-muted-foreground/70 hover:text-foreground transition-colors font-medium">
              Dealer Agreement
            </Link>
            <Link href="/acceptable-use-policy" className="text-xs text-muted-foreground/70 hover:text-foreground transition-colors font-medium">
              Acceptable Use
            </Link>
            <Link href="/intellectual-property" className="text-xs text-muted-foreground/70 hover:text-foreground transition-colors font-medium">
              IP Policy
            </Link>
            <Link href="/disclaimer" className="text-xs text-muted-foreground/70 hover:text-foreground transition-colors font-medium">
              Disclaimer
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
