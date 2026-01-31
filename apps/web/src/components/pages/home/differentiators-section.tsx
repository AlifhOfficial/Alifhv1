/**
 * Differentiators Section - What Makes Us Different
 * Human First approach with feature cards
 */

'use client';

import Link from 'next/link';
import { CircleDollarSign, FileKey, CalendarCheck, Layout, CheckCircle2 } from 'lucide-react';

export function DifferentiatorsSection() {
  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
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
        <p className="text-base text-muted-foreground max-w-lg mx-auto text-center mb-6 leading-relaxed">
          Good photos + honest description = higher rank. No paid boosts. Better listings win.
        </p>

        {/* CTA to How Ranking Works */}
        <div className="text-center mb-12">
          <Link
            href="/how-ranking-works"
            className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
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
            icon={FileKey}
            title="VIN required"
            description="Every listing shows the VIN. Check the history yourself."
          />

          <FeatureCard 
            icon={CalendarCheck}
            title="Easy test drives"
            description="Buyers book online. No back and forth."
          />

          {/* Highlighted Card */}
          <div className="p-6 rounded-xl bg-primary text-primary-foreground">
            <Layout className="w-5 h-5 text-primary-foreground/70 mb-3" />
            <h3 className="text-base font-semibold mb-1.5">No ads anywhere</h3>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
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
    <div className="relative w-full rounded-lg overflow-hidden bg-sidebar border border-border/40 p-3 sm:p-6 lg:p-12">
      {/* CSS Animations */}
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
          0%, 70% { transform: translateY(0); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); }
          85%, 100% { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); }
        }
      `}</style>

      {/* macOS Window Frame - Full Width */}
      <div className="rounded-lg overflow-hidden shadow-2xl border border-white/10">
        {/* macOS Title Bar */}
        <div className="bg-[#28282a] px-3 sm:px-5 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 border-b border-black/20">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="hidden sm:flex items-center gap-1 ml-1">
            <div className="w-5 h-5 flex items-center justify-center text-white/30">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </div>
            <div className="w-5 h-5 flex items-center justify-center text-white/30">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-[#1c1c1e] rounded-md px-2 sm:px-4 py-1 sm:py-1.5 flex items-center gap-1.5 sm:gap-2 max-w-[120px] sm:max-w-[200px]">
              <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white/40 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
              <span className="text-[8px] sm:text-xs text-white/60 font-medium truncate">alifh.ae/search</span>
            </div>
          </div>
          <div className="w-6 sm:w-16" />
        </div>
        
        {/* Window Content */}
        <div className="bg-[#000] flex items-center justify-center p-6 sm:p-10 lg:p-16 aspect-[4/3] sm:aspect-[16/9] md:aspect-[2.4/1]">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10 sm:gap-16 lg:gap-20 w-full max-w-5xl">
            {/* Quality Checklist - Left */}
            <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6">
              <span className="text-[10px] sm:text-xs font-medium text-white/40 mb-2">What ranks you higher</span>
              
              <div 
                className="flex items-center gap-3 sm:gap-4"
                style={{ animation: 'fade-check-1 6s ease-out infinite' }}
              >
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                <span className="text-sm sm:text-base text-white/70">Clear, real photos</span>
              </div>

              <div 
                className="flex items-center gap-3 sm:gap-4"
                style={{ animation: 'fade-check-2 6s ease-out infinite' }}
              >
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                <span className="text-sm sm:text-base text-white/70">Honest descriptions</span>
              </div>

              <div 
                className="flex items-center gap-3 sm:gap-4"
                style={{ animation: 'fade-check-3 6s ease-out infinite' }}
              >
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                <span className="text-sm sm:text-base text-white/70">Quick responses</span>
              </div>

              <div 
                className="flex items-center gap-3 sm:gap-4"
                style={{ animation: 'fade-check-4 6s ease-out infinite' }}
              >
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                <span className="text-sm sm:text-base text-white/70">Genuine buyer interest</span>
              </div>
            </div>

            {/* Elevated Card Result - Right */}
            <div 
              className="relative w-52 sm:w-80 lg:w-[480px] aspect-[4/3] rounded-xl overflow-hidden border border-white/10"
              style={{ animation: 'card-elevate 6s ease-out infinite' }}
            >
              <img 
                src="/Marketing/m12.jpeg" 
                alt="" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
