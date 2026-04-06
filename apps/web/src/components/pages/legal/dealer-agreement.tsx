/**
 * Dealer Agreement Page
 * Legal documentation component following Revvup design patterns
 */

'use client';

import Link from 'next/link';
import { useCallback } from 'react';

// Table of Contents items
const TOC_ITEMS = [
  { id: 'nature', title: 'Nature of Platform' },
  { id: 'access', title: 'Access & Eligibility' },
  { id: 'responsibilities', title: 'Dealer Responsibilities' },
  { id: 'prohibited', title: 'Prohibited Conduct' },
  { id: 'subscriptions', title: 'Subscriptions & Fees' },
  { id: 'scope', title: 'Subscription Scope' },
  { id: 'premium', title: 'Premium Features' },
  { id: 'brand', title: 'Brand Usage' },
  { id: 'ip', title: 'Intellectual Property' },
  { id: 'termination', title: 'Suspension & Termination' },
  { id: 'warranties', title: 'Disclaimer of Warranties' },
  { id: 'liability', title: 'Limitation of Liability' },
  { id: 'indemnification', title: 'Indemnification' },
  { id: 'acceptance', title: 'Acceptance' },
  { id: 'effectiveness', title: 'Effectiveness' },
  { id: 'governing', title: 'Governing Law' },
  { id: 'miscellaneous', title: 'Miscellaneous' },
] as const;

export function DealerAgreement() {
  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  }, []);

  return (
    <section className="pt-28 pb-20 px-4 compact:px-6 large:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <p className="text-caption1 uppercase tracking-widest text-muted-foreground/70 mb-3">
            Legal
          </p>
          <h1 className="text-title3 font-semibold text-foreground tracking-tight">
            Dealer Agreement
          </h1>
        </div>

        {/* Meta Info Card */}
        <div className="rounded-xl border border-border/40 bg-sidebar p-5 mb-10">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-subhead font-semibold text-muted-foreground/70">Operator</p>
              <p className="text-subhead text-foreground mt-0.5">AISH CAPITALS FZCO</p>
            </div>
            <div>
              <p className="text-subhead font-semibold text-muted-foreground/70">Last Updated</p>
              <p className="text-subhead text-foreground mt-0.5">January 2026</p>
            </div>
          </div>
        </div>

        {/* Introduction Summary */}
        <div className="mb-10 py-5 border-y border-border/40">
          <p className="text-subhead text-foreground leading-relaxed mb-4">
            This Agreement governs the relationship between REVVUP (operated by AISH CAPITALS FZCO) 
            and authorized dealers granted access to the platform.
          </p>
          <p className="text-subhead text-muted-foreground leading-relaxed mb-4">
            This Agreement supplements and incorporates by reference:
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/terms-of-service" className="text-caption1 text-primary hover:underline font-medium">Terms</Link>
            <span className="text-muted-foreground/40">·</span>
            <Link href="/acceptable-use-policy" className="text-caption1 text-primary hover:underline font-medium">Acceptable Use</Link>
            <span className="text-muted-foreground/40">·</span>
            <Link href="/privacy-policy" className="text-caption1 text-primary hover:underline font-medium">Privacy</Link>
            <span className="text-muted-foreground/40">·</span>
            <Link href="/refund-policy" className="text-caption1 text-primary hover:underline font-medium">Refunds</Link>
            <span className="text-muted-foreground/40">·</span>
            <Link href="/intellectual-property" className="text-caption1 text-primary hover:underline font-medium">IP Notice</Link>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="mb-12">
          <h2 className="text-subhead font-bold tracking-tight text-foreground mb-4">
            Contents
          </h2>
          <div className="rounded-xl border border-border/40 bg-sidebar p-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {TOC_ITEMS.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="flex items-center gap-3 text-left py-1.5 group"
                >
                  <span className="text-caption1 text-muted-foreground/50 w-5 tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-subhead text-muted-foreground group-hover:text-foreground transition-colors">
                    {item.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          
          {/* 1. Nature of the Platform */}
          <section id="nature" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              01. Nature of the Platform
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-foreground leading-relaxed mb-4">
                REVVUP is a digital platform designed to enable authorized dealers to present listings 
                and connect with potential buyers. REVVUP:
              </p>
              <div className="space-y-2 mb-4">
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Does not buy, sell, own, or take custody of any vehicle
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Does not inspect, verify, certify, or guarantee vehicles
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Does not act as a broker, agent, or payment intermediary
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Is not a party to any transaction between Dealer and buyer
                </p>
              </div>
              <p className="text-subhead text-muted-foreground leading-relaxed pt-4 border-t border-border/20">
                All transactions occur solely between the Dealer and the buyer.
              </p>
            </div>
          </section>

          {/* 2. Access & Eligibility */}
          <section id="access" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              02. Access & Eligibility
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-foreground leading-relaxed mb-4">
                Access to the REVVUP platform is granted at REVVUP's discretion. REVVUP may approve, 
                reject, limit, suspend, or terminate Dealer access at any time.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed mb-3">Dealer access is:</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Non-exclusive
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Non-transferable
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Revocable
                </p>
              </div>
              <p className="text-subhead text-muted-foreground leading-relaxed pt-4 border-t border-border/20">
                No continued access, visibility, or platform participation is guaranteed.
              </p>
            </div>
          </section>

          {/* 3. Dealer Responsibilities */}
          <section id="responsibilities" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              03. Dealer Responsibilities
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-foreground leading-relaxed mb-3">The Dealer is solely responsible for:</p>
              <div className="space-y-2 mb-4">
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Accuracy, completeness, legality of all listings
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Pricing, availability, and representations
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Compliance with all applicable UAE laws
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  All communications and dealings with buyers
                </p>
              </div>
              <p className="text-subhead text-muted-foreground leading-relaxed pt-4 border-t border-border/20">
                REVVUP relies entirely on Dealer-provided information and assumes no duty to verify.
              </p>
            </div>
          </section>

          {/* 4. Prohibited Conduct */}
          <section id="prohibited" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              04. Prohibited Conduct
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-foreground leading-relaxed mb-4">The Dealer must not:</p>
              <div className="space-y-2">
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Post false, misleading, duplicate, or manipulated listings
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Misrepresent vehicle condition, ownership, history, or pricing
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Circumvent platform rules or safeguards
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Engage in spam, abuse, scraping, or artificial traffic
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Copy, reverse-engineer, or misuse the platform
                </p>
              </div>
              <p className="text-subhead text-muted-foreground leading-relaxed mt-4 pt-4 border-t border-border/20">
                REVVUP may take immediate action, including suspension or termination, for any violation.
              </p>
            </div>
          </section>

          {/* 5. Subscriptions, Fees & Billing */}
          <section id="subscriptions" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              05. Subscriptions & Fees
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-foreground leading-relaxed mb-4">
                Dealer access is provided on a subscription basis:
              </p>
              <div className="space-y-2">
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Subscriptions are billed monthly
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Dealers may cancel at any time
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Full refund applies only to current billing month
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Setup or onboarding fees are non-refundable
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  No guarantees on leads, sales, or outcomes
                </p>
              </div>
              <p className="text-subhead text-muted-foreground leading-relaxed mt-4 pt-4 border-t border-border/20">
                Failure to pay may result in restricted or terminated access.
              </p>
            </div>
          </section>

          {/* 6. Subscription Scope */}
          <section id="scope" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              06. Subscription Scope
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-subhead text-foreground leading-relaxed">
                Subscriptions are granted per approved entity, location, showroom, or operational 
                unit, as determined by REVVUP.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                A subscription for one location does not extend to additional branches or affiliates 
                unless expressly authorized in writing.
              </p>
            </div>
          </section>

          {/* 7. Premium & Enhanced Features */}
          <section id="premium" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              07. Premium Features
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-subhead text-foreground leading-relaxed">
                Certain features, placements, or visibility options may be available at REVVUP's 
                discretion.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                Such features are provided on a non-guaranteed basis and may be modified, limited, 
                or withdrawn at any time. REVVUP makes no guarantees regarding availability or impact.
              </p>
            </div>
          </section>

          {/* 8. Brand Usage */}
          <section id="brand" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              08. Brand Usage
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-foreground leading-relaxed mb-4">
                The Dealer is granted a limited, revocable license to reference REVVUP for 
                identification. The Dealer may not:
              </p>
              <div className="space-y-2">
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Imply endorsement, partnership, or agency
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Use branding outside approved contexts
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Modify, replicate, or misuse brand assets
                </p>
              </div>
              <p className="text-subhead text-muted-foreground leading-relaxed mt-4 pt-4 border-t border-border/20">
                All brand rights remain exclusively with AISH CAPITALS FZCO.
              </p>
            </div>
          </section>

          {/* 9. Intellectual Property */}
          <section id="ip" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              09. Intellectual Property
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-foreground leading-relaxed mb-4">
                All intellectual property relating to the platform is owned exclusively by 
                AISH CAPITALS FZCO, including:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Software & source code
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  UI & design systems
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Architecture & data
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Branding & content
                </p>
              </div>
              <p className="text-subhead text-muted-foreground leading-relaxed mt-4 pt-4 border-t border-border/20">
                This Agreement grants no ownership rights to the Dealer.
              </p>
            </div>
          </section>

          {/* 10. Suspension & Termination */}
          <section id="termination" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              10. Suspension & Termination
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-foreground leading-relaxed mb-3">REVVUP may suspend or terminate access:</p>
              <div className="space-y-2 mb-4">
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  For breach of this Agreement or Platform Policies
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  To protect platform integrity or users
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  At its discretion, where permitted by law
                </p>
              </div>
              <p className="text-subhead text-muted-foreground leading-relaxed pt-4 border-t border-border/20">
                Termination does not entitle compensation or waive outstanding obligations.
              </p>
            </div>
          </section>

          {/* 11. Disclaimer of Warranties */}
          <section id="warranties" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              11. Disclaimer of Warranties
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-foreground leading-relaxed mb-4">
                The platform is provided "as is" and "as available." REVVUP makes no warranties regarding:
              </p>
              <div className="grid grid-cols-3 gap-2">
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Availability
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Accuracy
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Outcomes
                </p>
              </div>
              <p className="text-subhead text-muted-foreground leading-relaxed mt-4 pt-4 border-t border-border/20">
                Use of the platform is at the Dealer's sole risk.
              </p>
            </div>
          </section>

          {/* 12. Limitation of Liability */}
          <section id="liability" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              12. Limitation of Liability
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-subhead text-foreground leading-relaxed">
                To the maximum extent permitted by law, REVVUP shall not be liable for disputes, 
                losses, or damages arising from Dealer listings or transactions, nor for indirect 
                or consequential damages.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                Where liability cannot be excluded, REVVUP's total liability is limited to subscription 
                fees paid during the preceding billing period.
              </p>
            </div>
          </section>

          {/* 13. Indemnification */}
          <section id="indemnification" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              13. Indemnification
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-foreground leading-relaxed mb-4">
                The Dealer agrees to indemnify and hold harmless REVVUP, AISH CAPITALS FZCO, and 
                their directors, officers, employees, and affiliates from claims arising out of:
              </p>
              <div className="grid grid-cols-3 gap-2">
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Dealer listings
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Dealer conduct
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Any breaches
                </p>
              </div>
            </div>
          </section>

          {/* 14. Acceptance of Agreement */}
          <section id="acceptance" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              14. Acceptance
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-foreground leading-relaxed">
                By creating, accessing, or continuing to use a Dealer account, the Dealer confirms 
                they have read, understood, and accepted this Agreement and all incorporated Policies.
              </p>
            </div>
          </section>

          {/* 15. Effectiveness and Ongoing Application */}
          <section id="effectiveness" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              15. Effectiveness
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-foreground leading-relaxed">
                This Agreement is effective as of the "Last Updated" date and remains in force 
                while the Dealer accesses the platform. Continued use constitutes ongoing acceptance.
              </p>
            </div>
          </section>

          {/* 16. Governing Law & Jurisdiction */}
          <section id="governing" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              16. Governing Law
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-subhead text-foreground leading-relaxed">
                This Agreement is governed by the laws of the United Arab Emirates.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                Any dispute shall be subject to the exclusive jurisdiction of the courts of the UAE.
              </p>
            </div>
          </section>

          {/* 17. Miscellaneous */}
          <section id="miscellaneous" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              17. Miscellaneous
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-subhead text-foreground leading-relaxed">
                This Agreement constitutes the entire understanding between REVVUP and the Dealer 
                regarding platform access.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                Failure to enforce a provision does not constitute waiver. Invalid provisions do 
                not affect remaining provisions.
              </p>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-16 pt-6 border-t border-border/40">
          <div className="flex items-center justify-between">
            <p className="text-caption1 text-muted-foreground/70">
              © 2026 AISH CAPITALS FZCO
            </p>
            <Link 
              href="/" 
              className="text-caption1 text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
