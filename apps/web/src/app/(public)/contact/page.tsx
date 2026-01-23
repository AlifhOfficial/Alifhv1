/**
 * Contact / Support Page
 * Clean, minimal design following Alifh design system
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ContactForm } from '@/components/communications';

export const metadata: Metadata = {
  title: 'Contact Us | Alifh',
  description: 'Get in touch with our team. We\'re here to help with any questions, support requests, or partnership inquiries.',
  openGraph: {
    title: 'Contact Us | Alifh',
    description: 'Get in touch with our team for support, inquiries, or partnerships.',
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background pt-14 sm:pt-16">
      <div className="max-w-2xl mx-auto px-6 py-8 sm:py-12 space-y-8">
        
        {/* Back Link */}
        <Link 
          href="/faq" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground/70 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Help Center
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Contact Us</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            We typically respond within 24-48 hours
          </p>
        </div>

        {/* Contact Form */}
        <ContactForm />

        {/* Alternative Contact */}
        <div className="pt-4 border-t border-border/20">
          <p className="text-xs text-muted-foreground/60">
            You can also reach us at{' '}
            <a 
              href="mailto:support@alifh.com" 
              className="text-foreground hover:underline"
            >
              support@alifh.ae
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}
