import { MarketingImage as Image } from '@/components/pages/marketing-image';
import Link from 'next/link';
import { CircleDollarSign, Ban, CalendarCheck, Layout, CheckCircle2 } from 'lucide-react';
import { MacOSWindow } from '@/components/ui/macos-window';
import { m12 } from '@/components/pages/marketing-image-assets';

export function DifferentiatorsSection() {
  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
            How It Works
          </span>
          <h2 className="text-title2 sm:text-title1 lg:text-display font-semibold tracking-tight">
            Quality wins.
            <br />
            <span className="text-muted-foreground">Not money.</span>
          </h2>
        </div>

        {/* Infographic */}
        <div className="mb-12">
          <HumanFirstInfographic />
        </div>

        {/* Description */}
        <p className="text-callout text-muted-foreground max-w-lg mx-auto text-center mb-6 leading-relaxed">
          Good photos + honest description = higher rank. No paid boosts. Better listings win.
        </p>

        {/* CTA to How Ranking Works */}
        <div className="text-center mb-12">
          <Link
            href="/how-ranking-works"
            className="text-subhead text-primary hover:text-primary/80 transition-colors font-medium"
          >
            See how ranking works →
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <FeatureCard 
            icon={CircleDollarSign}
            title="Always free"
            description="List unlimited cars. No fees. No catches."
          />

          <FeatureCard 
            icon={Ban}
            title="No duplicates"
            description="One car, one listing. No spam or re-posts cluttering results."
          />

          <FeatureCard 
            icon={CalendarCheck}
            title="Easy test drives"
            description="Buyers book online. No back and forth."
          />

          {/* Highlighted Card */}
          <div className="p-6 rounded-xl bg-primary text-primary-foreground">
            <Layout className="w-5 h-5 text-primary-foreground/70 mb-3" />
            <h3 className="text-callout font-semibold mb-1.5">No ads anywhere</h3>
            <p className="text-subhead text-primary-foreground/70 leading-relaxed">
              Clean pages. Fast loading. Just cars.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

// ============================================================================
// FEATURE CARD COMPONENT
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
      <h3 className="text-callout font-semibold mb-1.5">{title}</h3>
      <p className="text-subhead text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

// ============================================================================
// INFOGRAPHIC: Quality Ranking - Elegant card elevation visualization
// ============================================================================

function HumanFirstInfographic() {
  return (
    <>
      <MacOSWindow url="revvup.ae/search" contentClassName="flex items-center justify-center p-4 sm:p-8 lg:p-16 aspect-[3/4] sm:aspect-[4/3] md:aspect-[16/9] lg:aspect-[2.4/1]">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-10 lg:gap-20 w-full max-w-5xl">
          {/* Quality Checklist - Left */}
          <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6 w-full lg:w-auto">
            <span className="text-[9px] sm:text-[10px] lg:text-caption1 text-white/40 mb-1 sm:mb-2">What ranks you higher</span>
            
            <div 
              className="flex items-center gap-2 sm:gap-3 lg:gap-4"
              style={{ animation: 'fade-check-1 6s ease-out infinite' }}
            >
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary flex-shrink-0" />
              <span className="text-caption1 sm:text-subhead lg:text-callout text-white/70">Clear, real photos</span>
            </div>

            <div 
              className="flex items-center gap-2 sm:gap-3 lg:gap-4"
              style={{ animation: 'fade-check-2 6s ease-out infinite' }}
            >
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary flex-shrink-0" />
              <span className="text-caption1 sm:text-subhead lg:text-callout text-white/70">Honest descriptions</span>
            </div>

            <div 
              className="flex items-center gap-2 sm:gap-3 lg:gap-4"
              style={{ animation: 'fade-check-3 6s ease-out infinite' }}
            >
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary flex-shrink-0" />
              <span className="text-caption1 sm:text-subhead lg:text-callout text-white/70">Quick responses</span>
            </div>

            <div 
              className="flex items-center gap-2 sm:gap-3 lg:gap-4"
              style={{ animation: 'fade-check-4 6s ease-out infinite' }}
            >
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary flex-shrink-0" />
              <span className="text-caption1 sm:text-subhead lg:text-callout text-white/70">Genuine buyer interest</span>
            </div>
          </div>

          {/* Elevated Card Result - Right */}
          <div 
            className="relative w-40 sm:w-56 lg:w-80 xl:w-[480px] aspect-[4/3] rounded-lg lg:rounded-xl overflow-hidden border border-white/10 flex-shrink-0"
            style={{ animation: 'card-elevate 6s ease-out infinite' }}
          >
            <Image src={m12} alt="" fill className="object-cover" sizes="(max-width: 640px) 160px, (max-width: 1280px) 320px, 480px" />
          </div>
        </div>
      </MacOSWindow>
    </>
  );
}
