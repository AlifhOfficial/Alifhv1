/**
 * Partner Brand Section - Revvup Partners Page
 * Visual showcase - full listing detail page mockup
 */

'use client';

import { MarketingImage as Image } from '@/components/pages/marketing-image';
import { Star, Clock, Package, CheckCircle2 } from 'lucide-react';
import { revx7 } from '@/components/pages/marketing-image-assets';

export function PartnerBrandSection() {
  return (
    <section className="pt-28 pb-20 px-4 compact:px-6 large:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
            Your brand
          </span>
          <h2 className="text-title2 compact:text-title1 large:text-display font-semibold tracking-tight">
            We make you look good.
            <br />
            <span className="text-muted-foreground">Really good.</span>
          </h2>
        </div>

        {/* Infographic - Full listing detail page mockup */}
        <div className="mb-12">
          <ListingDetailInfographic />
        </div>

        {/* Description */}
        <p className="text-callout text-muted-foreground leading-relaxed max-w-lg mx-auto text-center mb-16">
          Others show your name and phone. We show inventory, response time, Google rating, location—everything that builds trust.
        </p>

        {/* Feature highlights */}
        <div className="grid compact:grid-cols-2 large:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <FeatureCard 
            icon={Star}
            title="Google Rating sync"
            description="One tap. We handle the rest."
          />
          <FeatureCard 
            icon={Package}
            title="Live inventory count"
            description="Always up to date."
          />
          <FeatureCard 
            icon={Clock}
            title="Response metrics"
            description="Show buyers you're responsive."
          />
          
          {/* Highlighted Card */}
          <div className="p-6 rounded-xl bg-primary text-primary-foreground">
            <CheckCircle2 className="w-5 h-5 text-white/70 mb-3" />
            <h3 className="text-callout font-semibold mb-1">Verified badge</h3>
            <p className="text-subhead text-white/60">
              Build trust instantly.
            </p>
          </div>
        </div>

      </div>
    </section>
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
      <h3 className="text-callout font-semibold mb-1">{title}</h3>
      <p className="text-subhead text-muted-foreground">{description}</p>
    </div>
  );
}

// ============================================================================
// INFOGRAPHIC: Full listing detail page mockup (matches actual UI)
// ============================================================================

function ListingDetailInfographic() {
  return (
    <Image
      src={revx7}
      alt="Revvup partner brand showcase"
      width={2400}
      height={1600}
      className="w-full h-auto"
      priority
      sizes="(max-width: 1600px) 100vw, 1600px"
    />
  );
}
