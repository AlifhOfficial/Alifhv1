/**
 * Disclaimer Page
 * Legal documentation component following Revvup design patterns
 */

'use client';

import Link from 'next/link';

export function Disclaimer() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/70 mb-3">
            Legal
          </p>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            Disclaimer
          </h1>
        </div>

        {/* Meta Info Card */}
        <div className="rounded-xl border border-border/40 bg-sidebar p-5 mb-10">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-muted-foreground/70">Operator</p>
              <p className="text-sm font-medium text-foreground mt-0.5">AISH CAPITALS FZCO</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground/70">Last Updated</p>
              <p className="text-sm font-medium text-foreground mt-0.5">January 2026</p>
            </div>
          </div>
        </div>

        {/* Disclaimer Content */}
        <div className="space-y-10">
          
          {/* Platform Role */}
          <section>
            <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">
              01. Platform Role
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-sm text-foreground leading-relaxed">
                REVVUP is a technology platform operated by AISH CAPITALS FZCO. We do not buy, sell, 
                own, or take custody of any items listed on the Platform.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We do not inspect, verify, or certify the condition, history, legality, pricing, 
                or accuracy of any listings.
              </p>
            </div>
          </section>

          {/* No Transaction Responsibility */}
          <section>
            <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">
              02. Transactions
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-sm text-foreground leading-relaxed">
                REVVUP is not a party to, and bears no responsibility for, any transaction, payment, 
                agreement, or arrangement made between users.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All transactions and interactions occur solely between the involved parties. Listings 
                are published by independent dealers or users, who are solely responsible for content, 
                representations, and compliance with applicable laws.
              </p>
            </div>
          </section>

          {/* Use at Own Risk */}
          <section>
            <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">
              03. Use at Own Risk
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-sm text-foreground leading-relaxed">
                Use of the Platform is at your own discretion and risk.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                REVVUP does not guarantee any outcomes, results, availability, leads, or transactions 
                arising from use of the Platform.
              </p>
            </div>
          </section>

          {/* Related Policies */}
          <section>
            <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">
              04. Related Policies
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-sm text-foreground leading-relaxed mb-4">
                This Disclaimer should be read together with:
              </p>
              <div className="flex flex-wrap gap-2">
                <Link 
                  href="/terms-of-service" 
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Terms of Service
                </Link>
                <span className="text-muted-foreground/40">·</span>
                <Link 
                  href="/privacy-policy" 
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Privacy Policy
                </Link>
                <span className="text-muted-foreground/40">·</span>
                <Link 
                  href="/acceptable-use-policy" 
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Acceptable Use Policy
                </Link>
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-16 pt-6 border-t border-border/40">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground/70">
              © 2026 AISH CAPITALS FZCO
            </p>
            <Link 
              href="/" 
              className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
