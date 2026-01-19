/**
 * Disclaimer Page
 * Legal documentation component following Alifh design patterns
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function Disclaimer() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc = mounted && (resolvedTheme === 'dark' || resolvedTheme === 'charcoal')
    ? "/assets/Alifh_logo_White.svg" 
    : "/assets/Alifh_logo_Black.svg";

  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="text-center mb-8">
            <Image
              src={logoSrc}
              alt="Alifh"
              width={120}
              height={36}
              className="h-8 w-auto mx-auto mb-6"
            />
            <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-2">
              Disclaimer
            </h1>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Legal Agreement
            </p>
          </div>
          
          {/* Entity Info */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Owner & Operator</p>
              <p className="text-sm font-medium text-foreground">AISH CAPITALS FZCO</p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-border/40" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Country</p>
              <p className="text-sm font-medium text-foreground">United Arab Emirates</p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-border/40" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Governing Law</p>
              <p className="text-sm font-medium text-foreground">Laws of the UAE</p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-border/40" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
              <p className="text-sm font-medium text-foreground">January 2026</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto mt-12">
          
          {/* Disclaimer Content */}
          <div className="space-y-8">
            
            <div className="p-8 border-l-2 border-border/60 bg-background/50">
              <p className="text-sm text-foreground leading-relaxed mb-4">
                ALIFH is a technology platform operated by AISH CAPITALS FZCO. We do not buy, sell, own, or take custody of any items listed on the Platform, and do not inspect, verify, or certify the condition, history, legality, pricing, or accuracy of any listings.
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                ALIFH is not a party to, and bears no responsibility for, any transaction, payment, agreement, or arrangement made between users. All transactions and interactions occur solely between the involved parties. Listings are published by independent dealers or users, who are solely responsible for the content, representations, and compliance with applicable laws and regulations.
              </p>
            </div>

            <div className="p-8 border-l-2 border-border/60 bg-background/50">
              <p className="text-sm text-foreground leading-relaxed mb-4">
                Use of the Platform is at your own discretion and risk. ALIFH does not guarantee any outcomes, results, availability, leads, or transactions arising from use of the Platform.
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                This Disclaimer should be read together with our <Link href="/terms-of-service" className="text-primary hover:underline">Terms of Service</Link>, <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>, and <Link href="/acceptable-use-policy" className="text-primary hover:underline">Acceptable Use Policy</Link>.
              </p>
            </div>

          </div>

          {/* Footer */}
          <div className="mt-20 pt-8 border-t border-border/60">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                AISH CAPITALS FZCO © 2026 All rights reserved.
              </p>
              <Link 
                href="/" 
                className="text-xs text-foreground hover:text-primary transition-colors font-medium"
              >
                Back to Home
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
