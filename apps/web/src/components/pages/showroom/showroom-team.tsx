/**
 * Showroom Team
 * The people. Horizontal carousel with full-width hero.
 */

'use client';

import Image from 'next/image';

import { getPublicUrl } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';
import type { ShowroomData } from './types';
import { getAmbientTheme } from './types';

interface ShowroomTeamProps {
  showroom: ShowroomData;
}

export function ShowroomTeam({ showroom }: ShowroomTeamProps) {
  const members = showroom.teamMembers;
  
  if (!members || members.length === 0) return null;

  const theme = getAmbientTheme(showroom.ambientStyle);
  
  // Use ambient image (index 8 or fallback)
  const ambientImage = showroom.showroomImages?.[8] || showroom.showroomImages?.[2];

  return (
    <section id="showroom-team" className={`${theme.sectionSpacing}`}>
      <div className="max-w-[1600px] mx-auto">
        
        {/* Full Width Hero Image */}
        {ambientImage && (
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl mx-4 sm:mx-6 lg:mx-8 mb-12" style={{ width: 'calc(100% - 2rem)', marginLeft: '1rem', marginRight: '1rem' }}>
            <Image
              src={getPublicUrl(ambientImage) || ambientImage}
              alt="Our Team"
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Section Header - Above cards */}
        <div className="px-4 sm:px-6 lg:px-8 mb-8">
          <p className={`text-xs uppercase tracking-widest ${theme.labelClass} text-muted-foreground mb-3`}>
            {showroom.teamSectionTitle || 'Our Team'}
          </p>
          <h2 className={`text-xl sm:text-2xl lg:text-3xl ${theme.headingClass} text-foreground tracking-tight`}>
            Meet The Team
          </h2>
        </div>

        {/* Team Carousel */}
        <div className="relative group/scroll">
          <div 
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-4 sm:px-6 lg:px-8"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {members.map((member) => (
              <div 
                key={member.id} 
                className="flex-shrink-0 w-[260px] sm:w-[280px] p-6 rounded-2xl bg-sidebar border border-sidebar-border hover:border-sidebar-accent transition-all duration-300 group"
              >
                {/* Avatar */}
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-sidebar-accent/30 mb-4 ring-2 ring-sidebar-border group-hover:ring-sidebar-accent transition-colors">
                  {member.image ? (
                    <Image
                      src={getPublicUrl(member.image) || member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-lg ${theme.headingClass} text-sidebar-foreground/40`}>
                        {member.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div>
                  <h3 className={`text-sm ${theme.subheadingClass} text-sidebar-foreground`}>
                    {member.name}
                  </h3>
                  <p className="text-xs text-sidebar-foreground/60 mt-0.5">
                    {member.role}
                  </p>
                  {member.bio && (
                    <p className={`text-xs ${theme.bodyClass} text-sidebar-foreground/50 mt-2 line-clamp-3`}>
                      {member.bio}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Skeleton
function ShowroomTeamSkeleton() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <Skeleton className="h-3 w-16 mx-auto mb-4" />
          <Skeleton className="h-8 w-40 mx-auto" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center space-y-3">
              <Skeleton className="w-20 h-20 rounded-full mx-auto" />
              <Skeleton className="h-4 w-24 mx-auto" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
ShowroomTeam.Skeleton = ShowroomTeamSkeleton;
