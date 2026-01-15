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
        
        {/* Commitment Statement */}
        <div className="max-w-3xl mx-auto mb-20">
          <div className="text-center mb-12 space-y-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Our Commitment
            </p>
            <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
              Built in the UAE.
              <br />
              <span className="text-muted-foreground/70">For the UAE.</span>
            </h2>
          </div>

          <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
            <p>
              Alifh isn't a foreign platform adapted for this market. We're built here, by people who understand 
              the UAE's unique automotive culture, business environment, and national aspirations.
            </p>
            <p>
              The 'We the UAE 2031' vision calls for "an environment that incentivizes innovation at global standards" 
              and positions the UAE as "the first destination for R&D investment." As part of the UAE's private sector, 
              we aspire to contribute by bringing world-class technology to a sector that has been underserved by innovation.
            </p>
            <p>
              We believe in the vision of a "forward economy" where the private sector plays "a pivotal role 
              in creating the economy of the future." Our zero-commission model isn't just a business decision—it's 
              our commitment to keeping capital in the hands of UAE businesses, enabling them to grow, hire, and contribute 
              to the nation's economic goals.
            </p>
            <p className="text-foreground font-medium">
              This aspiring journey starts today.
            </p>
          </div>
        </div>

        {/* Quote & References */}
        <div className="max-w-3xl mx-auto">
          <div className="p-8 rounded-xl bg-[#0066FF] text-white text-center mb-8">
            <blockquote className="text-lg sm:text-xl font-medium leading-relaxed mb-4">
              "Today we look forward to a new era… an era characterized by boundless ambitions 
              guaranteeing a prosperous future positioning our nation as a global leader impacting the world."
            </blockquote>
            <p className="text-sm text-white/70">
              — We the UAE 2031
            </p>
          </div>

          {/* Official References */}
          <div className="text-center space-y-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Official Government References
            </p>
            <p className="text-xs text-muted-foreground/60 max-w-md mx-auto">
              Alifh is an independent private company and is not affiliated with or endorsed by the UAE Government.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="https://u.ae/en/about-the-uae/strategies-initiatives-and-awards/strategies-plans-and-visions/innovation-and-future-shaping/we-the-uae-2031-vision"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border/40 bg-background text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
              >
                UAE Government Portal
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>
              <Link
                href="https://assets.u.ae/api/public/content/a08d5e681e85451db0255d62b429decf?v=0bcab764"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border/40 bg-background text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
              >
                We the UAE 2031 PDF
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
