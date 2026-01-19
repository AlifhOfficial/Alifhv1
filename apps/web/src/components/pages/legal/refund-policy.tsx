/**
 * Refund & Cancellation Policy Page
 * Legal documentation component following Alifh design patterns
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function RefundPolicy() {
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
              Refund & Cancellation Policy
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
              This Refund & Cancellation Policy governs subscription cancellations and refunds for the 
              ALIFH platform, website, and related services (collectively, the "Platform").
            </p>
            <p className="text-sm text-foreground leading-relaxed mb-3">
              This Policy forms part of, and should be read together with, the <Link href="/terms-of-service" className="text-primary hover:underline">ALIFH Terms of Service</Link>.
            </p>
            <p className="text-sm text-muted-foreground text-xs">
              Related Policies: <Link href="/dealer-agreement" className="text-primary hover:underline">Dealer Agreement</Link> · <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-16">
            
            {/* 1. Subscription Model */}
            <section id="subscription-model">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                1. Subscription Model
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  ALIFH operates on a monthly subscription basis.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  Subscriptions renew automatically at the start of each billing cycle unless cancelled 
                  prior to renewal.
                </p>
              </div>
            </section>

            {/* 2. Cancellation */}
            <section id="cancellation">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                2. Cancellation
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  Users may cancel their subscription at any time through their account or designated 
                  support channels.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  Upon cancellation:
                </p>
                <ul className="space-y-2 pl-6">
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Access to subscription features continues until the end of the current billing month
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    No future billing will occur following cancellation
                  </li>
                </ul>
              </div>
            </section>

            {/* 3. Refunds */}
            <section id="refunds">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                3. Refunds
              </h2>
              <div className="space-y-6 mt-6">
                
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3">a. Monthly Subscription Fees</h3>
                  <ul className="space-y-2 pl-6">
                    <li className="text-sm text-foreground leading-relaxed list-disc">
                      Users are eligible for a full refund of the current billing month only
                    </li>
                    <li className="text-sm text-foreground leading-relaxed list-disc">
                      Refund requests must be submitted within the same billing month in which the 
                      subscription is active
                    </li>
                    <li className="text-sm text-foreground leading-relaxed list-disc">
                      Refunds do not apply to prior or completed billing periods
                    </li>
                    <li className="text-sm text-foreground leading-relaxed list-disc">
                      Refund eligibility applies solely to the most recent active billing cycle
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3">b. One-Time Fees</h3>
                  <ul className="space-y-2 pl-6">
                    <li className="text-sm text-foreground leading-relaxed list-disc">
                      Any one-time setup, onboarding, or activation fees are non-refundable
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3">c. Credits</h3>
                  <ul className="space-y-2 pl-6">
                    <li className="text-sm text-foreground leading-relaxed list-disc">
                      Promotional, bonus, or usage credits (if any) have no cash value and are non-refundable
                    </li>
                  </ul>
                </div>

              </div>
            </section>

            {/* 4. Refund Processing */}
            <section id="refund-processing">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                4. Refund Processing
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  Approved refunds are processed to the original payment method used at the time of 
                  purchase.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  Refunds are processed within fourteen (14) business days of approval.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  The actual time for funds to be received may vary depending on the user's bank, card 
                  issuer, or payment service provider, which is outside ALIFH's control.
                </p>
              </div>
            </section>

            {/* 5. Abuse & Enforcement */}
            <section id="abuse-enforcement">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                5. Abuse & Enforcement
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  ALIFH reserves the right to deny or reverse refunds where it determines, at its 
                  discretion, that there is evidence of:
                </p>
                <ul className="space-y-2 pl-6">
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Fraud
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Abuse
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Manipulation of the Platform
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Violation of the Terms of Service or Acceptable Use Policy
                  </li>
                </ul>
              </div>
            </section>

            {/* 6. No Performance Guarantees */}
            <section id="no-guarantees">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                6. No Performance Guarantees
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  Subscription fees relate solely to access to the Platform. ALIFH does not guarantee:
                </p>
                <ul className="space-y-2 pl-6">
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Leads
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Sales
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Visibility
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Outcomes or results of any kind
                  </li>
                </ul>
              </div>
            </section>

            {/* 7. Policy Updates */}
            <section id="policy-updates">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                7. Policy Updates
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  ALIFH may update this Policy from time to time.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  Changes take effect upon publication and are reflected by the "Last Updated" date.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  Continued use of the Platform or maintenance of an active subscription following any 
                  update to this Policy constitutes acceptance of the revised Policy.
                </p>
              </div>
            </section>

            {/* 8. Governing Law */}
            <section id="governing-law">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                8. Governing Law
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  This Policy is governed by the laws of the United Arab Emirates.
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
