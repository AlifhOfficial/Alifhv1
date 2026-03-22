/**
 * Showroom Achievements
 * Awards, certifications, milestones. Horizontal carousel cards.
 */

'use client';

import { useRef } from 'react';
import { getVideoEmbedUrl } from '@/components/partner/car-dealer/showroom/components';
import { Skeleton } from '@/components/ui/skeleton';
import { getAppThumbUrl, getCdnPublicUrl } from '@/utils/storage';
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
  const achievementsSectionImage = getCdnPublicUrl(showroom.achievementsSectionImage);
  const { embedUrl: achievementsSectionVideoEmbedUrl } = getVideoEmbedUrl(showroom.achievementsSectionVideoUrl);

  return (
    <section id="showroom-achievements" className={`${theme.sectionSpacing}`}>
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="mb-8 px-4 sm:px-6 lg:px-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary mb-4 block">
            {showroom.achievementsSectionTitle || 'Recognition'}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            Awards & Milestones
          </h2>
        </div>

        {(achievementsSectionVideoEmbedUrl || achievementsSectionImage) && (
          <div className="mb-8 px-4 sm:px-6 lg:px-8">
            <div className="relative aspect-[16/9] lg:aspect-[21/9] w-full overflow-hidden rounded-xl bg-sidebar border border-border/40">
              {achievementsSectionVideoEmbedUrl ? (
                <iframe
                  src={`${achievementsSectionVideoEmbedUrl}?autoplay=1&mute=1&loop=1`}
                  title="Awards & Milestones"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              ) : achievementsSectionImage ? (
                <img
                  src={achievementsSectionImage}
                  alt="Awards & Milestones"
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : null}
            </div>
          </div>
        )}
        
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
                className="flex-shrink-0 w-[340px] sm:w-[380px] min-h-[280px] p-6 rounded-xl bg-sidebar border border-border/40 hover:border-primary/30 transition-all duration-300 group flex flex-col"
              >
                {/* Top Row - Year & Image */}
                <div className="flex items-start justify-between mb-6">
                  {/* Year */}
                  {achievement.year && (
                    <span className="text-2xl font-semibold text-muted-foreground/30">
                      {achievement.year}
                    </span>
                  )}
                  
                  {/* Achievement Image */}
                  {getAppThumbUrl(achievement.image) && (
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted ring-1 ring-border/40">
                      <img
                        src={getAppThumbUrl(achievement.image)!}
                        alt={achievement.title}
                        className="object-cover w-full h-full"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-2 flex-1">
                  <h3 className="text-base font-semibold text-foreground leading-snug">
                    {achievement.title}
                  </h3>
                  
                  {achievement.issuer && (
                    <p className="text-sm text-muted-foreground">
                      {achievement.issuer}
                    </p>
                  )}
                </div>

                {/* Card Number */}
                <div className="mt-6 pt-4 border-t border-border/40">
                  <span className="text-sm text-muted-foreground/50">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Description - Below Carousel */}
        <div className="mt-8 px-4 sm:px-6 lg:px-8">
          <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
            Years of dedication, recognized.
          </p>
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

// Skeleton
function ShowroomAchievementsSkeleton() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <Skeleton className="h-3 w-24 mx-auto mb-4" />
          <Skeleton className="h-8 w-56 mx-auto" />
        </div>
        <div className="flex gap-6 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="flex-shrink-0 w-72 h-40 rounded-xl" />
          ))}
        </div>
      </div>
    </section>
  );
}
ShowroomAchievements.Skeleton = ShowroomAchievementsSkeleton;
