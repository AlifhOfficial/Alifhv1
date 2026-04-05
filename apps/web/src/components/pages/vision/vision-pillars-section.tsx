/**
 * Vision Pillars Section - Our Contribution to We the UAE 2031
 * All 4 pillars with compelling narrative showing how Revvup supports national goals
 */

'use client';

import { MarketingImage as Image } from '@/components/pages/marketing-image';
import { Users, Shield, TrendingUp, Globe, Cpu, Leaf, Building2, CheckCircle2, Heart, Scale } from 'lucide-react';
import {
  pillarDiplomacyGlobal,
  pillarEconomyGrowth,
  pillarEcosystemDigital,
  pillarSocietyTrust,
} from '@/components/pages/marketing-image-assets';

// ============================================================================
// Types
// ============================================================================

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

// ============================================================================
// Sub-Components
// ============================================================================

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 rounded-xl border border-border/40 bg-sidebar">
      <Icon className="w-5 h-5 text-primary/80 mb-3" />
      <h3 className="text-callout font-semibold mb-1.5">{title}</h3>
      <p className="text-subhead text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function HighlightCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 rounded-xl bg-primary text-primary-foreground">
      <Icon className="w-5 h-5 text-primary-foreground/70 mb-3" />
      <h3 className="text-callout font-semibold mb-1.5">{title}</h3>
      <p className="text-subhead text-primary-foreground/70 leading-relaxed">{description}</p>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function VisionPillarsSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">

        {/* ═══════════════════════════════════════════════════════════════════
            PILLAR 1: FORWARD SOCIETY
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="mb-28">
          <div className="text-center mb-12 space-y-4">
            <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
              Pillar 1
            </span>
            <h3 className="text-title2 sm:text-title1 lg:text-display font-semibold tracking-tight">
              Forward Society.
              <br />
              <span className="text-muted-foreground">Prosperity through trust.</span>
            </h3>
          </div>

          {/* Image */}
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-sidebar border border-border/40 mb-12">
            <Image
              src={pillarSocietyTrust}
              alt="Forward Society - Building trust in UAE automotive"
              fill
              className="object-cover"
              sizes="(max-width: 1600px) 100vw, 1600px"
            />
          </div>

          {/* Description */}
          <p className="text-callout text-muted-foreground max-w-lg mx-auto text-center mb-12 leading-relaxed">
            In automotive, trust can be strengthened. Clear pricing. Verified sellers. No duplicates.
            One transparent transaction at a time.
          </p>

          {/* Feature Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <FeatureCard 
              icon={Shield}
              title="No duplicates"
              description="One car, one listing. Clean results."
            />
            <FeatureCard 
              icon={CheckCircle2}
              title="KYC verified users"
              description="Know who you're dealing with."
            />
            <FeatureCard 
              icon={Users}
              title="Verified dealers"
              description="Every partner is vetted and approved."
            />
            <HighlightCard 
              icon={Heart}
              title="Trust-first platform"
              description="Transparency is the standard."
            />
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            PILLAR 2: FORWARD ECONOMY
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="mb-28">
          <div className="text-center mb-12 space-y-4">
            <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
              Pillar 2
            </span>
            <h3 className="text-title2 sm:text-title1 lg:text-display font-semibold tracking-tight">
              Forward Economy.
              <br />
              <span className="text-muted-foreground">Growth through empowerment.</span>
            </h3>
          </div>

          {/* Image */}
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-sidebar border border-border/40 mb-12">
            <Image
              src={pillarEconomyGrowth}
              alt="Forward Economy - Supporting UAE economic growth"
              fill
              className="object-cover"
              sizes="(max-width: 1600px) 100vw, 1600px"
            />
          </div>

          {/* Description */}
          <p className="text-callout text-muted-foreground max-w-lg mx-auto text-center mb-12 leading-relaxed">
            Fair pricing. Full margins. Dealers keep more of their earnings—supporting growth, 
            hiring, and reinvestment in the UAE economy.
          </p>

          {/* Feature Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <FeatureCard 
              icon={Building2}
              title="SME empowerment"
              description="Small dealers compete on equal footing."
            />
            <FeatureCard 
              icon={Users}
              title="Job creation"
              description="Healthy dealers hire more staff."
            />
            <FeatureCard 
              icon={Globe}
              title="Local tech"
              description="Built in UAE. Revenue stays here."
            />
            <HighlightCard 
              icon={TrendingUp}
              title="Private sector growth"
              description="Enabling the economy of the future."
            />
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            PILLAR 3: FORWARD DIPLOMACY
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="mb-28">
          <div className="text-center mb-12 space-y-4">
            <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
              Pillar 3
            </span>
            <h3 className="text-title2 sm:text-title1 lg:text-display font-semibold tracking-tight">
              Forward Diplomacy.
              <br />
              <span className="text-muted-foreground">A force for good.</span>
            </h3>
          </div>

          {/* Image */}
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-sidebar border border-border/40 mb-12">
            <Image
              src={pillarDiplomacyGlobal}
              alt="Forward Diplomacy - UAE as a global automotive hub"
              fill
              className="object-cover"
              sizes="(max-width: 1600px) 100vw, 1600px"
            />
          </div>

          {/* Description */}
          <p className="text-callout text-muted-foreground max-w-lg mx-auto text-center mb-12 leading-relaxed">
            The automotive sector is evolving. Electric vehicles. Sustainable practices. 
            We aim to support this transition.
          </p>

          {/* Feature Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <FeatureCard 
              icon={Leaf}
              title="EV-ready platform"
              description="Full support for electric vehicles."
            />
            <FeatureCard 
              icon={Globe}
              title="Global standards"
              description="Best practices in transparency."
            />
            <FeatureCard 
              icon={Scale}
              title="Fair marketplace"
              description="Equal access for all participants."
            />
            <HighlightCard 
              icon={Heart}
              title="Values-driven"
              description="Integrity at every step."
            />
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            PILLAR 4: FORWARD ECOSYSTEM
        ═══════════════════════════════════════════════════════════════════ */}
        <div>
          <div className="text-center mb-12 space-y-4">
            <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
              Pillar 4
            </span>
            <h3 className="text-title2 sm:text-title1 lg:text-display font-semibold tracking-tight">
              Forward Ecosystem.
              <br />
              <span className="text-muted-foreground">Digital infrastructure.</span>
            </h3>
          </div>

          {/* Image */}
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-sidebar border border-border/40 mb-12">
            <Image
              src={pillarEcosystemDigital}
              alt="Forward Ecosystem - Digital automotive infrastructure"
              fill
              className="object-cover"
              sizes="(max-width: 1600px) 100vw, 1600px"
            />
          </div>

          {/* Description */}
          <p className="text-callout text-muted-foreground max-w-lg mx-auto text-center mb-12 leading-relaxed">
            Digital rails for automotive transactions. Online booking. Secure messaging. 
            Real-time inventory. Built for 2031 and beyond.
          </p>

          {/* Feature Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <FeatureCard 
              icon={Cpu}
              title="Modern tech stack"
              description="Built for speed and security."
            />
            <FeatureCard 
              icon={CheckCircle2}
              title="24/7 availability"
              description="Always on. Always accessible."
            />
            <FeatureCard 
              icon={Shield}
              title="Data security"
              description="Your information protected."
            />
            <HighlightCard 
              icon={Globe}
              title="API-first design"
              description="Ready for integration."
            />
          </div>
        </div>

      </div>
    </section>
  );
}
