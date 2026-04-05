/**
 * Terms of Service Page
 * Legal documentation component following Revvup design patterns
 */

'use client';

import Link from 'next/link';
import { useCallback } from 'react';

// Table of Contents items
const TOC_ITEMS = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'eligibility', title: 'Eligibility' },
  { id: 'accounts', title: 'Accounts' },
  { id: 'platform-role', title: 'Platform Role and Scope' },
  { id: 'dealer-responsibilities', title: 'Dealer Listings and Responsibilities' },
  { id: 'subscriptions', title: 'Subscriptions and Billing' },
  { id: 'acceptable-use', title: 'Acceptable Use' },
  { id: 'suspension', title: 'Suspension and Termination' },
  { id: 'intellectual-property', title: 'Intellectual Property' },
  { id: 'disclaimers', title: 'Disclaimers' },
  { id: 'limitation-liability', title: 'Limitation of Liability' },
  { id: 'indemnification', title: 'Indemnification' },
  { id: 'changes', title: 'Changes to Terms' },
  { id: 'governing-law', title: 'Governing Law' },
  { id: 'contact', title: 'Contact' },
  { id: 'entire-agreement', title: 'Entire Agreement' },
] as const;

export function TermsOfService() {
  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <p className="text-caption1 uppercase tracking-widest text-muted-foreground/70 mb-3">
            Legal
          </p>
          <h1 className="text-title3 font-semibold text-foreground tracking-tight">
            Terms of Service
          </h1>
        </div>

        {/* Meta Info Card */}
        <div className="rounded-xl border border-border/40 bg-sidebar p-5 mb-10">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-subhead font-semibold text-muted-foreground/70">Operator</p>
              <p className="text-subhead font-medium text-foreground mt-0.5">AISH CAPITALS FZCO</p>
            </div>
            <div>
              <p className="text-subhead font-semibold text-muted-foreground/70">Last Updated</p>
              <p className="text-subhead font-medium text-foreground mt-0.5">January 2026</p>
            </div>
          </div>
        </div>

        {/* Introduction Summary */}
        <div className="mb-10 py-5 border-y border-border/40">
          <p className="text-subhead text-foreground leading-relaxed">
            These Terms of Service create a legally binding contract between you and REVVUP, 
            operated by AISH CAPITALS FZCO. By using the Platform, you agree to these terms.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-caption1 text-muted-foreground/70">Related:</span>
            <Link href="/privacy-policy" className="text-caption1 text-primary hover:underline font-medium">Privacy</Link>
            <span className="text-muted-foreground/40">·</span>
            <Link href="/refund-policy" className="text-caption1 text-primary hover:underline font-medium">Refunds</Link>
            <span className="text-muted-foreground/40">·</span>
            <Link href="/acceptable-use-policy" className="text-caption1 text-primary hover:underline font-medium">Acceptable Use</Link>
            <span className="text-muted-foreground/40">·</span>
            <Link href="/dealer-agreement" className="text-caption1 text-primary hover:underline font-medium">Dealer Agreement</Link>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="mb-12">
          <h2 className="text-subhead font-bold tracking-tight text-foreground mb-4">
            Contents
          </h2>
          <div className="rounded-xl border border-border/40 bg-sidebar p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {TOC_ITEMS.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="flex items-center gap-3 text-left py-1.5 group"
                >
                  <span className="text-caption1 font-medium text-muted-foreground/50 w-5 tabular-nums">
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
          
          {/* Introduction */}
          <section id="introduction" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              01. Introduction
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-subhead text-foreground leading-relaxed">
                This Agreement governs access to and use of the REVVUP platform, website, and related 
                services (collectively, the "Platform").
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                By accessing or using the Platform, you agree to be bound by this Agreement. If you 
                do not agree, you must not access or use the Platform.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                Your use of the Platform is also subject to REVVUP's Privacy Policy, which is 
                incorporated into this Agreement by reference.
              </p>
            </div>
          </section>

          {/* Eligibility */}
          <section id="eligibility" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              02. Eligibility
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-subhead text-foreground leading-relaxed">
                You must be at least eighteen (18) years of age and legally capable of entering into 
                binding agreements to access or use the Platform.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                By using the Platform, you represent and warrant that you meet these requirements.
              </p>
            </div>
          </section>

          {/* Accounts */}
          <section id="accounts" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              03. Accounts
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-subhead text-foreground leading-relaxed">
                Certain features of the Platform require the creation of an account.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                You agree to provide accurate, current, and complete information and to keep such 
                information updated. You are responsible for maintaining the confidentiality of your 
                account credentials and for all activity conducted through your account.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                Each Dealer may maintain one account per legal entity or per showroom location, as 
                determined by REVVUP. REVVUP may require separate subscriptions for separate showroom 
                locations, branches, or operational entities.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                REVVUP reserves the right to refuse registration, restrict access, or require 
                additional verification at its discretion.
              </p>
            </div>
          </section>

          {/* Platform Role and Scope */}
          <section id="platform-role" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              04. Platform Role and Scope
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-subhead text-foreground leading-relaxed">
                REVVUP is a technology platform designed to facilitate structured visibility and 
                engagement between users.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                REVVUP does not buy, sell, own, or take custody of any items listed on the Platform 
                and does not inspect, verify, or certify the condition, legality, pricing, history, 
                or accuracy of any listing.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                REVVUP is not a party to, and bears no responsibility for, any transaction, payment, 
                agreement, or arrangement made between users. All dealings occur solely between the 
                involved parties.
              </p>
            </div>
          </section>

          {/* Dealer Listings and Responsibilities */}
          <section id="dealer-responsibilities" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              05. Dealer Listings and Responsibilities
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-subhead text-foreground leading-relaxed">
                Dealers are solely responsible for all listings and any statements, representations, 
                or information provided through the Platform, including accuracy, completeness, 
                legality, pricing, and availability.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                Dealers must comply with all applicable laws and regulations, including consumer 
                protection obligations, advertising standards, and any required licenses or permits.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                REVVUP may, at its discretion, remove, restrict, or suspend any listing or account at 
                any time.
              </p>
            </div>
          </section>

          {/* Subscriptions */}
          <section id="subscriptions" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              06. Subscriptions and Billing
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-foreground leading-relaxed mb-4">
                Certain Platform features require a paid subscription.
              </p>

              <div className="space-y-4">
                <div className="py-3 border-b border-border/20">
                  <p className="text-subhead font-semibold text-foreground mb-2">Billing</p>
                  <p className="text-subhead text-muted-foreground leading-relaxed">
                    Subscriptions are billed monthly in advance per approved Dealer account, showroom, 
                    or operational entity.
                  </p>
                </div>

                <div className="py-3 border-b border-border/20">
                  <p className="text-subhead font-semibold text-foreground mb-2">Setup Fee</p>
                  <p className="text-subhead text-muted-foreground leading-relaxed">
                    A one-time setup fee may apply. The setup fee is non-refundable.
                  </p>
                </div>

                <div className="py-3 border-b border-border/20">
                  <p className="text-subhead font-semibold text-foreground mb-2">No Guarantees</p>
                  <p className="text-subhead text-muted-foreground leading-relaxed">
                    REVVUP does not guarantee any specific level of exposure, visibility, leads, 
                    engagement, sales, or results.
                  </p>
                </div>

                <div className="py-3">
                  <p className="text-subhead font-semibold text-foreground mb-2">Refunds</p>
                  <p className="text-subhead text-muted-foreground leading-relaxed">
                    Upon cancellation, customers may request a full refund for the current billing 
                    month. Refunds are not automatic and are subject to approval. Approved refunds 
                    are processed within fourteen (14) business days. REVVUP may refuse refunds 
                    where there is evidence of fraud or abuse.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Acceptable Use */}
          <section id="acceptable-use" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              07. Acceptable Use
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-foreground leading-relaxed mb-4">
                You must not:
              </p>
              <ul className="space-y-2">
                <li className="text-subhead text-muted-foreground leading-relaxed flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Publish false, misleading, deceptive, or unlawful content
                </li>
                <li className="text-subhead text-muted-foreground leading-relaxed flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Misrepresent pricing, availability, ownership, history, or condition
                </li>
                <li className="text-subhead text-muted-foreground leading-relaxed flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Manipulate Platform behavior, rankings, or visibility
                </li>
                <li className="text-subhead text-muted-foreground leading-relaxed flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Scrape, copy, reverse engineer, or interfere with the Platform
                </li>
                <li className="text-subhead text-muted-foreground leading-relaxed flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Use automation, bots, or scripts without authorization
                </li>
                <li className="text-subhead text-muted-foreground leading-relaxed flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Engage in abusive, harassing, or harmful conduct
                </li>
              </ul>
              <p className="text-subhead text-muted-foreground leading-relaxed mt-4 pt-4 border-t border-border/20">
                REVVUP may investigate violations and take action including restricting content, 
                suspending accounts, or terminating this Agreement.
              </p>
            </div>
          </section>

          {/* Suspension and Termination */}
          <section id="suspension" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              08. Suspension and Termination
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-subhead text-foreground leading-relaxed">
                REVVUP may suspend or terminate access at any time, with or without notice, where a 
                user has violated this Agreement or engaged in conduct harmful to the Platform.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                Termination does not entitle you to refunds beyond those explicitly stated in 
                Section 6.
              </p>
            </div>
          </section>

          {/* Intellectual Property */}
          <section id="intellectual-property" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              09. Intellectual Property
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-subhead text-foreground leading-relaxed">
                The Platform and all associated intellectual property are owned exclusively by 
                AISH CAPITALS FZCO.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                Dealers are granted a limited, non-exclusive, non-transferable, revocable license 
                to access the Platform during an active Subscription.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                No ownership or intellectual property rights are transferred under any circumstances.
              </p>
            </div>
          </section>

          {/* Disclaimers */}
          <section id="disclaimers" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              10. Disclaimers
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-subhead text-foreground leading-relaxed">
                The Platform is provided on an "as is" and "as available" basis.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                REVVUP makes no warranties regarding availability, uptime, accuracy, reliability, 
                or outcomes and does not guarantee uninterrupted or error-free operation.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section id="limitation-liability" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              11. Limitation of Liability
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-subhead text-foreground leading-relaxed">
                To the maximum extent permitted by law, REVVUP shall not be liable for any indirect, 
                incidental, consequential, special, or punitive damages.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                Where liability cannot be excluded, REVVUP's total aggregate liability shall be 
                limited to the Subscription fees paid during the preceding billing period.
              </p>
            </div>
          </section>

          {/* Indemnification */}
          <section id="indemnification" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              12. Indemnification
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-foreground leading-relaxed">
                Dealers agree to indemnify and hold harmless REVVUP, its owners, affiliates, and 
                representatives from any claims, losses, damages, liabilities, and expenses arising 
                from listings, transactions, misrepresentations, disputes, or violations of law.
              </p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section id="changes" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              13. Changes to Terms
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-subhead text-foreground leading-relaxed">
                The Platform may be modified, suspended, or discontinued at any time.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                This Agreement may be updated periodically. Continued use of the Platform 
                constitutes acceptance of the revised Agreement.
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section id="governing-law" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              14. Governing Law
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-subhead text-foreground leading-relaxed">
                This Agreement is governed by the laws of the United Arab Emirates.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                The courts of the United Arab Emirates shall have exclusive jurisdiction over any 
                dispute arising from this Agreement.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section id="contact" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              15. Contact
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-subhead font-semibold text-muted-foreground/70">Legal Entity</p>
                  <p className="text-subhead font-medium text-foreground mt-0.5">AISH CAPITALS FZCO</p>
                </div>
                <div>
                  <p className="text-subhead font-semibold text-muted-foreground/70">Country</p>
                  <p className="text-subhead font-medium text-foreground mt-0.5">United Arab Emirates</p>
                </div>
                <div className="col-span-2">
                  <p className="text-subhead font-semibold text-muted-foreground/70">Contact</p>
                  <a 
                    href="mailto:support@revvup.ae" 
                    className="text-subhead font-medium text-primary hover:underline mt-0.5 inline-block"
                  >
                    support@revvup.ae
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Entire Agreement */}
          <section id="entire-agreement" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              16. Entire Agreement
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-foreground leading-relaxed">
                This Agreement constitutes the entire agreement between you and REVVUP regarding use 
                of the Platform and supersedes all prior understandings or agreements.
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
