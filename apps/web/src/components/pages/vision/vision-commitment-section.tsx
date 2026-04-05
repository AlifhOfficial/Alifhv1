/**
 * Vision Commitment Section - Our Commitment to UAE's Future
 * Our commitment and closing statement as an independent private company
 */

'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export function VisionCommitmentSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
            Our Commitment
          </span>
          <h2 className="text-title2 sm:text-title1 lg:text-display font-semibold tracking-tight">
            Built in the UAE.
            <br />
            <span className="text-muted-foreground">For the UAE.</span>
          </h2>
        </div>

        {/* Description */}
        <p className="text-callout text-muted-foreground max-w-lg mx-auto text-center mb-12 leading-relaxed">
          We're not a foreign platform adapted for this market. We're built here, by people who understand 
          the UAE's unique automotive culture and national aspirations.
        </p>

        {/* Quote Card */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="p-8 rounded-xl bg-primary text-primary-foreground text-center">
            <blockquote className="text-headline sm:text-title3 font-medium leading-relaxed mb-4">
              "Today we look forward to a new era… an era characterized by boundless ambitions 
              guaranteeing a prosperous future positioning our nation as a global leader."
            </blockquote>
            <p className="text-subhead text-primary-foreground/70">
              — We the UAE 2031
            </p>
          </div>
        </div>

        {/* Official References */}
        <div className="text-center space-y-4">
          <p className="text-caption1 text-muted-foreground/60 max-w-md mx-auto">
            Revvup is an independent private company and is not affiliated with or endorsed by the UAE Government.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="https://u.ae/en/about-the-uae/strategies-initiatives-and-awards/strategies-plans-and-visions/innovation-and-future-shaping/we-the-uae-2031-vision"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-subhead font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Official UAE Government Portal
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <span className="text-muted-foreground/40">|</span>
            <Link
              href="https://assets.u.ae/api/public/content/a08d5e681e85451db0255d62b429decf?v=0bcab764"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-subhead font-medium text-primary hover:text-primary/80 transition-colors"
            >
              We the UAE 2031 PDF
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
