/**
 * Partner Tools Section - Revvup Partners Page
 * Clean grid - tools that matter
 */

'use client';

import { MarketingImage as Image } from '@/components/pages/marketing-image';
import { Calendar, BarChart3, Package, Filter } from 'lucide-react';
import { mk1 } from '@/components/pages/marketing-image-assets';

export function PartnerToolsSection() {
  return (
    <section className="pt-28 pb-20 px-4 compact:px-6 large:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
            Your toolkit
          </span>
          <h2 className="text-title2 compact:text-title1 large:text-display font-semibold tracking-tight">
            What you need.
            <br />
            <span className="text-muted-foreground">Nothing you don't.</span>
          </h2>
        </div>

        {/* Infographic */}
        <div className="mb-12">
          <MessagingInfographic />
        </div>

        {/* Description */}
        <p className="text-callout text-muted-foreground leading-relaxed max-w-lg mx-auto text-center mb-16">
          Every chat tied to a car. Same customer, two cars? Two clean threads. No chaos.
        </p>

        {/* Tool Cards */}
        <div className="grid compact:grid-cols-2 large:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <ToolCard 
            icon={Calendar}
            title="Test drive booking"
            description="Set slots. Buyers book direct."
          />
          <ToolCard 
            icon={Filter}
            title="Quality leads"
            description="User-consented. Not spam."
          />
          <ToolCard 
            icon={Package}
            title="Inventory view"
            description="All cars. One dashboard."
          />
          
          {/* Highlighted Card */}
          <div className="p-6 rounded-xl bg-primary text-primary-foreground">
            <BarChart3 className="w-5 h-5 text-white/70 mb-3" />
            <h3 className="text-callout font-semibold mb-1">Analytics</h3>
            <p className="text-subhead text-white/60">
              Numbers that help you act.
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

interface ToolCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

function ToolCard({ icon: Icon, title, description }: ToolCardProps) {
  return (
    <div className="p-6 rounded-xl border border-border/40 bg-sidebar">
      <Icon className="w-5 h-5 text-primary/80 mb-3" />
      <h3 className="text-callout font-semibold mb-1">{title}</h3>
      <p className="text-subhead text-muted-foreground">{description}</p>
    </div>
  );
}

// ============================================================================
// INFOGRAPHIC: Messaging - Video + Info
// ============================================================================

function MessagingInfographic() {
  return (
    <Image
      src={mk1}
      alt="Revvup partner tools overview"
      width={2400}
      height={1600}
      className="w-full h-auto"
      priority
      sizes="(max-width: 1600px) 100vw, 1600px"
    />
  );
}
