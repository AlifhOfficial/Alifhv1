/**
 * Footer - Alifh
 * Minimal, clean footer
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

  const logoSrc = mounted && (resolvedTheme === 'dark' || resolvedTheme === 'charcoal')
    ? "/assets/Alifh_logo_White.svg" 
    : "/assets/Alifh_logo_Black.svg";

  return (
    <footer className="bg-background">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12 mb-16">
          
          {/* Brand */}
          <div className="space-y-4 max-w-sm">
            <Link href="/" className="inline-block">
              <Image
                src={logoSrc}
                alt="Alifh"
                width={100}
                height={30}
                className="h-6 w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Where quality beats ads.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-16 gap-y-8">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Browse</p>
              <div className="flex flex-col gap-2">
                <Link href="/listings" className="text-sm text-foreground hover:text-[#0066FF] transition-colors">All Cars</Link>
                <Link href="/user-dashboard/listings/new" className="text-sm text-foreground hover:text-[#0066FF] transition-colors">Sell Your Car</Link>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">For Dealers</p>
              <div className="flex flex-col gap-2">
                <Link href="/partner" className="text-sm text-foreground hover:text-[#0066FF] transition-colors">Partner With Us</Link>
                <Link href="/pricing" className="text-sm text-foreground hover:text-[#0066FF] transition-colors">Pricing</Link>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Company</p>
              <div className="flex flex-col gap-2">
                <Link href="/about" className="text-sm text-foreground hover:text-[#0066FF] transition-colors">About</Link>
                <Link href="/vision" className="text-sm text-foreground hover:text-[#0066FF] transition-colors">Our Vision</Link>
                <Link href="/contact" className="text-sm text-foreground hover:text-[#0066FF] transition-colors">Contact</Link>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Legal</p>
              <div className="flex flex-col gap-2">
                <Link href="/terms-of-service" className="text-sm text-foreground hover:text-[#0066FF] transition-colors">Terms of Service</Link>
                <Link href="/privacy-policy" className="text-sm text-foreground hover:text-[#0066FF] transition-colors">Privacy Policy</Link>
                <Link href="/dealer-agreement" className="text-sm text-foreground hover:text-[#0066FF] transition-colors">Dealer Agreement</Link>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Policies</p>
              <div className="flex flex-col gap-2">
                <Link href="/refund-policy" className="text-sm text-foreground hover:text-[#0066FF] transition-colors">Refund Policy</Link>
                <Link href="/acceptable-use-policy" className="text-sm text-foreground hover:text-[#0066FF] transition-colors">Acceptable Use</Link>
                <Link href="/intellectual-property" className="text-sm text-foreground hover:text-[#0066FF] transition-colors">Intellectual Property</Link>
                <Link href="/disclaimer" className="text-sm text-foreground hover:text-[#0066FF] transition-colors">Disclaimer</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-border/40">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Alifh. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Dubai, UAE 🇦🇪
          </p>
        </div>
      </div>
    </footer>
  );
}
