/**
 * Slide: About Us
 * Company background.
 */

'use client';

import Image from 'next/image';

export function SlideAboutUs() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            About Revvup
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
            Built in Dubai. For Dealers.
          </h2>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
          
          {/* Left - Description */}
          <div className="space-y-6">
            <p className="text-xl text-muted-foreground leading-relaxed">
              <span className="text-foreground font-semibold">Revvup</span> is a next-generation car marketplace 
              in the UAE designed specifically for dealers.
            </p>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We eliminate the commission model, allowing partners to keep 100% of their sales. 
              By offering unlimited listings for a flat fee, we empower dealers to grow without 
              the burden of per-car costs or hidden upsells.
            </p>
          </div>

          {/* Right - Facts */}
          <div className="space-y-8">
            <div className="border-l-2 border-primary pl-6">
              <p className="text-foreground font-semibold text-lg mb-1">Headquarters</p>
              <p className="text-muted-foreground">Dubai, UAE. Founded in 2026 by AISH CAPITALS FZCO</p>
            </div>
            <div className="border-l-2 border-border pl-6">
              <p className="text-foreground font-semibold text-lg mb-1">Our Vision</p>
              <p className="text-muted-foreground">Supporting the UAE's Digital Economy Goals</p>
            </div>
            <div className="border-l-2 border-border pl-6">
              <p className="text-foreground font-semibold text-lg mb-1">Self-Funded</p>
              <p className="text-muted-foreground">No investors. No pressure. Building for the long run.</p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
