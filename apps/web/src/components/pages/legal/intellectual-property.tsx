/**
 * Intellectual Property & Copyright Notice Page
 * Legal documentation component following Revvup design patterns
 */

'use client';

import Link from 'next/link';

export function IntellectualProperty() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/70 mb-3">
            Legal
          </p>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            Intellectual Property
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

        {/* Introduction Summary */}
        <div className="mb-10 py-5 border-y border-border/40">
          <p className="text-sm text-foreground leading-relaxed">
            This Notice governs ownership, licensing, and permitted use of the REVVUP platform. 
            It forms part of our{' '}
            <Link href="/terms-of-service" className="text-primary hover:underline font-medium">Terms of Service</Link>.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-xs text-muted-foreground/70">Related:</span>
            <Link href="/dealer-agreement" className="text-xs text-primary hover:underline font-medium">Dealer Agreement</Link>
            <span className="text-muted-foreground/40">·</span>
            <Link href="/acceptable-use-policy" className="text-xs text-primary hover:underline font-medium">Acceptable Use</Link>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          
          {/* 1. Ownership */}
          <section>
            <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">
              01. Ownership
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-sm text-foreground leading-relaxed">
                REVVUP is a proprietary platform owned and operated by AISH CAPITALS FZCO, 
                incorporated in the United Arab Emirates.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All intellectual property rights—including software, source code, architecture, 
                databases, algorithms, UI, design language, branding, trademarks, logos, and 
                underlying systems—are owned exclusively by AISH CAPITALS FZCO.
              </p>
            </div>
          </section>

          {/* 2. License to Use */}
          <section>
            <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">
              02. License to Use
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-sm text-foreground leading-relaxed">
                Subject to compliance with the Terms of Service, REVVUP grants users a limited, 
                non-exclusive, non-transferable, non-sublicensable, and revocable license to 
                access and use the Platform.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                For dealers, this license applies only during an active subscription period.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                No ownership or intellectual property rights are transferred under any circumstances.
              </p>
            </div>
          </section>

          {/* 3. Restrictions */}
          <section>
            <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">
              03. Restrictions
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-sm text-foreground leading-relaxed mb-4">
                Users and dealers may not, directly or indirectly:
              </p>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Copy, reproduce, modify, adapt, or create derivative works
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Reverse engineer, decompile, or extract source code
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Scrape, collect, replicate, or mirror Platform data
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Sell, resell, sublicense, or commercially exploit the Platform
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Remove or alter any copyright or proprietary notices
                </p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mt-4 pt-4 border-t border-border/20">
                Unauthorized use constitutes a material violation of this Notice and the Terms of Service.
              </p>
            </div>
          </section>

          {/* 4. Enforcement */}
          <section>
            <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">
              04. Enforcement
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-sm text-foreground leading-relaxed">
                AISH CAPITALS FZCO reserves the right to protect and enforce its intellectual 
                property rights in accordance with applicable law, including by taking legal 
                action and restricting, suspending, or terminating access to the Platform.
              </p>
            </div>
          </section>

          {/* 5. Reservation of Rights */}
          <section>
            <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">
              05. Reservation of Rights
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-sm text-foreground leading-relaxed">
                All rights not expressly granted under this Notice or the Terms of Service are 
                reserved by AISH CAPITALS FZCO.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This Notice is effective as of the 'Last Updated' date and applies to all access 
                to and use of the Platform.
              </p>
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
