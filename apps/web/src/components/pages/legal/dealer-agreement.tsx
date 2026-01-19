/**
 * Dealer Agreement Page
 * Legal documentation component following Alifh design patterns
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function DealerAgreement() {
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
              Dealer Agreement
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
            <p className="text-sm text-foreground leading-relaxed mb-4">
              This Dealer Agreement ("Agreement") governs the relationship between ALIFH, operated 
              by AISH CAPITALS FZCO, a company incorporated in the United Arab Emirates ("ALIFH"), 
              and the dealer entity or individual granted access to the ALIFH platform ("Dealer").
            </p>
            <p className="text-sm text-foreground leading-relaxed mb-3">
              This Agreement supplements and incorporates by reference the following Platform Policies:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 pl-4">
              <Link href="/terms-of-service" className="text-sm text-primary hover:underline">→ Terms of Service</Link>
              <Link href="/acceptable-use-policy" className="text-sm text-primary hover:underline">→ Acceptable Use Policy</Link>
              <Link href="/privacy-policy" className="text-sm text-primary hover:underline">→ Privacy Policy</Link>
              <Link href="/refund-policy" className="text-sm text-primary hover:underline">→ Refund & Cancellation Policy</Link>
              <Link href="/intellectual-property" className="text-sm text-primary hover:underline">→ Intellectual Property Notice</Link>
            </div>
            <p className="text-sm text-muted-foreground text-xs">
              In the event of any inconsistency, this Agreement governs dealer-specific matters.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-16">
            
            {/* 1. Nature of the Platform */}
            <section id="nature">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                1. Nature of the Platform
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  ALIFH is a digital platform designed to enable authorized dealers to present listings 
                  and connect with potential buyers.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  ALIFH:
                </p>
                <ul className="space-y-2 pl-6">
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Does not buy, sell, own, or take custody of any vehicle
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Does not inspect, verify, certify, or guarantee vehicles or listings
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Does not act as a broker, agent, escrow service, or payment intermediary
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Is not a party to any transaction, agreement, or arrangement between Dealer and buyer
                  </li>
                </ul>
                <p className="text-sm text-foreground leading-relaxed">
                  All transactions, negotiations, representations, and obligations occur solely between 
                  the Dealer and the buyer.
                </p>
              </div>
            </section>

            {/* 2. Access & Eligibility */}
            <section id="access">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                2. Access & Eligibility
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  Access to the ALIFH platform is granted at ALIFH's discretion.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  ALIFH reserves the right to approve, reject, limit, modify, suspend, or terminate 
                  Dealer access, features, or visibility at any time, in accordance with this Agreement 
                  and applicable Platform Policies.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  Dealer access is:
                </p>
                <ul className="space-y-2 pl-6">
                  <li className="text-sm text-foreground leading-relaxed list-disc">Non-exclusive</li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">Non-transferable</li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">Revocable</li>
                </ul>
                <p className="text-sm text-foreground leading-relaxed">
                  No continued access, placement, visibility, feature availability, or platform 
                  participation is guaranteed.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  Nothing in this Agreement shall be construed as creating any obligation on ALIFH's 
                  part to maintain or continue Dealer access to the platform.
                </p>
              </div>
            </section>

            {/* 3. Dealer Responsibilities */}
            <section id="responsibilities">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                3. Dealer Responsibilities
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  The Dealer is solely responsible for:
                </p>
                <ul className="space-y-2 pl-6">
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    The accuracy, completeness, legality, and authenticity of all listings
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Pricing, availability, and representations
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Compliance with all applicable laws and regulations in the United Arab Emirates
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    All communications, negotiations, and dealings with buyers
                  </li>
                </ul>
                <p className="text-sm text-foreground leading-relaxed">
                  The Dealer represents and warrants that:
                </p>
                <ul className="space-y-2 pl-6">
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Listings are genuine and lawful
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Information provided is not misleading or deceptive
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    The Dealer has authority to offer the listed vehicles
                  </li>
                </ul>
                <p className="text-sm text-foreground leading-relaxed">
                  ALIFH relies entirely on Dealer-provided information and assumes no duty to verify.
                </p>
              </div>
            </section>

            {/* 4. Prohibited Conduct */}
            <section id="prohibited">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                4. Prohibited Conduct
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  The Dealer must not:
                </p>
                <ul className="space-y-2 pl-6">
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Post false, misleading, duplicate, or manipulated listings
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Misrepresent vehicle condition, ownership, history, or pricing
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Circumvent platform rules, limits, or safeguards
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Engage in spam, abuse, scraping, or artificial traffic generation
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Attempt to copy, reverse-engineer, or misuse the platform
                  </li>
                </ul>
                <p className="text-sm text-foreground leading-relaxed">
                  ALIFH may take immediate action, including suspension or termination, for any violation.
                </p>
              </div>
            </section>

            {/* 5. Subscriptions, Fees & Billing */}
            <section id="subscriptions">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                5. Subscriptions, Fees & Billing
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  Dealer access is provided on a subscription basis. Key terms include:
                </p>
                <ul className="space-y-2 pl-6">
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Subscriptions are billed monthly
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Dealers may cancel at any time
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    A full refund applies only to the current billing month, subject to the Refund & 
                    Cancellation Policy
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    One-time setup or onboarding fees are non-refundable
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    No guarantees are made regarding leads, sales, visibility, or outcomes
                  </li>
                </ul>
                <p className="text-sm text-foreground leading-relaxed">
                  Failure to pay applicable fees may result in restricted or terminated access.
                </p>
              </div>
            </section>

            {/* 6. Subscription Scope */}
            <section id="scope">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                6. Subscription Scope
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  Subscriptions are granted on a per-approved entity, location, showroom, or operational 
                  unit basis, as determined by ALIFH from time to time.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  A subscription granted for one approved entity, location, or operational unit does not 
                  extend to, and may not be used for, additional branches, showrooms, locations, or 
                  affiliated entities unless expressly authorized by ALIFH in writing.
                </p>
              </div>
            </section>

            {/* 7. Premium & Enhanced Features */}
            <section id="premium">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                7. Premium & Enhanced Features
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  Certain features, access levels, placements, visibility options, or recognition 
                  elements may be made available to Dealers at ALIFH's discretion.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  Such features are provided on a non-guaranteed basis and do not constitute entitlements. 
                  Availability, scope, presentation, eligibility, and continued access may vary and may 
                  be modified, limited, reassigned, or withdrawn at any time.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  ALIFH makes no representations or guarantees regarding the availability, duration, 
                  performance, or impact of any such features and shall not be liable for any changes 
                  relating thereto.
                </p>
              </div>
            </section>

            {/* 8. Brand Usage */}
            <section id="brand">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                8. Brand Usage
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  The Dealer is granted a limited, revocable license to reference ALIFH solely for 
                  identification and promotional alignment.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  The Dealer may not:
                </p>
                <ul className="space-y-2 pl-6">
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Imply endorsement, partnership, or agency
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Use ALIFH branding outside approved contexts
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Modify, replicate, or misuse ALIFH brand assets
                  </li>
                </ul>
                <p className="text-sm text-foreground leading-relaxed">
                  All rights and interests in the ALIFH name, brand, and platform remain exclusively 
                  with AISH CAPITALS FZCO.
                </p>
              </div>
            </section>

            {/* 9. Intellectual Property */}
            <section id="ip">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                9. Intellectual Property
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  All intellectual property relating to the platform, including but not limited to:
                </p>
                <ul className="space-y-2 pl-6">
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Software and source code
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    User interfaces and design systems
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Architecture and data structures
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Branding and content
                  </li>
                </ul>
                <p className="text-sm text-foreground leading-relaxed">
                  is owned exclusively by AISH CAPITALS FZCO.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  This Agreement grants no ownership rights to the Dealer.
                </p>
              </div>
            </section>

            {/* 10. Suspension & Termination */}
            <section id="termination">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                10. Suspension & Termination
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  ALIFH may suspend or terminate Dealer access:
                </p>
                <ul className="space-y-2 pl-6">
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    For breach of this Agreement or Platform Policies
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    To protect platform integrity or users
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    At its discretion, where permitted by law
                  </li>
                </ul>
                <p className="text-sm text-foreground leading-relaxed">
                  Termination:
                </p>
                <ul className="space-y-2 pl-6">
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Does not entitle the Dealer to compensation
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Does not waive outstanding obligations
                  </li>
                </ul>
              </div>
            </section>

            {/* 11. Disclaimer of Warranties */}
            <section id="warranties">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                11. Disclaimer of Warranties
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  The platform is provided "as is" and "as available." ALIFH makes no warranties, 
                  express or implied, regarding:
                </p>
                <ul className="space-y-2 pl-6">
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Platform availability or performance
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Accuracy of listings
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Business outcomes or results
                  </li>
                </ul>
                <p className="text-sm text-foreground leading-relaxed">
                  Use of the platform is at the Dealer's sole risk.
                </p>
              </div>
            </section>

            {/* 12. Limitation of Liability */}
            <section id="liability">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                12. Limitation of Liability
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  To the maximum extent permitted by law:
                </p>
                <ul className="space-y-2 pl-6">
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    ALIFH shall not be liable for disputes, losses, or damages arising from Dealer 
                    listings or transactions
                  </li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    ALIFH shall not be liable for indirect, incidental, or consequential damages
                  </li>
                </ul>
                <p className="text-sm text-foreground leading-relaxed">
                  Where liability cannot be excluded, ALIFH's total aggregate liability shall be limited 
                  to the subscription fees paid by the Dealer during the preceding billing period.
                </p>
              </div>
            </section>

            {/* 13. Indemnification */}
            <section id="indemnification">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                13. Indemnification
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  The Dealer agrees to indemnify and hold harmless:
                </p>
                <ul className="space-y-2 pl-6">
                  <li className="text-sm text-foreground leading-relaxed list-disc">ALIFH</li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">AISH CAPITALS FZCO</li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Their directors, officers, employees, and affiliates
                  </li>
                </ul>
                <p className="text-sm text-foreground leading-relaxed">
                  from any claims arising out of:
                </p>
                <ul className="space-y-2 pl-6">
                  <li className="text-sm text-foreground leading-relaxed list-disc">Dealer listings</li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">Dealer conduct</li>
                  <li className="text-sm text-foreground leading-relaxed list-disc">
                    Breach of this Agreement or applicable laws
                  </li>
                </ul>
              </div>
            </section>

            {/* 14. Acceptance of Agreement */}
            <section id="acceptance">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                14. Acceptance of Agreement
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  By creating, accessing, or continuing to use a Dealer account on the ALIFH platform, 
                  the Dealer confirms that they have read, understood, and accepted this Agreement and 
                  all incorporated Platform Policies.
                </p>
              </div>
            </section>

            {/* 15. Effectiveness and Ongoing Application */}
            <section id="effectiveness">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                15. Effectiveness and Ongoing Application
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  This Agreement is effective as of the "Last Updated" date and remains in force for 
                  as long as the Dealer accesses or uses the ALIFH platform. Continued access to or 
                  use of the platform constitutes ongoing acceptance of this Agreement and any updates 
                  made in accordance with its terms.
                </p>
              </div>
            </section>

            {/* 16. Governing Law & Jurisdiction */}
            <section id="governing">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                16. Governing Law & Jurisdiction
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  This Agreement is governed by the laws of the United Arab Emirates.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  Any dispute shall be subject to the exclusive jurisdiction of the courts of the UAE.
                </p>
              </div>
            </section>

            {/* 17. Miscellaneous */}
            <section id="miscellaneous">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
                17. Miscellaneous
              </h2>
              <div className="space-y-4 mt-6">
                <p className="text-sm text-foreground leading-relaxed">
                  This Agreement constitutes the entire understanding between ALIFH and the Dealer 
                  regarding platform access and use.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  Any failure by ALIFH to enforce a provision of this Agreement shall not constitute 
                  a waiver of that provision or any other rights.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  If any provision of this Agreement is held to be invalid or unenforceable, the 
                  remaining provisions shall remain in full force and effect.
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
