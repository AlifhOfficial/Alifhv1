/**
 * Vision Hero Section - Inspired by We the UAE 2031
 * SEO-optimized content showing our aspirations in line with national goals
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export function VisionHeroSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Brand & Tagline */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Inspired by We the UAE 2031
          </p>
          <h1 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
            Towards New Peaks.
            <br />
            <span className="text-muted-foreground/70">In Automotive.</span>
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto pt-2">
            'We the UAE 2031' represents a national plan to continue the UAE's development path over the next decade. 
            As a private sector company, we're inspired by this vision as we build digital infrastructure 
            for automotive commerce in the UAE.
          </p>
        </div>

        {/* Hero Image */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[2.4/1] overflow-hidden rounded-lg mb-16">
          <Image
            src="/Abstract/uae1.jpg"
            alt="Alifh - Inspired by We the UAE 2031 Vision"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1400px) 100vw, 1400px"
          />
        </div>

        {/* Official Reference */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="p-6 rounded-lg border border-border/40 bg-sidebar">
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              On 22 November 2022, the UAE Government launched 'We the UAE 2031' during the UAE's Government Annual Meetings. 
              This 10-year framework aims to double the country's GDP from AED 1.49 trillion to AED 3 trillion, 
              positioning the UAE as a global partner and an attractive economic hub.
            </p>
            <p className="text-xs text-muted-foreground/60 mb-4 italic">
              Note: Alifh is an independent private company. We are not affiliated with, endorsed by, or officially 
              partnered with the UAE Government. This page reflects our aspiration to contribute to national goals.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="https://u.ae/en/about-the-uae/strategies-initiatives-and-awards/strategies-plans-and-visions/innovation-and-future-shaping/we-the-uae-2031-vision"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#0066FF] hover:text-[#0066FF]/80 transition-colors"
              >
                Official UAE Government Portal
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <span className="text-muted-foreground/40">|</span>
              <Link
                href="https://assets.u.ae/api/public/content/a08d5e681e85451db0255d62b429decf?v=0bcab764"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#0066FF] hover:text-[#0066FF]/80 transition-colors"
              >
                We the UAE 2031 Document (PDF)
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Vision Stats */}
        <div className="flex items-center justify-center gap-12 md:gap-20 pt-8 border-t border-border/40">
          <div className="text-center space-y-1">
            <div className="text-2xl font-semibold tracking-tight text-[#0066FF]">4</div>
            <div className="text-xs text-muted-foreground">Pillars</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-semibold tracking-tight text-[#0066FF]">2031</div>
            <div className="text-xs text-muted-foreground">Target Year</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-semibold tracking-tight text-[#0066FF]">3T</div>
            <div className="text-xs text-muted-foreground">AED GDP Goal</div>
          </div>
        </div>

      </div>
    </section>
  );
}
