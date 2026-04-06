/**
 * Brand Manifesto
 * Cinematic brand identity page - visual, bold, minimal text.
 * Follows Revvup design patterns: macOS frames, animations, video.
 */

'use client';

import { useTheme } from 'next-themes';
import { CheckCircle2 } from 'lucide-react';
import { BRAND_LOGO_SVG } from '@/lib/brand-assets';
import { cn } from '@/lib/utils';
import { MacOSWindow } from '@/components/ui/macos-window';

// ============================================================================
// HERO SECTION - Bold statement, logo showcase
// ============================================================================

function BrandHero() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== 'light';

  return (
    <section className="pt-28 pb-20 px-4 compact:px-6 large:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
            Brand
          </span>
          <h1 className="text-title2 compact:text-title1 large:text-display font-semibold tracking-tight">
            This is Revvup.
          </h1>
        </div>

        {/* Hero Infographic - Logo in macOS window */}
        <div className="mb-12">
          <LogoShowcaseInfographic isDark={isDark} />
        </div>

        {/* Description */}
        <p className="text-callout text-muted-foreground max-w-lg mx-auto text-center leading-relaxed">
          Our brand is our promise. Simple, honest, and built to last.
        </p>

        {/* Brand Stats */}
        <div className="flex items-center justify-center gap-12 regular:gap-20 pt-8 border-t border-border/40 mt-12">
          <div className="text-center space-y-1">
            <p className="text-title3 font-semibold tracking-tight text-primary">2026</p>
            <span className="text-subhead text-muted-foreground">Founded</span>
          </div>
          <div className="w-px h-10 bg-border/30 hidden compact:block" />
          <div className="text-center space-y-1">
            <p className="text-title3 font-semibold tracking-tight text-primary">Dubai</p>
            <span className="text-subhead text-muted-foreground">Headquarters</span>
          </div>
          <div className="w-px h-10 bg-border/30 hidden compact:block" />
          <div className="text-center space-y-1">
            <p className="text-title3 font-semibold tracking-tight text-primary">Self-funded</p>
            <span className="text-subhead text-muted-foreground">Zero VCs</span>
          </div>
        </div>

      </div>
    </section>
  );
}

// ============================================================================
// LOGO SHOWCASE INFOGRAPHIC
// ============================================================================

function LogoShowcaseInfographic({ isDark }: { isDark: boolean }) {
  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-sidebar border border-border/40 p-3 compact:p-6 large:p-12">
      <MacOSWindow url="revvup.ae/brand" contentClassName="flex items-center justify-center min-h-[280px] compact:min-h-[400px] large:min-h-[500px] xlarge:min-h-[600px] p-4 compact:p-8 large:p-16">
          <div 
            className="relative w-32 h-32 compact:w-48 compact:h-48 large:w-64 large:h-64 xlarge:w-80 xlarge:h-80"
            style={{ animation: 'logo-pulse 4s ease-in-out infinite' }}
          >
            <img
              src={BRAND_LOGO_SVG}
              alt="Revvup"
              className={cn('h-full w-auto', !isDark && 'invert')}
            />
          </div>
      </MacOSWindow>
    </div>
  );
}

// ============================================================================
// MANIFESTO SECTION - Values with cinematic infographic
// ============================================================================

function ManifestoSection() {
  return (
    <section className="pt-28 pb-20 px-4 compact:px-6 large:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        <div className="text-center mb-16 space-y-4">
          <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
            What We Believe
          </span>
          <h2 className="text-title2 compact:text-title1 large:text-display font-semibold tracking-tight">
            Built different.
            <br />
            <span className="text-muted-foreground">Stays different.</span>
          </h2>
        </div>

        {/* Manifesto Infographic */}
        <div className="mb-12">
          <ManifestoInfographic />
        </div>

        {/* Description */}
        <p className="text-callout text-muted-foreground max-w-lg mx-auto text-center leading-relaxed">
          No investors. No board meetings. No exit strategy. Just a founder who got tired of complaining and decided to build.
        </p>

      </div>
    </section>
  );
}

function ManifestoInfographic() {
  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-sidebar border border-border/40 p-3 compact:p-6 large:p-12">
      <MacOSWindow showUrlBar={false} contentClassName="flex items-center justify-center min-h-[280px] compact:min-h-[400px] large:min-h-[500px] p-4 compact:p-8 large:p-20">
          <div className="grid compact:grid-cols-2 gap-4 compact:gap-6 large:gap-12 max-w-4xl w-full px-2 compact:px-0">
            {[
              { label: "Transparency", delay: "1" },
              { label: "Quality", delay: "2" },
              { label: "Speed", delay: "3" },
              { label: "Simplicity", delay: "4" },
            ].map((value) => (
              <div 
                key={value.label}
                className="flex items-center gap-2 compact:gap-3 large:gap-4"
                style={{ animation: `fade-value-${value.delay} 6s ease-out infinite` }}
              >
                <CheckCircle2 className="w-5 h-5 compact:w-6 compact:h-6 large:w-8 large:h-8 text-primary flex-shrink-0" />
                <span className="text-headline compact:text-title2 large:text-title1 xlarge:text-display font-semibold text-white tracking-tight">
                  {value.label}
                </span>
              </div>
            ))}
          </div>
      </MacOSWindow>
    </div>
  );
}

// ============================================================================
// LOGO VARIANTS SECTION
// ============================================================================

function LogoVariantsSection() {
  return (
    <section className="pt-28 pb-20 px-4 compact:px-6 large:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        <div className="text-center mb-16 space-y-4">
          <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
            The Mark
          </span>
          <h2 className="text-title2 compact:text-title1 large:text-display font-semibold tracking-tight">
            Light. Dark.
            <br />
            <span className="text-muted-foreground">Always bold.</span>
          </h2>
        </div>

        {/* Logo Variants Infographic */}
        <div className="mb-12">
          <LogoVariantsInfographic />
        </div>

        {/* Usage note */}
        <p className="text-callout text-muted-foreground max-w-lg mx-auto text-center leading-relaxed">
          Minimum clear space: 1x logo height on all sides.
        </p>

      </div>
    </section>
  );
}

function LogoVariantsInfographic() {
  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-sidebar border border-border/40 p-3 compact:p-6 large:p-12">
      <MacOSWindow showUrlBar={false} contentClassName="flex flex-col regular:flex-row">
          {/* Light variant */}
          <div className="w-full regular:w-1/2 bg-white flex flex-col items-center justify-center p-8 compact:p-12 large:p-20 min-h-[220px] compact:min-h-[300px] large:min-h-[400px]">
            <div className="relative w-24 h-24 compact:w-32 compact:h-32 large:w-40 large:h-40 xlarge:w-48 xlarge:h-48">
              <img
                src={BRAND_LOGO_SVG}
                alt="Revvup Logo Dark"
                className="h-full w-auto invert"
              />
            </div>
            <span className="text-caption2 compact:text-caption1 large:text-subhead text-black/40 font-medium mt-4 compact:mt-6">Light backgrounds</span>
          </div>

          {/* Dark variant */}
          <div className="w-full regular:w-1/2 bg-black flex flex-col items-center justify-center p-8 compact:p-12 large:p-20 min-h-[220px] compact:min-h-[300px] large:min-h-[400px] border-t regular:border-t-0 regular:border-l border-white/10">
            <div className="relative w-24 h-24 compact:w-32 compact:h-32 large:w-40 large:h-40 xlarge:w-48 xlarge:h-48">
              <img
                src={BRAND_LOGO_SVG}
                alt="Revvup Logo Light"
                className="h-full w-auto"
              />
            </div>
            <span className="text-caption2 compact:text-caption1 large:text-subhead text-white/40 font-medium mt-4 compact:mt-6">Dark backgrounds</span>
          </div>
      </MacOSWindow>
    </div>
  );
}

// ============================================================================
// COLOR SECTION
// ============================================================================

function ColorSection() {
  return (
    <section className="pt-28 pb-20 px-4 compact:px-6 large:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        <div className="text-center mb-16 space-y-4">
          <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
            Palette
          </span>
          <h2 className="text-title2 compact:text-title1 large:text-display font-semibold tracking-tight">
            Three colors.
            <br />
            <span className="text-muted-foreground">That&apos;s it.</span>
          </h2>
        </div>

        {/* Color Infographic */}
        <div className="mb-12">
          <ColorInfographic />
        </div>

        {/* Description */}
        <p className="text-callout text-muted-foreground max-w-lg mx-auto text-center leading-relaxed">
          Blue for action. Black and white for everything else.
        </p>

      </div>
    </section>
  );
}

function ColorInfographic() {
  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-sidebar border border-border/40 p-3 compact:p-6 large:p-12">
      <MacOSWindow showUrlBar={false} contentClassName="flex flex-col compact:flex-row">
          {/* Primary Blue */}
          <div className="flex-1 bg-primary flex flex-col items-center justify-center p-6 compact:p-10 large:p-16 min-h-[150px] compact:min-h-[220px] large:min-h-[300px]">
            <span className="text-title2 compact:text-display large:text-display1 xlarge:text-display3 font-bold text-white tracking-tight">Blue</span>
            <span className="text-[9px] compact:text-caption1 large:text-subhead text-white/60 font-medium mt-2 compact:mt-3">#0066FF</span>
          </div>

          {/* White */}
          <div className="flex-1 bg-white flex flex-col items-center justify-center p-6 compact:p-10 large:p-16 min-h-[150px] compact:min-h-[220px] large:min-h-[300px] border-t compact:border-t-0 compact:border-l border-black/10">
            <span className="text-title2 compact:text-display large:text-display1 xlarge:text-display3 font-bold text-black tracking-tight">White</span>
            <span className="text-[9px] compact:text-caption1 large:text-subhead text-black/40 font-medium mt-2 compact:mt-3">#FFFFFF</span>
          </div>

          {/* Black */}
          <div className="flex-1 bg-black flex flex-col items-center justify-center p-6 compact:p-10 large:p-16 min-h-[150px] compact:min-h-[220px] large:min-h-[300px] border-t compact:border-t-0 compact:border-l border-white/10">
            <span className="text-title2 compact:text-display large:text-display1 xlarge:text-display3 font-bold text-white tracking-tight">Black</span>
            <span className="text-[9px] compact:text-caption1 large:text-subhead text-white/40 font-medium mt-2 compact:mt-3">#000000</span>
          </div>
      </MacOSWindow>
    </div>
  );
}

// ============================================================================
// VOICE SECTION - What we say vs don't say
// ============================================================================

function VoiceSection() {
  return (
    <section className="pt-28 pb-20 px-4 compact:px-6 large:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        <div className="text-center mb-16 space-y-4">
          <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
            Voice
          </span>
          <h2 className="text-title2 compact:text-title1 large:text-display font-semibold tracking-tight">
            Say less.
            <br />
            <span className="text-muted-foreground">Mean more.</span>
          </h2>
        </div>

        {/* Voice Comparison Grid */}
        <div className="grid compact:grid-cols-2 gap-px bg-border/40 rounded-lg overflow-hidden border border-border/40 max-w-5xl mx-auto">
          
          {/* We Say */}
          <div className="p-8 bg-primary text-primary-foreground">
            <p className="text-subhead font-semibold uppercase tracking-wider text-white/60 mb-8">We say</p>
            <div className="space-y-4">
              {[
                "Free. Forever.",
                "Zero commission.",
                "No games. Just cars.",
                "Quality wins.",
                "Your car. Your money.",
              ].map((phrase) => (
                <div key={phrase} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <span className="text-headline compact:text-title3 font-semibold">{phrase}</span>
                </div>
              ))}
            </div>
          </div>

          {/* We Don't Say */}
          <div className="p-8 bg-sidebar">
            <p className="text-subhead font-semibold uppercase tracking-wider text-muted-foreground/60 mb-8">We don&apos;t say</p>
            <div className="space-y-4">
              {[
                "The #1 marketplace...",
                "Revolutionizing...",
                "AI-powered blockchain...",
                "Synergize your journey...",
                "Unlock premium features...",
              ].map((phrase) => (
                <div key={phrase} className="flex items-center gap-3">
                  <span className="text-muted-foreground/40 text-headline">✗</span>
                  <span className="text-headline compact:text-title3 text-muted-foreground/60 line-through">{phrase}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

// ============================================================================
// CLOSING SECTION - Bold statement
// ============================================================================

function BrandClosing() {
  return (
    <section className="pt-28 pb-20 px-4 compact:px-6 large:px-8">
      <div className="max-w-[1600px] mx-auto">

        {/* Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
            The Promise
          </span>
          <h2 className="text-title2 compact:text-title1 large:text-display font-semibold tracking-tight">
            We don&apos;t change.
            <br />
            <span className="text-muted-foreground">We don&apos;t sell out.</span>
          </h2>
        </div>

        {/* Closing Infographic */}
        <div className="mb-12">
          <ClosingInfographic />
        </div>

        {/* Contact */}
        <p className="text-subhead text-muted-foreground text-center">
          Brand questions? <a href="mailto:support@revvup.ae" className="text-primary hover:underline">support@revvup.ae</a>
        </p>

      </div>
    </section>
  );
}

function ClosingInfographic() {
  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-sidebar border border-border/40 p-3 compact:p-6 large:p-12">
      <MacOSWindow showUrlBar={false} contentClassName="flex items-center justify-center min-h-[400px] compact:min-h-[500px] large:min-h-[600px] p-6 compact:p-10 large:p-16">
          <div className="text-center">
            <p className="wordmark-geom text-display1 compact:text-display3 large:text-display5 text-white">
              Revvup
            </p>
          </div>
      </MacOSWindow>
    </div>
  );
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

export function BrandManifesto() {
  return (
    <main className="min-h-screen">
      <BrandHero />
      <ManifestoSection />
      <LogoVariantsSection />
      <ColorSection />
      <VoiceSection />
      <BrandClosing />
    </main>
  );
}
