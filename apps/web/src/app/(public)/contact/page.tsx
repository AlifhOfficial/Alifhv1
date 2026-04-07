/**
 * Contact / Support Page
 * Clean, minimal design following Revvup design system
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { ContactForm } from '@/components/communications';
import { REVVUP_META_DESCRIPTION } from '@/lib/brand-messaging';

export const metadata: Metadata = {
  title: 'Contact Us | Revvup',
  description: REVVUP_META_DESCRIPTION,
  openGraph: {
    title: 'Contact Us | Revvup',
    description: REVVUP_META_DESCRIPTION,
  },
};

export default function ContactPage() {
  return (
    <section className="pt-28 pb-20 px-4 compact:px-6 large:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <p className="text-caption1 uppercase tracking-widest text-muted-foreground/70 mb-3">
            Support
          </p>
          <h1 className="text-title3 font-semibold text-foreground tracking-tight">
            Contact Us
          </h1>
        </div>

        {/* Response Time Info Card */}
        <div className="rounded-xl border border-border/40 bg-sidebar p-5 mb-10">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-subhead font-semibold text-muted-foreground/70">Response Time</p>
              <p className="text-subhead text-foreground mt-0.5">24-48 hours</p>
            </div>
            <div>
              <p className="text-subhead font-semibold text-muted-foreground/70">Email</p>
              <a 
                href="mailto:support@revvup.ae" 
                className="text-subhead text-primary hover:underline mt-0.5 inline-block"
              >
                support@revvup.ae
              </a>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div className="mb-10 py-5 border-y border-border/40">
          <p className="text-subhead text-foreground leading-relaxed">
            Have a question, need support, or interested in a partnership? We&apos;re here to help.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-caption1 text-muted-foreground/70">Quick links:</span>
            <Link href="/faq" className="text-caption1 text-primary hover:underline font-medium">Help Center</Link>
            <span className="text-muted-foreground/40">·</span>
            <Link href="/privacy-policy" className="text-caption1 text-primary hover:underline font-medium">Privacy</Link>
            <span className="text-muted-foreground/40">·</span>
            <Link href="/terms-of-service" className="text-caption1 text-primary hover:underline font-medium">Terms</Link>
          </div>
        </div>

        {/* Contact Form */}
        <ContactForm />

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
