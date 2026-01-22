/**
 * Showroom Achievements
 * Awards, certifications, milestones. Horizontal carousel cards.
 */

'use client';

import { useRef } from 'react';
import Image from 'next/image';

import { getPublicUrl } from '@/utils';
import type { ShowroomData } from './types';
import { getAmbientTheme } from './types';

interface ShowroomAchievementsProps {
  showroom: ShowroomData;
}

export function ShowroomAchievements({ showroom }: ShowroomAchievementsProps) {
  const achievements = showroom.achievements;
  const scrollRef = useRef<HTMLDivElement>(null);
  
  if (!achievements || achievements.length === 0) return null;

  const theme = getAmbientTheme(showroom.ambientStyle);

  return (
    <section id="showroom-achievements" className={`${theme.sectionSpacing}`}>
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="mb-8 px-4 sm:px-6 lg:px-8">
          <p className={`text-xs uppercase tracking-widest ${theme.labelClass} text-muted-foreground mb-4`}>
            {showroom.achievementsSectionTitle || 'Recognition'}
          </p>
          <h2 className={`text-xl sm:text-2xl lg:text-3xl ${theme.headingClass} text-foreground tracking-tight`}>
            Awards & Milestones
          </h2>
        </div>
        
        {/* Carousel */}
        <div className="relative group/scroll">
          <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-4 sm:px-6 lg:px-8"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {achievements.map((achievement, index) => (
              <div 
                key={achievement.id} 
                className="flex-shrink-0 w-[340px] sm:w-[380px] min-h-[280px] p-8 rounded-2xl bg-sidebar border border-sidebar-border hover:border-sidebar-accent transition-all duration-300 group flex flex-col"
              >
                {/* Top Row - Year & Image */}
                <div className="flex items-start justify-between mb-6">
                  {/* Year */}
                  {achievement.year && (
                    <span className={`text-3xl font-light ${theme.headingClass} text-sidebar-foreground/20`}>
                      {achievement.year}
                    </span>
                  )}
                  
                  {/* Achievement Image */}
                  {achievement.image && (
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-sidebar-accent/50 ring-1 ring-sidebar-border">
                      <Image
                        src={getPublicUrl(achievement.image) || achievement.image}
                        alt={achievement.title}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-2 flex-1">
                  <h3 className={`text-base ${theme.subheadingClass} text-sidebar-foreground leading-snug`}>
                    {achievement.title}
                  </h3>
                  
                  {achievement.issuer && (
                    <p className={`text-sm ${theme.bodyClass} text-sidebar-foreground/60`}>
                      {achievement.issuer}
                    </p>
                  )}
                </div>

                {/* Card Number */}
                <div className="mt-6 pt-4 border-t border-sidebar-border/50">
                  <span className="text-sm text-sidebar-foreground/30">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Dots (mobile) */}
        {achievements.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-4 sm:hidden">
            {achievements.slice(0, 5).map((_, idx) => (
              <div 
                key={idx} 
                className="w-1.5 h-1.5 rounded-full bg-sidebar-border"
              />
            ))}
            {achievements.length > 5 && (
              <span className="text-xs text-muted-foreground ml-1">+{achievements.length - 5}</span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
