/**
 * Showroom Team
 * The people. Horizontal carousel with full-width hero.
 */

'use client';

import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
        
        {/* Header - Above Image */}
        <div className="px-4 sm:px-6 lg:px-8 mb-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary mb-4 block">
            {showroom.teamSectionTitle || 'Our Team'}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            Meet The Team
          </h2>
        </div>

        {/* Full Width Hero Image */}
        {ambientImage && (
          <div className="px-4 sm:px-6 lg:px-8 mb-8">
            <div className="relative aspect-[16/9] lg:aspect-[21/9] w-full overflow-hidden rounded-xl bg-sidebar border border-border/40">
              <Image
                src={ambientImage}
                alt="Our Team"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Description - Below Image */}
        <div className="px-4 sm:px-6 lg:px-8 mb-8">
          <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
            The people behind every experience.
          </p>
        </div>

        {/* Team Carousel */}
        <div className="relative group/scroll">
          <div 
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-4 sm:px-6 lg:px-8"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {members.map((member) => (
              <Dialog key={member.id}>
                <DialogTrigger asChild>
                  <button 
                    className="flex-shrink-0 w-[260px] sm:w-[280px] h-[200px] p-6 rounded-xl bg-sidebar border border-border/40 hover:border-primary/30 transition-all duration-300 group text-left cursor-pointer"
                  >
                    {/* Avatar */}
                    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-muted mb-4 ring-2 ring-border/40 group-hover:ring-primary/30 transition-colors">
                      {member.image ? (
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-semibold text-muted-foreground">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="overflow-hidden">
                      <h3 className="text-base font-semibold text-foreground">
                        {member.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {member.role}
                      </p>
                      {member.bio && (
                        <p className="text-sm text-muted-foreground/70 mt-2 line-clamp-2">
                          {member.bio}
                        </p>
                      )}
                    </div>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted ring-2 ring-border/40 flex-shrink-0">
                        {member.image ? (
                          <Image
                            src={member.image}
                            alt={member.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl font-semibold text-muted-foreground">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <DialogTitle>{member.name}</DialogTitle>
                        <p className="text-sm text-muted-foreground mt-0.5">{member.role}</p>
                      </div>
                    </div>
                  </DialogHeader>
                  {member.bio && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {member.bio}
                    </p>
                  )}
                </DialogContent>
              </Dialog>
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
