/**
 * Partner Roles Section - Alifh Partners Page
 * Visual - simple dual-role system
 */

import Image from 'next/image';
import { Crown, UserCog } from 'lucide-react';

export function PartnerRolesSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Content */}
          <div className="space-y-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0066FF]">
              Team structure
            </p>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground tracking-tight leading-[1.15]">
              Owner. Staff.
              <br />
              <span className="text-muted-foreground/60">That's it.</span>
            </h2>
            
            <p className="text-[15px] text-muted-foreground leading-relaxed max-w-lg">
              Each staff owns their listings, bookings, messages. Owner sees everything. Clean separation.
            </p>
            
            <div className="flex items-center gap-8 pt-4">
              <div className="text-center space-y-1">
                <div className="text-xl font-bold tracking-tight text-[#0066FF]">2</div>
                <div className="text-[13px] text-muted-foreground">Roles total</div>
              </div>
              <div className="w-px h-10 bg-border/30" />
              <div className="text-center space-y-1">
                <div className="text-xl font-bold tracking-tight text-[#0066FF]">∞</div>
                <div className="text-[13px] text-muted-foreground">Staff members</div>
              </div>
              <div className="w-px h-10 bg-border/30" />
              <div className="text-center space-y-1">
                <div className="text-xl font-bold tracking-tight text-[#0066FF]">0</div>
                <div className="text-[13px] text-muted-foreground">Complexity</div>
              </div>
            </div>
          </div>
          
          {/* Role Cards */}
          <div className="space-y-4">
            <div className="p-6 rounded-lg bg-[#0066FF] text-white">
              <div className="flex items-center gap-3 mb-3">
                <Crown className="w-5 h-5 text-white/80" />
                <span className="text-[15px] font-semibold">Owner</span>
              </div>
              <p className="text-[13px] text-white/70 leading-relaxed">
                Full stats. Brand control. Add & manage staff. Pure oversight—no clutter.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/40 bg-sidebar">
              <div className="flex items-center gap-3 mb-3">
                <UserCog className="w-5 h-5 text-[#0066FF]" />
                <span className="text-[15px] font-semibold text-foreground">Staff</span>
              </div>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Your listings. Your bookings. Your messages. No overlap with others.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
