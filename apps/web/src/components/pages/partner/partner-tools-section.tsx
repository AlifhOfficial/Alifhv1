/**
 * Partner Tools Section - Revvup Partners Page
 * Clean grid - tools that matter
 */

'use client';

import { Calendar, MessageCircle, BarChart3, Package, Filter } from 'lucide-react';
import { getStaticUrl } from '@/utils';

export function PartnerToolsSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Your toolkit
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
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
        <p className="text-base text-muted-foreground leading-relaxed max-w-lg mx-auto text-center mb-16">
          Every chat tied to a car. Same customer, two cars? Two clean threads. No chaos.
        </p>

        {/* Tool Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
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
            <h3 className="text-base font-semibold mb-1">Analytics</h3>
            <p className="text-sm text-white/60">
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
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

// ============================================================================
// INFOGRAPHIC: Messaging - Video + Info
// ============================================================================

function MessagingInfographic() {
  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-sidebar border border-border/40">
      <div className="flex flex-col md:flex-row min-h-[auto] md:min-h-[480px] lg:min-h-[600px]">
        {/* Left - Video (80% on desktop) */}
        <div className="w-full md:w-[80%] md:border-r border-border/20 p-3 sm:p-6 lg:p-14 flex items-center">
          <div className="relative w-full rounded-lg overflow-hidden border border-border/30 shadow-2xl">
            <video 
              src={getStaticUrl("/Marketing/messegingui2.mp4")} 
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto"
            />
          </div>
        </div>
        
        {/* Right - The Point (20% on desktop) */}
        <div className="w-full md:w-[20%] flex flex-col items-center justify-center py-6 md:py-4 px-4 sm:p-6 lg:p-8 border-t md:border-t-0 bg-sidebar/50">
          <MessageCircle className="w-8 h-8 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-primary mb-3 sm:mb-5" />
          <p className="text-sm sm:text-base lg:text-lg font-semibold text-foreground text-center mb-1 sm:mb-2">One car, one thread</p>
          <p className="text-[10px] sm:text-sm text-muted-foreground text-center leading-relaxed">Every message tied to a listing.</p>
        </div>
      </div>
    </div>
  );
}
