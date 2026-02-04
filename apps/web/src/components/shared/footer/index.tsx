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
  const link = "text-sm text-muted-foreground hover:text-foreground transition-colors";

  return (
    <footer>
      {/* Main Footer Content - Background color with rounded bottom */}
      <div className="bg-sidebar">
        <div className="bg-background rounded-b-3xl">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-16 lg:py-20">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12 lg:gap-20">
            
                {/* Brand */}
                <div className="lg:max-w-md space-y-6">
                  <Link href="/">
                    <Logo className="h-7" priority />
                  </Link>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-[-0.03em] text-foreground italic">
                    Revvup
                  </p>
                  <p className="text-sm text-muted-foreground">
                    More than a marketplace. Join the Revolution.
                  </p>
                </div>

                {/* Links Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12 lg:gap-16">
              
                  {/* Browse */}
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-foreground">Browse</p>
                    <div className="flex flex-col gap-3">
                      <Link href="/listings" className={link}>Cars</Link>
                      <SellLink className={link} />
                      <Link href="/black" className={link}>Black</Link>
                    </div>
                  </div>
              
                  {/* Partners */}
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-foreground">Partners</p>
                    <div className="flex flex-col gap-3">
                      <Link href="/partner" className={link}>Become a Partner</Link>
                      <Link href="/pricing" className={link}>Pricing</Link>
                    </div>
                  </div>

                  {/* Company */}
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-foreground">Company</p>
                    <div className="flex flex-col gap-3">
                      <Link href="/about" className={link}>About</Link>
                      <Link href="/vision" className={link}>Vision 2031</Link>
                      <Link href="/faq" className={link}>FAQ</Link>
                      <Link href="/contact" className={link}>Contact</Link>
                    </div>
                  </div>
              
                  {/* Legal */}
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-foreground">Legal</p>
                    <div className="flex flex-col gap-3">
                      <Link href="/terms-of-service" className={link}>Terms</Link>
                      <Link href="/privacy-policy" className={link}>Privacy</Link>
                      <Link href="/refund-policy" className={link}>Refunds</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar - Sidebar color */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-sidebar-foreground/70">
              © {new Date().getFullYear()} AISH CAPITALS FZCO · Dubai, UAE
            </p>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <Link href="/dealer-agreement" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                Dealer Agreement
              </Link>
              <Link href="/acceptable-use-policy" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                Acceptable Use
              </Link>
              <Link href="/intellectual-property" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                IP Policy
              </Link>
              <Link href="/disclaimer" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                Disclaimer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
