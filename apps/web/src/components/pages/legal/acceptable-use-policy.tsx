/**
 * Acceptable Use Policy Page
 * Legal documentation component following Alifh design patterns
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function AcceptableUsePolicy() {
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
              Acceptable Use Policy
            </h1>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Platform Usage Guidelines
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
            <p className="text-base text-muted-foreground leading-relaxed mb-3">
              This Acceptable Use Policy ("Policy") sets out the permitted and prohibited conduct 
              when accessing or using the ALIFH platform, website, and related services (collectively, 
              the "Platform").
            </p>
            <p className="text-base text-muted-foreground leading-relaxed mb-3">
              This Policy forms part of the <Link href="/terms-of-service" className="text-primary hover:underline">ALIFH Terms of Service</Link> and applies to all users, including 
              dealers, registered accounts, and visitors.
            </p>
            <p className="text-sm text-muted-foreground text-xs">
              Related Policies: <Link href="/dealer-agreement" className="text-primary hover:underline">Dealer Agreement</Link> · <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link> · <Link href="/intellectual-property" className="text-primary hover:underline">Intellectual Property</Link>
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-16">
            
            {/* 1. Purpose */}
            <section id="purpose">
              <h2 className="text-lg font-medium text-foreground mb-4 pb-2 border-b border-border/40">
                1. Purpose
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-base text-muted-foreground leading-relaxed">
                  ALIFH is a curated digital platform.
                </p>
                <p className="text-base text-muted-foreground leading-relaxed">
                  This Policy exists to protect platform integrity, trust, and quality, and to ensure 
                  that use of the Platform remains lawful, accurate, and aligned with ALIFH standards.
                </p>
              </div>
            </section>

            {/* 2. Permitted Use */}
            <section id="permitted">
              <h2 className="text-lg font-medium text-foreground mb-4 pb-2 border-b border-border/40">
                2. Permitted Use
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-base text-muted-foreground leading-relaxed">
                  The Platform may be used only for its intended purposes and in compliance with:
                </p>
                <ul className="space-y-2 pl-6">
                  <li className="text-base text-muted-foreground leading-relaxed list-disc">
                    Applicable laws and regulations of the United Arab Emirates
                  </li>
                  <li className="text-base text-muted-foreground leading-relaxed list-disc">
                    The ALIFH Terms of Service
                  </li>
                  <li className="text-base text-muted-foreground leading-relaxed list-disc">
                    This Acceptable Use Policy
                  </li>
                </ul>
              </div>
            </section>

            {/* 3. Prohibited Conduct */}
            <section id="prohibited">
              <h2 className="text-lg font-medium text-foreground mb-4 pb-2 border-b border-border/40">
                3. Prohibited Conduct
              </h2>
              <div className="space-y-6 mt-6">
                <p className="text-base text-muted-foreground leading-relaxed">
                  The following conduct is strictly prohibited:
                </p>

                {/* a. Misrepresentation */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    a. Misrepresentation and False Content
                  </h3>
                  <ul className="space-y-2 pl-6">
                    <li className="text-base text-muted-foreground leading-relaxed list-disc">
                      Posting inaccurate, misleading, deceptive, or incomplete information
                    </li>
                    <li className="text-base text-muted-foreground leading-relaxed list-disc">
                      Misstating vehicle details, pricing, condition, ownership, history, or availability
                    </li>
                    <li className="text-base text-muted-foreground leading-relaxed list-disc">
                      Listing items without legal authority or proper authorization
                    </li>
                  </ul>
                </div>

                {/* b. Fraudulent Activity */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    b. Fraudulent or Abusive Activity
                  </h3>
                  <ul className="space-y-2 pl-6">
                    <li className="text-base text-muted-foreground leading-relaxed list-disc">
                      Fraud, impersonation, or identity misrepresentation
                    </li>
                    <li className="text-base text-muted-foreground leading-relaxed list-disc">
                      Manipulating listings, rankings, visibility, engagement, or platform mechanics
                    </li>
                    <li className="text-base text-muted-foreground leading-relaxed list-disc">
                      Circumventing subscription limits, billing systems, safeguards, or access controls
                    </li>
                  </ul>
                </div>

                {/* c. Platform Misuse */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    c. Platform Misuse
                  </h3>
                  <ul className="space-y-2 pl-6">
                    <li className="text-base text-muted-foreground leading-relaxed list-disc">
                      Creating duplicate, fake, or misleading accounts
                    </li>
                    <li className="text-base text-muted-foreground leading-relaxed list-disc">
                      Scraping, copying, extracting, or harvesting Platform data without authorization
                    </li>
                    <li className="text-base text-muted-foreground leading-relaxed list-disc">
                      Using bots, scripts, automation, or similar processes without permission
                    </li>
                    <li className="text-base text-muted-foreground leading-relaxed list-disc">
                      Introducing malware, malicious code, or security threats
                    </li>
                  </ul>
                </div>

                {/* d. Improper Communications */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    d. Improper Communications
                  </h3>
                  <ul className="space-y-2 pl-6">
                    <li className="text-base text-muted-foreground leading-relaxed list-disc">
                      Spam, unsolicited outreach, or deceptive redirection
                    </li>
                    <li className="text-base text-muted-foreground leading-relaxed list-disc">
                      Harassment, threats, abusive, or discriminatory conduct
                    </li>
                    <li className="text-base text-muted-foreground leading-relaxed list-disc">
                      Using the Platform to mislead users into off-platform transactions
                    </li>
                  </ul>
                </div>

                {/* e. Legal Violations */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    e. Legal and Regulatory Violations
                  </h3>
                  <ul className="space-y-2 pl-6">
                    <li className="text-base text-muted-foreground leading-relaxed list-disc">
                      Uploading unlawful, restricted, or prohibited content
                    </li>
                    <li className="text-base text-muted-foreground leading-relaxed list-disc">
                      Using the Platform in violation of applicable consumer protection, advertising, 
                      trade, or licensing laws
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 4. Enforcement */}
            <section id="enforcement">
              <h2 className="text-lg font-medium text-foreground mb-4 pb-2 border-b border-border/40">
                4. Enforcement
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-base text-muted-foreground leading-relaxed">
                  ALIFH may, at its discretion and where permitted by law:
                </p>
                <ul className="space-y-2 pl-6">
                  <li className="text-base text-muted-foreground leading-relaxed list-disc">
                    Remove or restrict listings or content
                  </li>
                  <li className="text-base text-muted-foreground leading-relaxed list-disc">
                    Limit, suspend, or terminate account access
                  </li>
                  <li className="text-base text-muted-foreground leading-relaxed list-disc">
                    Take any action reasonably necessary to protect Platform integrity, users, or compliance
                  </li>
                </ul>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Such actions may be taken with or without prior notice, depending on the circumstances.
                </p>
              </div>
            </section>

            {/* 5. No Obligation to Monitor */}
            <section id="monitoring">
              <h2 className="text-lg font-medium text-foreground mb-4 pb-2 border-b border-border/40">
                5. No Obligation to Monitor
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-base text-muted-foreground leading-relaxed">
                  ALIFH is not obligated to actively monitor user activity or content but reserves the 
                  right to do so.
                </p>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Failure to enforce this Policy in any particular instance does not constitute a waiver 
                  of ALIFH's rights.
                </p>
              </div>
            </section>

            {/* 6. Reporting Violations */}
            <section id="reporting">
              <h2 className="text-lg font-medium text-foreground mb-4 pb-2 border-b border-border/40">
                6. Reporting Violations
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-base text-muted-foreground leading-relaxed">
                  Suspected violations of this Policy may be reported through official ALIFH support 
                  channels.
                </p>
                <p className="text-base text-muted-foreground leading-relaxed">
                  ALIFH may review reported conduct and take appropriate action based on its assessment.
                </p>
              </div>
            </section>

            {/* 7. Governing Law */}
            <section id="governing">
              <h2 className="text-lg font-medium text-foreground mb-4 pb-2 border-b border-border/40">
                7. Governing Law
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-base text-muted-foreground leading-relaxed">
                  This Policy is governed by the laws of the United Arab Emirates.
                </p>
                <p className="text-base text-muted-foreground leading-relaxed">
                  This Policy is effective as of the "Last Updated" date and applies while you continue 
                  to access or use the Platform.
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
