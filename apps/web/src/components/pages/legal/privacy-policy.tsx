/**
 * Privacy Policy Page
 * Legal documentation component following Revvup design patterns
 */

import Link from 'next/link';

export function PrivacyPolicy() {
  return (
    <section className="pt-28 pb-20 px-4 compact:px-6 large:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <p className="text-caption1 uppercase tracking-widest text-muted-foreground/70 mb-3">
            Legal
          </p>
          <h1 className="text-title3 font-semibold text-foreground tracking-tight">
            Privacy Policy
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
            This Privacy Policy explains how REVVUP collects, uses, stores, and protects personal data 
            when you access or use the Platform. Read with our{' '}
            <Link href="/terms-of-service" className="text-primary hover:underline font-medium">Terms of Service</Link>.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-caption1 text-muted-foreground/70">Related:</span>
            <Link href="/acceptable-use-policy" className="text-caption1 text-primary hover:underline font-medium">Acceptable Use</Link>
            <span className="text-muted-foreground/40">·</span>
            <Link href="/dealer-agreement" className="text-caption1 text-primary hover:underline font-medium">Dealer Agreement</Link>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          
          {/* 1. Scope */}
          <section>
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              01. Scope
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-subhead text-foreground leading-relaxed">
                This Privacy Policy applies to all visitors, registered users, and dealers who access 
                or use the Platform.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                By accessing or using the Platform, you acknowledge that personal data will be 
                processed in accordance with this Policy.
              </p>
            </div>
          </section>

          {/* 2. Information We Collect */}
          <section>
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              02. Information We Collect
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-foreground leading-relaxed mb-4">
                REVVUP may collect the following categories of information:
              </p>

              <div className="py-3 border-b border-border/20">
                <p className="text-subhead font-semibold text-foreground mb-2">Information You Provide</p>
                <div className="grid grid-cols-1 compact:grid-cols-2 gap-2">
                  <p className="text-subhead text-muted-foreground flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-1">•</span>
                    Name, email, phone
                  </p>
                  <p className="text-subhead text-muted-foreground flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-1">•</span>
                    Account credentials
                  </p>
                  <p className="text-subhead text-muted-foreground flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-1">•</span>
                    Business information
                  </p>
                  <p className="text-subhead text-muted-foreground flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-1">•</span>
                    Support communications
                  </p>
                </div>
              </div>

              <div className="py-3 border-b border-border/20">
                <p className="text-subhead font-semibold text-foreground mb-2">Collected Automatically</p>
                <div className="grid grid-cols-1 compact:grid-cols-2 gap-2">
                  <p className="text-subhead text-muted-foreground flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-1">•</span>
                    IP address
                  </p>
                  <p className="text-subhead text-muted-foreground flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-1">•</span>
                    Device & browser info
                  </p>
                  <p className="text-subhead text-muted-foreground flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-1">•</span>
                    Usage data & logs
                  </p>
                  <p className="text-subhead text-muted-foreground flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-1">•</span>
                    Cookies
                  </p>
                </div>
              </div>

              <div className="py-3">
                <p className="text-subhead font-semibold text-foreground mb-2">Payment Information</p>
                <p className="text-subhead text-muted-foreground leading-relaxed">
                  Subscription status and transaction identifiers. REVVUP does not store full payment 
                  card details—payments are processed securely by third-party providers.
                </p>
              </div>
            </div>
          </section>

          {/* 3. How We Use Information */}
          <section>
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              03. How We Use Information
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-foreground leading-relaxed mb-4">
                REVVUP uses personal data to:
              </p>
              <div className="grid grid-cols-1 compact:grid-cols-2 gap-2">
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Operate the Platform
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Manage accounts
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Process billing
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Communicate with users
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Improve functionality
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Detect fraud & abuse
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Comply with laws
                </p>
              </div>
              <p className="text-subhead text-foreground leading-relaxed mt-4 pt-4 border-t border-border/20">
                REVVUP does not sell personal data.
              </p>
            </div>
          </section>

          {/* 4. Cookies and Analytics */}
          <section>
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              04. Cookies and Analytics
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-subhead text-foreground leading-relaxed">
                The Platform uses cookies and similar technologies for core functionality and analytics.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                You may manage cookies through your browser settings. Disabling cookies may affect 
                functionality.
              </p>
            </div>
          </section>

          {/* 5. Data Sharing */}
          <section>
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              05. Data Sharing
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-foreground leading-relaxed mb-4">
                REVVUP may share personal data with:
              </p>
              <div className="grid grid-cols-1 compact:grid-cols-2 gap-2">
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Payment processors
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Cloud infrastructure
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Analytics providers
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Legal authorities
                </p>
              </div>
              <p className="text-subhead text-muted-foreground leading-relaxed mt-4 pt-4 border-t border-border/20">
                Third-party providers must comply with data protection standards. REVVUP does not share 
                data for advertising resale or unauthorized profiling.
              </p>
            </div>
          </section>

          {/* 6. Data Storage and Security */}
          <section>
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              06. Data Security
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-subhead text-foreground leading-relaxed">
                Personal data is stored using secure cloud infrastructure with appropriate technical 
                and organizational safeguards.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                While REVVUP implements reasonable security measures, no system is completely secure. 
                Users acknowledge this inherent risk.
              </p>
            </div>
          </section>

          {/* 7. Data Retention */}
          <section>
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              07. Data Retention
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-foreground leading-relaxed mb-4">
                Personal data is retained only as necessary to:
              </p>
              <div className="space-y-2">
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Provide the Platform
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Fulfill contractual obligations
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Comply with legal requirements
                </p>
              </div>
              <p className="text-subhead text-muted-foreground leading-relaxed mt-4 pt-4 border-t border-border/20">
                Data may be deleted or anonymized when no longer required.
              </p>
            </div>
          </section>

          {/* 8. User Rights */}
          <section>
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              08. User Rights
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-foreground leading-relaxed mb-4">
                Subject to applicable law, users may have the right to:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Access personal data
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Request corrections
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Request deletion
                </p>
                <p className="text-subhead text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-1">•</span>
                  Withdraw consent
                </p>
              </div>
              <p className="text-subhead text-muted-foreground leading-relaxed mt-4 pt-4 border-t border-border/20">
                Requests may be submitted via the contact details below.
              </p>
            </div>
          </section>

          {/* 9. Third-Party Links */}
          <section>
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              09. Third-Party Links
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-foreground leading-relaxed">
                The Platform may contain links to third-party websites. REVVUP is not responsible for 
                their privacy practices or content.
              </p>
            </div>
          </section>

          {/* 10. Policy Changes */}
          <section>
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              10. Policy Changes
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-subhead text-foreground leading-relaxed">
                REVVUP may update this Privacy Policy from time to time.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                Changes will be reflected by updating the "Last Updated" date. Continued use 
                constitutes acknowledgment of the updated Policy.
              </p>
            </div>
          </section>

          {/* 11. Contact */}
          <section>
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              11. Contact
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-subhead font-semibold text-muted-foreground/70">Legal Entity</p>
                  <p className="text-subhead text-foreground mt-0.5">AISH CAPITALS FZCO</p>
                </div>
                <div>
                  <p className="text-subhead font-semibold text-muted-foreground/70">Country</p>
                  <p className="text-subhead text-foreground mt-0.5">United Arab Emirates</p>
                </div>
                <div className="col-span-2">
                  <p className="text-subhead font-semibold text-muted-foreground/70">Contact</p>
                  <a 
                    href="mailto:support@revvup.ae" 
                    className="text-subhead text-primary hover:underline mt-0.5 inline-block"
                  >
                    support@revvup.ae
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* 12. Entire Policy */}
          <section>
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              12. Entire Policy
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-foreground leading-relaxed">
                This Privacy Policy forms part of the agreement between you and REVVUP and governs the 
                processing of personal data in connection with use of the Platform.
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
