/**
 * Partner Tools Section - Alifh Partners Page
 * Clean grid - tools that matter
 */

'use client';

import { Calendar, MessageCircle, BarChart3, Package, Filter } from 'lucide-react';

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
// INFOGRAPHIC: Realistic chat UI mockup
// ============================================================================

function MessagingInfographic() {
  return (
    <div className="relative w-full aspect-video sm:aspect-[2.4/1] rounded-lg overflow-hidden bg-sidebar border border-border/40">
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes typing-dots {
          0%, 20% { opacity: 0.3; }
          50% { opacity: 1; }
          80%, 100% { opacity: 0.3; }
        }
        @keyframes message-appear {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="h-full flex">
        {/* Chat Window */}
        <div className="flex-1 flex flex-col border-r border-border/20">
          {/* Chat Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/20 bg-background">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
              <img src="/Marketing/m8.jpeg" alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground truncate">Ahmed</span>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400">Active</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground/70 truncate">BMW M3 Competition</p>
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 p-4 bg-background space-y-3 overflow-hidden">
            {/* Date separator */}
            <div className="flex justify-center">
              <span className="text-[11px] text-muted-foreground/70 bg-muted/60 px-2.5 py-0.5 rounded-full font-semibold">Today</span>
            </div>
            
            {/* Listing preview card (attached to first message) */}
            <div className="flex gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
                <img src="/Marketing/m8.jpeg" alt="" className="w-full h-full object-cover" />
              </div>
              <div className="max-w-[75%]">
                <div className="rounded-xl overflow-hidden border border-border/30 bg-card shadow-sm mb-2">
                  <img src="/Marketing/m3.jpeg" alt="" className="w-full aspect-[16/10] object-cover" />
                  <div className="p-2.5 bg-card">
                    <p className="text-xs font-bold text-foreground">BMW M3 Competition</p>
                    <p className="text-[10px] text-muted-foreground">AED 385,000</p>
                  </div>
                </div>
                <div className="bg-sidebar border border-border/30 rounded-[18px] rounded-bl-md px-4 py-2.5">
                  <p className="text-sm font-medium text-foreground">Is this still available?</p>
                </div>
              </div>
            </div>
            
            {/* Your reply */}
            <div className="flex gap-2.5 flex-row-reverse" style={{ animation: 'message-appear 0.3s ease-out' }}>
              <div className="max-w-[75%]">
                <div className="bg-blue-500 text-white rounded-[18px] rounded-br-md px-4 py-2.5">
                  <p className="text-sm font-medium">Yes! Want to schedule a test drive?</p>
                </div>
                <div className="mt-1 flex items-center justify-end gap-1.5 px-2">
                  <span className="text-[10px] text-muted-foreground/70">Seen</span>
                  <div className="w-3.5 h-3.5 rounded-full overflow-hidden bg-muted">
                    <img src="/Marketing/m8.jpeg" alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Typing indicator */}
            <div className="flex gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
                <img src="/Marketing/m8.jpeg" alt="" className="w-full h-full object-cover" />
              </div>
              <div className="bg-sidebar border border-border/30 rounded-xl rounded-bl-md px-4 py-2.5 flex items-center gap-1">
                <span 
                  className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"
                  style={{ animation: 'typing-dots 1.4s ease-in-out infinite' }}
                />
                <span 
                  className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"
                  style={{ animation: 'typing-dots 1.4s ease-in-out infinite 0.2s' }}
                />
                <span 
                  className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"
                  style={{ animation: 'typing-dots 1.4s ease-in-out infinite 0.4s' }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* The Point */}
        <div className="w-64 sm:w-72 lg:w-80 flex flex-col items-center justify-center p-6 sm:p-8 bg-sidebar/50">
          <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-primary mb-4" />
          <p className="text-base sm:text-lg font-semibold text-foreground text-center mb-2">One car, one thread</p>
          <p className="text-sm text-muted-foreground text-center">Every message tied to a listing. No confusion.</p>
        </div>
      </div>
    </div>
  );
}
