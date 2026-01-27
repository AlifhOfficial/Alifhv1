/**
 * Footer - Alifh Design System
 * Clean, minimal footer following profile/settings typography
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useAuthRequired } from '@/hooks/use-auth-required';
import { AuthRequiredModal } from '@/components/auth/auth-required-modal';

function SellLink() {
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
      <a 
        href="/user-dashboard/listings/new" 
        onClick={handleClick}
        className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        Sell Your Car
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
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc = mounted && (resolvedTheme === 'dark' || resolvedTheme === 'charcoal')
    ? "/assets/Alifh_logo_White.svg" 
    : "/assets/Alifh_logo_Black.svg";

  return (
    <footer className="bg-background border-t border-border/40">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        
        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand - Takes full width on mobile, 1 col on lg */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 space-y-4 mb-4 lg:mb-0">
            <Link href="/" className="inline-block">
              <Image
                src={logoSrc}
                alt="Alifh"
                width={100}
                height={30}
                className="h-5 w-auto"
              />
            </Link>
            <p className="text-xs text-muted-foreground font-medium max-w-[200px]">
              Where quality beats ads.
            </p>
            <p className="text-xs text-muted-foreground">
              Dubai, UAE 🇦🇪
            </p>
          </div>

          {/* Browse */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-foreground">Browse</p>
            <div className="flex flex-col gap-2.5">
              <Link href="/listings" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">All Cars</Link>
              <SellLink />
            </div>
          </div>
          
          {/* Dealers */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-foreground">Dealers</p>
            <div className="flex flex-col gap-2.5">
              <Link href="/partner" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Partner With Us</Link>
              <Link href="/pricing" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-foreground">Company</p>
            <div className="flex flex-col gap-2.5">
              <Link href="/about" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link href="/vision" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Our Vision</Link>
              <Link href="/how-ranking-works" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">How Ranking Works</Link>
              <Link href="/faq" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
              <Link href="/contact" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
          
          {/* Legal - Consolidated */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-foreground">Legal</p>
            <div className="flex flex-col gap-2.5">
              <Link href="/terms-of-service" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
              <Link href="/privacy-policy" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/dealer-agreement" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Dealer Agreement</Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-10 mt-10 border-t border-border/40">
          <p className="text-xs text-muted-foreground/70 font-medium">
            © {new Date().getFullYear()} AISH CAPITALS FZCO. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/refund-policy" className="text-xs text-muted-foreground/70 font-medium hover:text-muted-foreground transition-colors">Refunds</Link>
            <Link href="/acceptable-use-policy" className="text-xs text-muted-foreground/70 font-medium hover:text-muted-foreground transition-colors">Acceptable Use</Link>
            <Link href="/disclaimer" className="text-xs text-muted-foreground/70 font-medium hover:text-muted-foreground transition-colors">Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
