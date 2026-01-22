/**
 * Showroom Team
 * The people. Horizontal carousel with full-width hero.
 */

'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPublicUrl } from '@/utils';
import type { ShowroomData } from './types';
import { getAmbientTheme } from './types';

interface ShowroomTeamProps {
  showroom: ShowroomData;
}

export function ShowroomTeam({ showroom }: ShowroomTeamProps) {
  const members = showroom.teamMembers;
  const scrollRef = useRef<HTMLDivElement>(null);
  
  if (!members || members.length === 0) return null;

  const theme = getAmbientTheme(showroom.ambientStyle);
  
  // Use ambient image (index 8 or fallback)
  const ambientImage = showroom.showroomImages?.[8] || showroom.showroomImages?.[2];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

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
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            
            {/* Title overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className={`text-xs uppercase tracking-widest ${theme.labelClass} text-white/70 mb-2`}>
                {showroom.teamSectionTitle || 'Our Team'}
              </p>
              <h2 className={`text-xl sm:text-2xl lg:text-3xl ${theme.headingClass} text-white tracking-tight`}>
                Meet The Team
              </h2>
            </div>
          </div>
        )}

        {/* Header if no image */}
        {!ambientImage && (
          <div className="px-4 sm:px-6 lg:px-8 mb-8">
            <p className={`text-xs uppercase tracking-widest ${theme.labelClass} text-muted-foreground mb-3`}>
              {showroom.teamSectionTitle || 'Our Team'}
            </p>
            <h2 className={`text-xl sm:text-2xl lg:text-3xl ${theme.headingClass} text-foreground tracking-tight`}>
              Meet The Team
            </h2>
          </div>
        )}

        {/* Team Carousel */}
        <div className="relative group/scroll">
          {/* Navigation */}
          {members.length > 4 && (
            <div className="hidden sm:flex items-center gap-2 absolute -top-14 right-8 z-10">
              <button
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full bg-sidebar hover:bg-sidebar-accent border border-sidebar-border flex items-center justify-center transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-5 w-5 text-sidebar-foreground" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full bg-sidebar hover:bg-sidebar-accent border border-sidebar-border flex items-center justify-center transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-5 w-5 text-sidebar-foreground" />
              </button>
            </div>
          )}

          <div 
            ref={scrollRef}
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
