/**
 * Intellectual Property & Copyright Notice Page
 * Legal documentation component following Alifh design patterns
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function IntellectualProperty() {
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
              Intellectual Property & Copyright Notice
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
          
          {/* Introduction */}
          <div className="mb-16 p-8 border-l-2 border-border/60 bg-background/50">
            <p className="text-sm text-foreground leading-relaxed mb-3">
              This Intellectual Property & Copyright Notice ("Notice") governs ownership, licensing, 
              and permitted use of the ALIFH platform, website, and related services (collectively, 
              the "Platform").
            </p>
            <p className="text-sm text-foreground leading-relaxed mb-3">
              This Notice forms an integral part of the <Link href="/terms-of-service" className="text-primary hover:underline">ALIFH Terms of Service</Link> and applies to all 
              users, dealers, visitors, and registered accounts accessing or using the Platform.
            </p>
            <p className="text-sm text-muted-foreground text-xs">
              Related Policies: <Link href="/dealer-agreement" className="text-primary hover:underline">Dealer Agreement</Link> · <Link href="/acceptable-use-policy" className="text-primary hover:underline">Acceptable Use Policy</Link>
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-16">
            
            {/* 1. Ownership */}
            <section id="ownership">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                1. Ownership
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  ALIFH is a proprietary platform owned and operated by AISH CAPITALS FZCO, a company 
                  incorporated in the United Arab Emirates.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  All intellectual property rights in and to the Platform, including but not limited 
                  to software, source code, system architecture, databases, algorithms, workflows, 
                  user interface (UI), design language, visual elements, branding, trademarks, logos, 
                  documentation, platform structure, and underlying systems (collectively, the 
                  "Platform IP"), are owned exclusively by AISH CAPITALS FZCO, unless explicitly 
                  stated otherwise.
                </p>
              </div>
            </section>

            {/* 2. License to Use the Platform */}
            <section id="license">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                2. License to Use the Platform
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  Subject to compliance with the ALIFH Terms of Service, ALIFH grants users a limited, 
                  non-exclusive, non-transferable, non-sublicensable, and revocable license to access 
                  and use the Platform solely for its intended purposes.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  For dealers, such license applies only during an active subscription period.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  No ownership, proprietary interest, or intellectual property rights of any kind are 
                  transferred under any circumstances.
                </p>
              </div>
            </section>

            {/* 3. Restrictions */}
            <section id="restrictions">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                3. Restrictions
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  Users and dealers may not, directly or indirectly:
                </p>
                <ul className="space-y-2 pl-6">
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Copy, reproduce, modify, adapt, or create derivative works of the Platform or any 
                    portion thereof
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Reverse engineer, decompile, disassemble, or attempt to extract source code or 
                    underlying systems
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Scrape, collect, replicate, mirror, or reuse Platform data, structure, or 
                    presentation without authorization
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Sell, resell, sublicense, lease, or commercially exploit the Platform or any of 
                    its components
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Remove, obscure, or alter any copyright, trademark, or proprietary notices
                  </li>
                </ul>
                <p className="text-sm text-foreground leading-relaxed">
                  Any unauthorized use constitutes a material violation of this Notice and the ALIFH 
                  Terms of Service.
                </p>
              </div>
            </section>

            {/* 4. Enforcement */}
            <section id="enforcement">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                4. Enforcement
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  AISH CAPITALS FZCO reserves the right to protect and enforce its intellectual 
                  property rights in accordance with applicable law, including by taking appropriate 
                  legal action and by restricting, suspending, or terminating access to the Platform 
                  where necessary.
                </p>
              </div>
            </section>

            {/* 5. Reservation of Rights */}
            <section id="reservation">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                5. Reservation of Rights
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  All rights not expressly granted under this Notice or the ALIFH Terms of Service 
                  are reserved by AISH CAPITALS FZCO.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  This Notice is effective as of the 'Last Updated' date and applies to all access 
                  to and use of the Platform.
                </p>
              </div>
            </section>

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
