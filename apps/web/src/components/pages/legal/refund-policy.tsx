/**
 * Refund & Cancellation Policy Page
 * Legal documentation component following Revvup design patterns
 */

import Link from 'next/link';

export function RefundPolicy() {
  return (
    <section className="pt-28 pb-20 px-4 compact:px-6 large:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <p className="text-caption1 uppercase tracking-widest text-muted-foreground/70 mb-3">
            Legal
          </p>
          <h1 className="text-title3 font-semibold text-foreground tracking-tight">
            Refund & Cancellation Policy
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
          <p className="text-subhead text-foreground leading-relaxed">
            This policy governs subscription cancellations and refunds for the REVVUP platform. 
            It forms part of and should be read with our{' '}
            <Link href="/terms-of-service" className="text-primary hover:underline font-medium">Terms of Service</Link>.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-caption1 text-muted-foreground/70">Related:</span>
            <Link href="/dealer-agreement" className="text-caption1 text-primary hover:underline font-medium">Dealer Agreement</Link>
            <span className="text-muted-foreground/40">·</span>
            <Link href="/privacy-policy" className="text-caption1 text-primary hover:underline font-medium">Privacy Policy</Link>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          
          {/* 1. Subscription Model */}
          <section>
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              01. Subscription Model
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-subhead text-foreground leading-relaxed">
                REVVUP operates on a monthly subscription basis.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                Subscriptions renew automatically at the start of each billing cycle unless cancelled 
                prior to renewal.
              </p>
            </div>
          </section>

          {/* 2. Cancellation */}
          <section>
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              02. Cancellation
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-foreground leading-relaxed mb-4">
                Users may cancel their subscription at any time through their account or support channels.
              </p>
              <div className="space-y-2">
                <p className="text-subhead text-muted-foreground leading-relaxed flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Access continues until the end of the current billing month
                </p>
                <p className="text-subhead text-muted-foreground leading-relaxed flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  No future billing will occur following cancellation
                </p>
              </div>
            </div>
          </section>

          {/* 3. Refunds */}
          <section>
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              03. Refunds
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              
              <div className="py-3 border-b border-border/20">
                <p className="text-subhead font-semibold text-foreground mb-2">Monthly Subscription Fees</p>
                <div className="space-y-2">
                  <p className="text-subhead text-muted-foreground leading-relaxed flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-1">•</span>
                    Full refund of the current billing month only
                  </p>
                  <p className="text-subhead text-muted-foreground leading-relaxed flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-1">•</span>
                    Request must be submitted within the same billing month
                  </p>
                  <p className="text-subhead text-muted-foreground leading-relaxed flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-1">•</span>
                    Does not apply to prior or completed billing periods
                  </p>
                </div>
              </div>

              <div className="py-3 border-b border-border/20">
                <p className="text-subhead font-semibold text-foreground mb-2">One-Time Fees</p>
                <p className="text-subhead text-muted-foreground leading-relaxed">
                  Any setup, onboarding, or activation fees are non-refundable.
                </p>
              </div>

              <div className="py-3">
                <p className="text-subhead font-semibold text-foreground mb-2">Credits</p>
                <p className="text-subhead text-muted-foreground leading-relaxed">
                  Promotional or bonus credits have no cash value and are non-refundable.
                </p>
              </div>

            </div>
          </section>

          {/* 4. Refund Processing */}
          <section>
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              04. Refund Processing
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-subhead text-foreground leading-relaxed">
                Approved refunds are processed to the original payment method within fourteen (14) 
                business days.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                Actual time for funds to be received may vary depending on your bank or payment 
                provider.
              </p>
            </div>
          </section>

          {/* 5. Abuse & Enforcement */}
          <section>
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              05. Abuse & Enforcement
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-foreground leading-relaxed mb-4">
                REVVUP reserves the right to deny or reverse refunds where there is evidence of:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-subhead text-muted-foreground leading-relaxed flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Fraud
                </p>
                <p className="text-subhead text-muted-foreground leading-relaxed flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Abuse
                </p>
                <p className="text-subhead text-muted-foreground leading-relaxed flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Platform manipulation
                </p>
                <p className="text-subhead text-muted-foreground leading-relaxed flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Terms violation
                </p>
              </div>
            </div>
          </section>

          {/* 6. No Performance Guarantees */}
          <section>
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              06. No Guarantees
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-foreground leading-relaxed mb-4">
                Subscription fees relate solely to Platform access. REVVUP does not guarantee:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-subhead text-muted-foreground leading-relaxed flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Leads
                </p>
                <p className="text-subhead text-muted-foreground leading-relaxed flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Sales
                </p>
                <p className="text-subhead text-muted-foreground leading-relaxed flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Visibility
                </p>
                <p className="text-subhead text-muted-foreground leading-relaxed flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Any outcomes
                </p>
              </div>
            </div>
          </section>

          {/* 7. Policy Updates */}
          <section>
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              07. Policy Updates
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-subhead text-foreground leading-relaxed">
                REVVUP may update this Policy from time to time.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                Changes take effect upon publication. Continued use of the Platform constitutes 
                acceptance of the revised Policy.
              </p>
            </div>
          </section>

          {/* 8. Governing Law */}
          <section>
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              08. Governing Law
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-foreground leading-relaxed">
                This Policy is governed by the laws of the United Arab Emirates.
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
