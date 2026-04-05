/**
 * Acceptable Use Policy Page
 * Legal documentation component following Revvup design patterns
 */

'use client';

import Link from 'next/link';
import { useCallback } from 'react';

// Table of Contents items
const TOC_ITEMS = [
  { id: 'purpose', title: 'Purpose' },
  { id: 'permitted', title: 'Permitted Use' },
  { id: 'prohibited', title: 'Prohibited Conduct' },
  { id: 'enforcement', title: 'Enforcement' },
  { id: 'monitoring', title: 'No Obligation to Monitor' },
  { id: 'reporting', title: 'Reporting Violations' },
  { id: 'governing', title: 'Governing Law' },
] as const;

export function AcceptableUsePolicy() {
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
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <p className="text-caption1 uppercase tracking-widest text-muted-foreground/70 mb-3">
            Legal
          </p>
          <h1 className="text-title3 font-semibold text-foreground tracking-tight">
            Acceptable Use Policy
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
          <p className="text-subhead text-foreground leading-relaxed mb-4">
            This Policy sets out permitted and prohibited conduct when accessing the REVVUP platform. 
            It forms part of the Terms of Service and applies to all users.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/terms-of-service" className="text-caption1 text-primary hover:underline font-medium">Terms</Link>
            <span className="text-muted-foreground/40">·</span>
            <Link href="/dealer-agreement" className="text-caption1 text-primary hover:underline font-medium">Dealer Agreement</Link>
            <span className="text-muted-foreground/40">·</span>
            <Link href="/privacy-policy" className="text-caption1 text-primary hover:underline font-medium">Privacy</Link>
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
          
          {/* 1. Purpose */}
          <section id="purpose" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              01. Purpose
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-subhead text-foreground leading-relaxed">
                REVVUP is a curated digital platform.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                This Policy protects platform integrity, trust, and quality, ensuring use remains 
                lawful, accurate, and aligned with REVVUP standards.
              </p>
            </div>
          </section>

          {/* 2. Permitted Use */}
          <section id="permitted" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              02. Permitted Use
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-foreground leading-relaxed mb-4">
                The Platform may be used only for its intended purposes and in compliance with:
              </p>
              <div className="space-y-2">
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Applicable laws and regulations of the UAE
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  The REVVUP Terms of Service
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  This Acceptable Use Policy
                </p>
              </div>
            </div>
          </section>

          {/* 3. Prohibited Conduct */}
          <section id="prohibited" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              03. Prohibited Conduct
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-foreground leading-relaxed mb-5">
                The following conduct is strictly prohibited:
              </p>
              
              {/* a. Misrepresentation */}
              <div className="mb-5">
                <p className="text-caption1 font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Misrepresentation & False Content
                </p>
                <div className="space-y-1.5">
                  <p className="text-subhead text-muted-foreground flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-1">•</span>
                    Posting inaccurate, misleading, or incomplete information
                  </p>
                  <p className="text-subhead text-muted-foreground flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-1">•</span>
                    Misstating vehicle details, pricing, condition, or history
                  </p>
                  <p className="text-subhead text-muted-foreground flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-1">•</span>
                    Listing items without legal authority
                  </p>
                </div>
              </div>

              {/* b. Fraudulent Activity */}
              <div className="mb-5">
                <p className="text-caption1 font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Fraudulent or Abusive Activity
                </p>
                <div className="space-y-1.5">
                  <p className="text-subhead text-muted-foreground flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-1">•</span>
                    Fraud, impersonation, or identity misrepresentation
                  </p>
                  <p className="text-subhead text-muted-foreground flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-1">•</span>
                    Manipulating listings, rankings, or platform mechanics
                  </p>
                  <p className="text-subhead text-muted-foreground flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-1">•</span>
                    Circumventing subscription limits or safeguards
                  </p>
                </div>
              </div>

              {/* c. Platform Misuse */}
              <div className="mb-5">
                <p className="text-caption1 font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Platform Misuse
                </p>
                <div className="space-y-1.5">
                  <p className="text-subhead text-muted-foreground flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-1">•</span>
                    Creating duplicate, fake, or misleading accounts
                  </p>
                  <p className="text-subhead text-muted-foreground flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-1">•</span>
                    Scraping or harvesting data without authorization
                  </p>
                  <p className="text-subhead text-muted-foreground flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-1">•</span>
                    Using bots, scripts, or automation without permission
                  </p>
                  <p className="text-subhead text-muted-foreground flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-1">•</span>
                    Introducing malware or security threats
                  </p>
                </div>
              </div>

              {/* d. Improper Communications */}
              <div className="mb-5">
                <p className="text-caption1 font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Improper Communications
                </p>
                <div className="space-y-1.5">
                  <p className="text-subhead text-muted-foreground flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-1">•</span>
                    Spam, unsolicited outreach, or deceptive redirection
                  </p>
                  <p className="text-subhead text-muted-foreground flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-1">•</span>
                    Harassment, threats, or discriminatory conduct
                  </p>
                  <p className="text-subhead text-muted-foreground flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-1">•</span>
                    Misleading users into off-platform transactions
                  </p>
                </div>
              </div>

              {/* e. Legal Violations */}
              <div>
                <p className="text-caption1 font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Legal & Regulatory Violations
                </p>
                <div className="space-y-1.5">
                  <p className="text-subhead text-muted-foreground flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-1">•</span>
                    Uploading unlawful or prohibited content
                  </p>
                  <p className="text-subhead text-muted-foreground flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-1">•</span>
                    Violating consumer protection or licensing laws
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Enforcement */}
          <section id="enforcement" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              04. Enforcement
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-foreground leading-relaxed mb-4">
                REVVUP may, at its discretion and where permitted by law:
              </p>
              <div className="space-y-2 mb-4">
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Remove or restrict listings or content
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Limit, suspend, or terminate account access
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Take action to protect Platform integrity or compliance
                </p>
              </div>
              <p className="text-subhead text-muted-foreground leading-relaxed pt-4 border-t border-border/20">
                Such actions may be taken with or without prior notice.
              </p>
            </div>
          </section>

          {/* 5. No Obligation to Monitor */}
          <section id="monitoring" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              05. No Obligation to Monitor
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-subhead text-foreground leading-relaxed">
                REVVUP is not obligated to actively monitor user activity or content but reserves 
                the right to do so.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                Failure to enforce this Policy in any instance does not constitute a waiver of 
                REVVUP's rights.
              </p>
            </div>
          </section>

          {/* 6. Reporting Violations */}
          <section id="reporting" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              06. Reporting Violations
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-subhead text-foreground leading-relaxed">
                Suspected violations may be reported through official REVVUP support channels.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                REVVUP may review reported conduct and take appropriate action based on assessment.
              </p>
            </div>
          </section>

          {/* 7. Governing Law */}
          <section id="governing" className="scroll-mt-28">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              07. Governing Law
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-subhead text-foreground leading-relaxed">
                This Policy is governed by the laws of the United Arab Emirates.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                Effective as of the "Last Updated" date and applies while you continue to access 
                the Platform.
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
