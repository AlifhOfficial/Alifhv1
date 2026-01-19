/**
 * Privacy Policy Page
 * Legal documentation component following Alifh design patterns
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function PrivacyPolicy() {
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
              Privacy Policy
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
              This Privacy Policy explains how ALIFH collects, uses, stores, and protects personal data 
              when you access or use the ALIFH platform, website, and related services (collectively, 
              the "Platform").
            </p>
            <p className="text-sm text-foreground leading-relaxed mb-3">
              This Policy should be read together with <Link href="/terms-of-service" className="text-primary hover:underline">ALIFH's Terms of Service</Link> and <Link href="/disclaimer" className="text-primary hover:underline">Disclaimer</Link>.
            </p>
            <p className="text-sm text-muted-foreground text-xs">
              Related Policies: <Link href="/acceptable-use-policy" className="text-primary hover:underline">Acceptable Use Policy</Link> · <Link href="/dealer-agreement" className="text-primary hover:underline">Dealer Agreement</Link>
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-16">
            
            {/* 1. Scope */}
            <section id="scope">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                1. Scope
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  This Privacy Policy applies to all visitors, registered users, and dealers who access 
                  or use the Platform.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  By accessing or using the Platform, you acknowledge that personal data will be 
                  processed in accordance with this Policy.
                </p>
              </div>
            </section>

            {/* 2. Information We Collect */}
            <section id="information-collected">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                2. Information We Collect
              </h2>
              <div className="space-y-6 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  ALIFH may collect the following categories of information:
                </p>

                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3">a. Information You Provide</h3>
                  <ul className="space-y-2 pl-6">
                    <li className="text-sm text-foreground leading-relaxed list-disc">
                      Name, email address, phone number
                    </li>
                    <li className="text-sm text-foreground leading-relaxed list-disc">
                      Account registration and login details
                    </li>
                    <li className="text-sm text-foreground leading-relaxed list-disc">
                      Business information provided by dealers
                    </li>
                    <li className="text-sm text-foreground leading-relaxed list-disc">
                      Communications sent to ALIFH, including support requests or inquiries
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3">b. Information Collected Automatically</h3>
                  <ul className="space-y-2 pl-6">
                    <li className="text-sm text-foreground leading-relaxed list-disc">
                      IP address
                    </li>
                    <li className="text-sm text-foreground leading-relaxed list-disc">
                      Device type, browser type, and operating system
                    </li>
                    <li className="text-sm text-foreground leading-relaxed list-disc">
                      Usage data, interaction logs, and timestamps
                    </li>
                    <li className="text-sm text-foreground leading-relaxed list-disc">
                      Cookies and similar tracking technologies
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3">c. Payment Information</h3>
                  <ul className="space-y-2 pl-6">
                    <li className="text-sm text-foreground leading-relaxed list-disc">
                      Subscription and billing status
                    </li>
                    <li className="text-sm text-foreground leading-relaxed list-disc">
                      Transaction identifiers provided by payment processors
                    </li>
                  </ul>
                  <p className="text-sm text-foreground leading-relaxed mt-4">
                    ALIFH does not store full payment card details. Payment information is processed 
                    securely by third-party payment service providers in accordance with their own 
                    privacy and security standards.
                  </p>
                </div>

              </div>
            </section>

            {/* 3. How We Use Information */}
            <section id="how-we-use">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                3. How We Use Information
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  ALIFH uses personal data to:
                </p>
                <ul className="space-y-2 pl-6">
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Provide, operate, and maintain the Platform
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Create and manage user accounts
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Process subscriptions and billing
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Communicate with users regarding accounts or services
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Improve Platform functionality and performance
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Detect, prevent, and address misuse, fraud, or security issues
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Comply with applicable legal and regulatory obligations
                  </li>
                </ul>
                <p className="text-sm text-foreground leading-relaxed">
                  ALIFH does not sell personal data.
                </p>
              </div>
            </section>

            {/* 4. Cookies and Analytics */}
            <section id="cookies">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                4. Cookies and Analytics
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  The Platform uses cookies and similar technologies to enable core functionality, 
                  analyze usage, and improve user experience.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  You may manage cookies through your browser settings. Disabling cookies may affect 
                  Platform functionality.
                </p>
              </div>
            </section>

            {/* 5. Data Sharing */}
            <section id="data-sharing">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                5. Data Sharing
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  ALIFH may share personal data with:
                </p>
                <ul className="space-y-2 pl-6">
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Payment processors
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Cloud hosting and infrastructure providers
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Analytics, messaging, and communication service providers
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Law enforcement or regulatory authorities where required by law
                  </li>
                </ul>
                <p className="text-sm text-foreground leading-relaxed">
                  All third-party service providers are required to process personal data in accordance 
                  with applicable data protection and confidentiality standards.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  ALIFH does not share personal data for advertising resale or unauthorized profiling.
                </p>
              </div>
            </section>

            {/* 6. Data Storage and Security */}
            <section id="data-security">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                6. Data Storage and Security
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  Personal data is stored using secure cloud infrastructure and protected through 
                  appropriate technical and organizational safeguards.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  While ALIFH implements reasonable measures designed to protect personal data, no 
                  system can be guaranteed to be completely secure. Users acknowledge and accept this 
                  inherent risk.
                </p>
              </div>
            </section>

            {/* 7. Data Retention */}
            <section id="data-retention">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                7. Data Retention
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  Personal data is retained only for as long as necessary to:
                </p>
                <ul className="space-y-2 pl-6">
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Provide the Platform
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Fulfill contractual obligations
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Comply with legal or regulatory requirements
                  </li>
                </ul>
                <p className="text-sm text-foreground leading-relaxed">
                  Data may be deleted or anonymized when it is no longer required for these purposes.
                </p>
              </div>
            </section>

            {/* 8. User Rights */}
            <section id="user-rights">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                8. User Rights
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  Subject to applicable law, users may have the right to:
                </p>
                <ul className="space-y-2 pl-6">
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Access personal data
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Request correction of inaccurate data
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Request deletion of personal data
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Withdraw consent where processing is based on consent
                  </li>
                </ul>
                <p className="text-sm text-foreground leading-relaxed">
                  Requests may be submitted using the contact details below.
                </p>
              </div>
            </section>

            {/* 9. Third-Party Links */}
            <section id="third-party">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                9. Third-Party Links
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  The Platform may contain links to third-party websites or services. ALIFH is not 
                  responsible for the privacy practices or content of third parties.
                </p>
              </div>
            </section>

            {/* 10. Changes to This Policy */}
            <section id="policy-changes">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                10. Changes to This Policy
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  ALIFH may update this Privacy Policy from time to time.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  Changes will be reflected by updating the "Last Updated" date.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  Continued use of the Platform constitutes acknowledgment of the updated Policy.
                </p>
              </div>
            </section>

            {/* 11. Contact Information */}
            <section id="contact">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                11. Contact Information
              </h2>
              <div className="p-8 border border-border/60 bg-background mt-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Legal Entity</p>
                    <p className="text-sm font-semibold text-foreground">AISH CAPITALS FZCO</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Country</p>
                    <p className="text-sm font-semibold text-foreground">United Arab Emirates</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Contact Email</p>
                    <a 
                      href="mailto:support@alifh.com" 
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      support@alifh.com
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* 12. Entire Policy */}
            <section id="entire-policy">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                12. Entire Policy
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  This Privacy Policy forms part of the agreement between you and ALIFH and governs the 
                  processing of personal data in connection with use of the Platform.
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
