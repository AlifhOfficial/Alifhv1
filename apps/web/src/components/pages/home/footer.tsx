/**
 * Footer - Alifh
 * Clean, minimal footer with logo
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function Footer() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use black logo as default, switch after mount to avoid hydration mismatch
  const logoSrc = mounted && (resolvedTheme === 'dark' || resolvedTheme === 'charcoal')
    ? "/assets/Alifh_logo_White.svg" 
    : "/assets/Alifh_logo_Black.svg";

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="flex flex-col md:flex-row justify-between gap-12">
          
          {/* Logo & Tagline */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src={logoSrc}
                alt="Alifh"
                width={80}
                height={24}
                className="h-6 w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground/70 max-w-xs">
              The UAE's most transparent car marketplace. No fees. No ads. Just cars.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Browse</p>
              <div className="space-y-2">
                <Link href="/listings" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  All Cars
                </Link>
                <Link href="/listings?type=new" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  New Cars
                </Link>
                <Link href="/listings?type=used" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Used Cars
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Company</p>
              <div className="space-y-2">
                <Link href="/about" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
                <Link href="/partner" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Partners
                </Link>
                <Link href="/contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Legal</p>
              <div className="space-y-2">
                <Link href="/privacy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Alifh. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made in the UAE 🇦🇪
          </p>
        </div>

      </div>
    </footer>
  );
}
