/**
 * Partner Hero Section - Alifh Partners Page
 * Clean, minimal hero following Alifh Design System
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function PartnerHeroSection() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <section className="pt-28 pb-20 px-4">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Brand & Tagline */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            For Partners
          </p>
          <h1 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
            We don't compete with you.
            <br />
            <span className="text-muted-foreground/70">We help you grow.</span>
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto pt-2">
            Built to serve dealers, not replace them. No commissions. No token games. 
            No selling cars ourselves.
          </p>
        </div>

        {/* Main CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <Link
            href="/become-partner"
            className="w-full sm:w-auto h-11 px-8 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
          >
            Apply to Partner
          </Link>
          <Link
            href="/contact"
            className="w-full sm:w-auto h-11 px-8 bg-muted text-foreground text-sm font-medium rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
          >
            Talk to Us
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-12 md:gap-20 pt-8 border-t border-border/40">
          <div className="text-center space-y-1">
            <div className="text-2xl font-semibold tracking-tight text-foreground">0%</div>
            <div className="text-xs text-muted-foreground">Commission</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-semibold tracking-tight text-foreground">50</div>
            <div className="text-xs text-muted-foreground">Signature spots</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-semibold tracking-tight text-foreground">100%</div>
            <div className="text-xs text-muted-foreground">Your business</div>
          </div>
        </div>

      </div>
    </section>
  );
}
