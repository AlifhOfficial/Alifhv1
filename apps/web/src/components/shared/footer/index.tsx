/**
 * Footer Component - Alifh
 * Clean, minimal, modern
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { useAuthRequired } from '@/hooks/use-auth-required';
import { AuthRequiredModal } from '@/components/auth/auth-required-modal';

// Mounted state store
const mountedStore = {
  value: false,
  listeners: new Set<() => void>(),
  subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  },
  getSnapshot() {
    return mountedStore.value;
  },
  getServerSnapshot() {
    return false;
  },
};

if (typeof window !== 'undefined') {
  mountedStore.value = true;
}

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
  const { resolvedTheme } = useTheme();
  
  const mounted = useSyncExternalStore(
    mountedStore.subscribe.bind(mountedStore),
    mountedStore.getSnapshot,
    mountedStore.getServerSnapshot
  );

  const isDark = mounted && (resolvedTheme === 'dark' || resolvedTheme === 'charcoal');
  const logoSrc = isDark ? "/assets/Alifh_logo_White.svg" : "/assets/Alifh_logo_Black.svg";
  const link = "text-sm text-muted-foreground hover:text-foreground transition-colors";

  return (
    <footer className="border-t border-border/40">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12 lg:gap-20">
            
            {/* Brand */}
            <div className="lg:max-w-md space-y-6">
              <Link href="/">
                <Image src={logoSrc} alt="Alifh" width={100} height={30} className="h-7 w-auto" priority />
              </Link>
              <p className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                Alifh
              </p>
              <p className="text-sm text-muted-foreground">
                Free car listings in UAE.
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

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} AISH CAPITALS FZCO · Dubai, UAE
          </p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link href="/dealer-agreement" className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
              Dealer Agreement
            </Link>
            <Link href="/acceptable-use-policy" className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
              Acceptable Use
            </Link>
            <Link href="/intellectual-property" className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
              IP Policy
            </Link>
            <Link href="/disclaimer" className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
              Disclaimer
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
