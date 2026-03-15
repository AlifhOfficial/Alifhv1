/**
 * Features Section - Built in Dubai
 * Platform features and capabilities
 */

'use client';

import { MarketingImage as Image } from '@/components/pages/marketing-image';
import { Clock, PenLine, Zap, Timer } from 'lucide-react';
import { MacOSWindow } from '@/components/ui/macos-window';
import { revx0 } from '@/components/pages/marketing-image-assets';

export function FeaturesSection() {
  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Made for UAE
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            Fast. Simple.
            <br />
            <span className="text-muted-foreground">Done right.</span>
          </h2>
        </div>

        {/* Infographic */}
        <div className="mb-12">
          <BuiltInDubaiInfographic />
        </div>

        {/* Description */}
        <p className="text-base text-muted-foreground max-w-md mx-auto text-center mb-12 leading-relaxed">
          Built in Dubai. For Dubai. By people tired of overpriced car sites.
        </p>

        {/* Feature Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <FeatureCard 
            icon={Clock}
            title="Book anytime"
            description="See a car you like at midnight? Book a test drive right there."
          />

          <FeatureCard 
            icon={PenLine}
            title="Edit anytime"
            description="Change price, photos, description. Unlimited updates."
          />

          <FeatureCard 
            icon={Zap}
            title="Blazing fast"
            description="Pages load instantly. No waiting. No spinners."
          />

          {/* Highlighted Card */}
          <div className="p-6 rounded-xl bg-primary text-primary-foreground">
            <Timer className="w-5 h-5 text-primary-foreground/70 mb-3" />
            <h3 className="text-base font-semibold mb-1.5">Fresh listings only</h3>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              Old listings auto-expire. No more sold cars.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 rounded-xl border border-border/40 bg-sidebar">
      <Icon className="w-5 h-5 text-primary/80 mb-3" />
      <h3 className="text-base font-semibold mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

// ============================================================================
// INFOGRAPHIC: Built in Dubai - Clean experience visualization
// ============================================================================

function BuiltInDubaiInfographic() {
  return (
    <MacOSWindow
      url="revvup.ae"
      contentClassName="flex flex-col md:flex-row items-stretch p-6 sm:p-10 lg:p-16 gap-8 lg:gap-12 aspect-[3/4] sm:aspect-[4/3] md:aspect-[16/9] lg:aspect-[2.4/1]"
    >
      <div className="w-full md:w-[52%] max-w-3xl flex flex-col justify-center">
        <span className="block text-[10px] sm:text-xs font-medium text-white/40 mb-5 sm:mb-7 lg:mb-8">
          What you don't see
        </span>

        <div className="space-y-3 sm:space-y-4 lg:space-y-5">
          <NoiseRow label="Banner ads" />
          <NoiseRow label="Sponsored listings" />
          <NoiseRow label="Pop-up promotions" />
          <NoiseRow label="Dealer upsells" />
          <NoiseRow label="Pay-to-rank" />
        </div>

        <p className="mt-6 sm:mt-8 lg:mt-10 text-sm sm:text-base lg:text-lg font-medium text-white/70">
          No noise. Ever.
        </p>
      </div>

      <div className="relative w-full md:w-[48%] aspect-[4/3] sm:aspect-[16/10] md:aspect-auto min-h-[220px] sm:min-h-[280px] md:min-h-0 max-w-[520px] md:max-w-none mx-auto">
        <Image
          src={revx0}
          alt="Revvup marketplace preview"
          fill
          className="object-contain object-center"
          sizes="(max-width: 767px) 100vw, 48vw"
        />
      </div>
    </MacOSWindow>
  );
}

function NoiseRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 text-white/55">
      <span className="text-base sm:text-lg lg:text-xl leading-none">✕</span>
      <span className="text-sm sm:text-base lg:text-lg">{label}</span>
    </div>
  );
}
