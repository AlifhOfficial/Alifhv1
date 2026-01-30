/**
 * Partner Brand Section - Alifh Partners Page
 * Visual showcase - full listing detail page mockup
 */

'use client';

import { Star, Clock, Package, CheckCircle2 } from 'lucide-react';

export function PartnerBrandSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Your brand
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
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
        <p className="text-base text-muted-foreground leading-relaxed max-w-lg mx-auto text-center mb-16">
          Others show your name and phone. We show inventory, response time, Google reviews, location—everything that builds trust.
        </p>

        {/* Feature highlights */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <FeatureCard 
            icon={Star}
            title="Google Reviews sync"
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
            <h3 className="text-base font-semibold mb-1">Verified badge</h3>
            <p className="text-sm text-white/60">
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
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

// ============================================================================
// INFOGRAPHIC: Full listing detail page mockup (matches actual UI)
// ============================================================================

function ListingDetailInfographic() {
  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-sidebar border border-border/40 p-3 sm:p-6 lg:p-14">
      <div className="relative w-full rounded-lg overflow-hidden border border-border/30 shadow-2xl">
        <video 
          src="/Marketing/lookgood6.mp4" 
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-auto"
        />
      </div>
    </div>
  );
}
