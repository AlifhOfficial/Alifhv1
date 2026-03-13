/**
 * Partner Roles Section - Revvup Partners Page
 * Visual - simple dual-role system
 */

'use client';

import { Crown, UserCog } from 'lucide-react';
import { MacOSWindow } from '@/components/ui/macos-window';

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
// INFOGRAPHIC: MacOS window with simple role separation
// ============================================================================

function RolesInfographic() {
  return (
    <MacOSWindow
      url="revvup.ae/team"
      contentClassName="flex items-center justify-center aspect-[3/4] sm:aspect-[4/3] md:aspect-[16/9] lg:aspect-[2.4/1] p-4 sm:p-8 lg:p-16"
    >
      <div className="flex max-w-4xl flex-col items-center text-center">
        <h3 className="text-[2rem] font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-7xl leading-[0.95]">
          Run the team.
          <br />
          <span className="text-white/38">Not the chaos.</span>
        </h3>

      </div>
    </MacOSWindow>
  );
}
