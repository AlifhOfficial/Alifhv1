/**
 * Differentiators Section - What Makes Us Different
 * Human First approach with feature cards
 */

'use client';

import Link from 'next/link';
import { CircleDollarSign, FileKey, CalendarCheck, Layout, MousePointer2, ArrowRight, CheckCircle2 } from 'lucide-react';

export function DifferentiatorsSection() {
  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            What makes us different
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            Human First.
            <br />
            <span className="text-muted-foreground">Not Corporate First.</span>
          </h2>
        </div>

        {/* Infographic */}
        <div className="mb-12">
          <HumanFirstInfographic />
        </div>

        {/* Description */}
        <p className="text-base text-muted-foreground max-w-lg mx-auto text-center mb-16 leading-relaxed">
          Listings rank by photo quality, description completeness, response time, and seller rating. Not who pays the most.
        </p>

        {/* Feature Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16">
          <FeatureCard 
            icon={CircleDollarSign}
            title="No listing fee"
            description="Not now. Not ever. Not even later."
          />

          <FeatureCard 
            icon={FileKey}
            title="VIN is public"
            description="Because transparency builds trust."
          />

          <FeatureCard 
            icon={CalendarCheck}
            title="Test drives book themselves"
            description="Instant scheduling. No back and forth."
          />

          {/* Highlighted Card */}
          <div className="p-6 rounded-xl bg-primary text-primary-foreground">
            <Layout className="w-5 h-5 text-primary-foreground/70 mb-3" />
            <h3 className="text-base font-semibold mb-1.5">No ads. Zero clutter.</h3>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              Clean, fast, focused experience.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/how-ranking-works"
            className="w-full sm:w-auto h-12 px-10 bg-primary text-primary-foreground text-base font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
          >
            See how ranking works
          </Link>
          <Link
            href="/listings"
            className="w-full sm:w-auto h-12 px-10 bg-muted text-foreground text-base font-semibold rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
          >
            Browse listings
          </Link>
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
      <h3 className="text-base font-semibold mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
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
    <div className="relative w-full aspect-[16/9] sm:aspect-[2.4/1] rounded-lg overflow-hidden bg-sidebar border border-border/40">
      {/* CSS Animations - slow and controlled */}
      <style jsx>{`
        @keyframes fade-check-1 {
          0%, 15% { opacity: 0; transform: scale(0.5); }
          25%, 100% { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-check-2 {
          0%, 30% { opacity: 0; transform: scale(0.5); }
          40%, 100% { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-check-3 {
          0%, 45% { opacity: 0; transform: scale(0.5); }
          55%, 100% { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-check-4 {
          0%, 60% { opacity: 0; transform: scale(0.5); }
          70%, 100% { opacity: 1; transform: scale(1); }
        }
        @keyframes card-elevate {
          0%, 70% { transform: translateY(0); box-shadow: 0 4px 20px rgba(0, 102, 255, 0.1); }
          85%, 100% { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0, 102, 255, 0.25); }
        }
        @keyframes rank-appear {
          0%, 75% { opacity: 0; transform: translateY(10px); }
          90%, 100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow-pulse {
          0%, 80% { opacity: 0; }
          90%, 100% { opacity: 1; }
        }
      `}</style>

      <div className="h-full flex items-center justify-center gap-8 sm:gap-16 lg:gap-32 xl:gap-40 p-6 sm:p-10 lg:p-12">
        {/* Left - Quality Checklist */}
        <div className="flex flex-col gap-3 sm:gap-4 lg:gap-5">
          <span className="text-xs font-medium text-muted-foreground/60 mb-2">What helps your listing</span>
          
          {/* Quality Items */}
          <div 
            className="flex items-center gap-3 lg:gap-4"
            style={{ animation: 'fade-check-1 6s ease-out infinite' }}
          >
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-primary" />
            <span className="text-xs sm:text-sm text-foreground/80">Clear, real photos</span>
          </div>

          <div 
            className="flex items-center gap-3 lg:gap-4"
            style={{ animation: 'fade-check-2 6s ease-out infinite' }}
          >
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-primary" />
            <span className="text-xs sm:text-sm text-foreground/80">Honest descriptions</span>
          </div>

          <div 
            className="flex items-center gap-3 lg:gap-4"
            style={{ animation: 'fade-check-3 6s ease-out infinite' }}
          >
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-primary" />
            <span className="text-xs sm:text-sm text-foreground/80">Quick responses</span>
          </div>

          <div 
            className="flex items-center gap-3 lg:gap-4"
            style={{ animation: 'fade-check-4 6s ease-out infinite' }}
          >
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-primary" />
            <span className="text-xs sm:text-sm text-foreground/80">Genuine buyer interest</span>
          </div>
        </div>

        {/* Center - Arrow */}
        <div className="hidden sm:flex flex-col items-center gap-2">
          <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 text-muted-foreground/30" />
        </div>

        {/* Right - Elevated Card Result */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-medium text-primary mb-4">Result</span>
          
          <div className="relative">
            {/* Glow effect */}
            <div 
              className="absolute -inset-3 lg:-inset-4 rounded-2xl bg-primary/10 blur-xl"
              style={{ animation: 'glow-pulse 6s ease-out infinite' }}
            />
            
            {/* Card */}
            <div 
              className="relative w-40 sm:w-56 lg:w-72 xl:w-80 aspect-[4/3] rounded-xl overflow-hidden"
              style={{ animation: 'card-elevate 6s ease-out infinite' }}
            >
              <img 
                src="/Marketing/m12.jpeg" 
                alt="" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>

            {/* Rank Badge */}
            <div 
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary shadow-lg shadow-primary/30"
              style={{ animation: 'rank-appear 6s ease-out infinite' }}
            >
              <span className="text-[10px] sm:text-xs font-medium text-primary-foreground">#1 in search</span>
            </div>
          </div>
          
          <p 
            className="text-xs text-muted-foreground/50 mt-8 text-center"
            style={{ animation: 'rank-appear 6s ease-out infinite' }}
          >
            No payment required
          </p>
        </div>
      </div>
    </div>
  );
}
