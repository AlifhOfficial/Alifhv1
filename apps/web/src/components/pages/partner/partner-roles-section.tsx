/**
 * Partner Roles Section - Revvup Partners Page
 * Visual - simple dual-role system
 */

'use client';

import { Crown, UserCog, Compass, Package, Calendar, Inbox, BarChart3, Users, MessageCircle } from 'lucide-react';

export function PartnerRolesSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Team structure
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            Owner. Staff.
            <br />
            <span className="text-muted-foreground">Clean separation.</span>
          </h2>
        </div>

        {/* Infographic - Full width dashboard mockup */}
        <div className="mb-12">
          <RolesInfographic />
        </div>

        {/* Description */}
        <p className="text-base text-muted-foreground leading-relaxed max-w-lg mx-auto text-center mb-16">
          Each staff owns their listings, bookings, messages. Owner sees everything. Clean separation.
        </p>

        {/* Role Cards */}
        <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          <div className="p-6 rounded-xl bg-primary text-primary-foreground">
            <div className="flex items-center gap-3 mb-3">
              <Crown className="w-5 h-5 text-white/70" />
              <span className="text-base font-semibold">Owner</span>
            </div>
            <p className="text-sm text-white/60">
              Full stats. Brand control. Add & manage staff.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border/40 bg-sidebar">
            <div className="flex items-center gap-3 mb-3">
              <UserCog className="w-5 h-5 text-primary/80" />
              <span className="text-base font-semibold">Staff</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your listings. Your bookings. Your messages.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}

// ============================================================================
// INFOGRAPHIC: Actual dashboard screenshots with tab switcher
// ============================================================================

import { useState, useEffect } from 'react';

const OWNER_SCREENS = [
  '/Marketing/Partner_dashboard_shots/overviewtab.png',
  '/Marketing/Partner_dashboard_shots/inventorytab.png',
  '/Marketing/Partner_dashboard_shots/teamtab.png',
  '/Marketing/Partner_dashboard_shots/analyticstab.png',
];

const STAFF_SCREENS = [
  '/Marketing/Staff_dashboard_shots/invenotrytab.png',
  '/Marketing/Staff_dashboard_shots/leadstab.png',
  '/Marketing/Staff_dashboard_shots/bookingtab.png',
  '/Marketing/Staff_dashboard_shots/messeagestab.png',
];

function RolesInfographic() {
  const [activeRole, setActiveRole] = useState<'owner' | 'staff'>('owner');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const screens = activeRole === 'owner' ? OWNER_SCREENS : STAFF_SCREENS;
  
  // Auto-cycle through screens
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % screens.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [screens.length, activeRole]);
  
  // Reset index when switching roles
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeRole]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-sidebar border border-border/40">
      {/* Tab Switcher */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 p-3 sm:p-4 border-b border-border/20">
        <button
          onClick={() => setActiveRole('owner')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
            activeRole === 'owner' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
          }`}
        >
          <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Owner
        </button>
        <button
          onClick={() => setActiveRole('staff')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
            activeRole === 'staff' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
          }`}
        >
          <UserCog className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Staff
        </button>
      </div>
      
      {/* Screenshot Display */}
      <div className="relative aspect-[4/3] sm:aspect-[16/9] md:aspect-[2/1] overflow-hidden">
        {screens.map((src, index) => (
          <img
            key={src}
            src={src}
            alt={`${activeRole} dashboard`}
            className={`absolute inset-0 w-full h-full object-contain object-top transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>
      
      {/* Dots indicator */}
      <div className="flex items-center justify-center gap-1 sm:gap-1.5 p-3 sm:p-4 border-t border-border/20">
        {screens.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function SidebarNavItem({ icon: Icon, label, active, badge }: { icon: React.ComponentType<{ className?: string }>; label: string; active?: boolean; badge?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${active ? 'bg-sidebar-accent' : 'hover:bg-sidebar-accent/50'}`}>
      <Icon className={`w-4 h-4 ${active ? 'text-foreground' : 'text-muted-foreground'}`} />
      <span className={`text-sm font-semibold tracking-tight ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
      {badge && (
        <span className="ml-auto text-[10px] font-bold text-[#0066FF] bg-[#0066FF]/10 px-1.5 py-0.5 rounded">NEW</span>
      )}
    </div>
  );
}
