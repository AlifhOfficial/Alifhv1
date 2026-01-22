/**
 * Terms of Service Page
 * Legal documentation component following Alifh design patterns
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function TermsOfService() {
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
              Terms of Service
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
              These Terms of Service create a legally binding contract between you and ALIFH, 
              operated by AISH CAPITALS FZCO (the "Agreement"). Please read this Agreement carefully.
            </p>
            <p className="text-sm text-muted-foreground text-xs">
              Related Policies: <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link> · <Link href="/refund-policy" className="text-primary hover:underline">Refund Policy</Link> · <Link href="/acceptable-use-policy" className="text-primary hover:underline">Acceptable Use Policy</Link> · <Link href="/intellectual-property" className="text-primary hover:underline">Intellectual Property</Link> · <Link href="/dealer-agreement" className="text-primary hover:underline">Dealer Agreement</Link>
            </p>
          </div>

          {/* Table of Contents */}
          <div className="mb-16">
            <h2 className="text-xl font-semibold text-foreground mb-6 pb-3 border-b border-border/60">
              Table of Contents
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {[
                { id: 'introduction', title: 'A. Introduction' },
                { id: 'eligibility', title: 'B. Eligibility' },
                { id: 'accounts', title: 'C. Accounts' },
                { id: 'platform-role', title: 'D. Platform Role and Scope' },
                { id: 'dealer-responsibilities', title: 'E. Dealer Listings and Responsibilities' },
                { id: 'subscriptions', title: 'F. Subscriptions, Billing, Cancellations, and Refunds' },
                { id: 'acceptable-use', title: 'G. Acceptable Use' },
                { id: 'suspension', title: 'H. Suspension and Termination' },
                { id: 'intellectual-property', title: 'I. Intellectual Property and License' },
                { id: 'disclaimers', title: 'J. Disclaimers' },
                { id: 'limitation-liability', title: 'K. Limitation of Liability' },
                { id: 'indemnification', title: 'L. Indemnification' },
                { id: 'changes', title: 'M. Changes to the Platform and Terms' },
                { id: 'governing-law', title: 'N. Governing Law and Jurisdiction' },
                { id: 'contact', title: 'O. Contact Information' },
                { id: 'entire-agreement', title: 'P. Entire Agreement' },
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block text-sm text-foreground hover:text-primary transition-colors py-1"
                >
                  {item.title}
                </a>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-16">
            
            {/* A. Introduction */}
            <section id="introduction">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                A. Introduction
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  This Agreement governs access to and use of the ALIFH platform, website, and related 
                  services (collectively, the "Platform").
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  By accessing or using the Platform, you agree to be bound by this Agreement. If you 
                  do not agree, you must not access or use the Platform.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  Your use of the Platform is also subject to ALIFH's Privacy Policy, which is 
                  incorporated into this Agreement by reference.
                </p>
              </div>
            </section>

            {/* B. Eligibility */}
            <section id="eligibility">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                B. Eligibility
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  You must be at least eighteen (18) years of age and legally capable of entering into 
                  binding agreements to access or use the Platform.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  By using the Platform, you represent and warrant that you meet these requirements.
                </p>
              </div>
            </section>

            {/* C. Accounts */}
            <section id="accounts">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                C. Accounts
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  Certain features of the Platform require the creation of an account.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  You agree to provide accurate, current, and complete information and to keep such 
                  information updated. You are responsible for maintaining the confidentiality of your 
                  account credentials and for all activity conducted through your account.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  Each Dealer may maintain one account per legal entity or per showroom location, as 
                  determined by ALIFH. ALIFH may require separate subscriptions for separate showroom 
                  locations, branches, or operational entities.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  ALIFH reserves the right to refuse registration, restrict access, or require 
                  additional verification at its discretion.
                </p>
              </div>
            </section>

            {/* D. Platform Role and Scope */}
            <section id="platform-role">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                D. Platform Role and Scope
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  ALIFH is a technology platform designed to facilitate structured visibility and 
                  engagement between users.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  ALIFH does not buy, sell, own, or take custody of any items listed on the Platform 
                  and does not inspect, verify, or certify the condition, legality, pricing, history, 
                  or accuracy of any listing.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  ALIFH is not a party to, and bears no responsibility for, any transaction, payment, 
                  agreement, or arrangement made between users. All dealings occur solely between the 
                  involved parties.
                </p>
              </div>
            </section>

            {/* E. Dealer Listings and Responsibilities */}
            <section id="dealer-responsibilities">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                E. Dealer Listings and Responsibilities
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  Dealers are solely responsible for all listings and any statements, representations, 
                  or information provided through the Platform, including accuracy, completeness, 
                  legality, pricing, and availability.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  Dealers must comply with all applicable laws and regulations, including consumer 
                  protection obligations, advertising standards, and any required licenses or permits.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  ALIFH may, at its discretion, remove, restrict, or suspend any listing or account at 
                  any time.
                </p>
              </div>
            </section>

            {/* F. Subscriptions, Billing, Cancellations, and Refunds */}
            <section id="subscriptions">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                F. Subscriptions, Billing, Cancellations, and Refunds
              </h2>
              <div className="space-y-6 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  Certain Platform features require a paid subscription ("Subscription").
                </p>

                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3">Billing</h3>
                  <div className="space-y-3">
                    <p className="text-sm text-foreground leading-relaxed">
                      Subscriptions are billed monthly in advance. Fees are charged using the payment 
                      method on file.
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">
                      Subscriptions are charged per approved Dealer account, showroom, or operational 
                      entity, as determined by ALIFH.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3">Setup Fee</h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    A one-time setup fee may apply. The setup fee is non-refundable.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3">No Performance Guarantees</h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    ALIFH does not guarantee any specific level of exposure, visibility, leads, 
                    engagement, sales, or results.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3">Cancellation</h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    You may cancel your Subscription at any time.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3">Refunds</h3>
                  <div className="space-y-3">
                    <p className="text-sm text-foreground leading-relaxed">
                      Upon cancellation, ALIFH will issue a full refund for the current billing month 
                      only. Setup fees are non-refundable.
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">
                      Approved refunds are processed using the original payment method within fourteen 
                      (14) business days, subject to banking and payment provider processing times.
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">
                      ALIFH may refuse or suspend refunds where it determines, in its discretion, that 
                      there is evidence of fraud, abuse, or misuse of the Platform.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* G. Acceptable Use */}
            <section id="acceptable-use">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                G. Acceptable Use
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  You must not:
                </p>
                <ul className="space-y-2 pl-6">
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Publish false, misleading, deceptive, or unlawful content
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Misrepresent pricing, availability, ownership, history, or condition
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Manipulate Platform behavior, rankings, engagement, or visibility
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Scrape, copy, reverse engineer, or interfere with the Platform
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Use automation, bots, scripts, or similar processes without authorization
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Engage in abusive, harassing, or harmful conduct
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Attempt to circumvent Platform rules or safeguards
                  </li>
                </ul>
                <p className="text-sm text-foreground leading-relaxed">
                  ALIFH may investigate suspected violations and take appropriate action, including 
                  restricting content, limiting access, suspending accounts, or terminating this 
                  Agreement.
                </p>
              </div>
            </section>

            {/* H. Suspension and Termination */}
            <section id="suspension">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                H. Suspension and Termination
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  ALIFH may suspend or terminate access to the Platform at any time, with or without 
                  notice, where it determines that a user has violated this Agreement or engaged in 
                  conduct harmful to the Platform or other users.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  Termination does not entitle you to refunds beyond those explicitly stated in 
                  Section F.
                </p>
              </div>
            </section>

            {/* I. Intellectual Property and License */}
            <section id="intellectual-property">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                I. Intellectual Property and License
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  The Platform and all associated intellectual property, including software, 
                  architecture, design language, user interface, branding, structure, and underlying 
                  systems, are owned exclusively by AISH CAPITALS FZCO.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  Subject to this Agreement, Dealers are granted a limited, non-exclusive, 
                  non-transferable, revocable license to access and use the Platform during an active 
                  Subscription.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  No ownership, proprietary, or intellectual property rights are transferred under any 
                  circumstances.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  ALIFH may modify, suspend, or discontinue any feature, functionality, or access level 
                  at its discretion.
                </p>
              </div>
            </section>

            {/* J. Disclaimers */}
            <section id="disclaimers">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                J. Disclaimers
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  ALIFH is designed to provide a platform for structured discovery and engagement 
                  between users.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  While reasonable efforts are made to maintain availability and performance, the 
                  Platform is provided on an "as is" and "as available" basis.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  ALIFH makes no warranties, express or implied, regarding availability, uptime, 
                  accuracy, reliability, or outcomes and does not guarantee uninterrupted or error-free 
                  operation or any specific results arising from use of the Platform.
                </p>
              </div>
            </section>

            {/* K. Limitation of Liability */}
            <section id="limitation-liability">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                K. Limitation of Liability
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  To the maximum extent permitted by law, ALIFH shall not be liable for any indirect, 
                  incidental, consequential, special, or punitive damages arising out of or related to 
                  use of the Platform.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  Where liability cannot be excluded, ALIFH's total aggregate liability shall be limited 
                  to the Subscription fees paid by the Dealer during the preceding billing period.
                </p>
              </div>
            </section>

            {/* L. Indemnification */}
            <section id="indemnification">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                L. Indemnification
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  Dealers agree to indemnify and hold harmless ALIFH, its owners, affiliates, and 
                  representatives from any claims, losses, damages, liabilities, and expenses arising 
                  from or relating to listings, transactions, misrepresentations, disputes, or violations 
                  of law.
                </p>
              </div>
            </section>

            {/* M. Changes to the Platform and Terms */}
            <section id="changes">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                M. Changes to the Platform and Terms
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  The Platform may be modified, suspended, or discontinued, in whole or in part, at any 
                  time.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  This Agreement may be updated periodically. Continued access to or use of the Platform 
                  constitutes acceptance of the revised Agreement.
                </p>
              </div>
            </section>

            {/* N. Governing Law and Jurisdiction */}
            <section id="governing-law">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                N. Governing Law and Jurisdiction
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  This Agreement is governed by the laws of the United Arab Emirates.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  The courts of the United Arab Emirates shall have exclusive jurisdiction over any 
                  dispute arising from or relating to this Agreement.
                </p>
              </div>
            </section>

            {/* O. Contact Information */}
            <section id="contact">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                O. Contact Information
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
                      href="mailto:support@alifh.ae" 
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      support@alifh.ae
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* P. Entire Agreement */}
            {/* P. Entire Agreement */}
            <section id="entire-agreement">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                P. Entire Agreement
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  This Agreement constitutes the entire agreement between you and ALIFH regarding use of 
                  the Platform and supersedes all prior understandings or agreements.
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
