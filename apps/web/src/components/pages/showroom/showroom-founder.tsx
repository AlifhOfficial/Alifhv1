/**
 * Showroom Founder
 * Personal touch. The face behind the brand.
 */

import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { getPublicUrl, isCdnUrl } from '@/utils/storage';
import type { ShowroomData } from './types';
import { getAmbientTheme } from './types';

interface ShowroomFounderProps {
  showroom: ShowroomData;
}

export function ShowroomFounder({ showroom }: ShowroomFounderProps) {
  if (!showroom.founderName) return null;

  const founderImageUrl = getPublicUrl(showroom.founderImage);
  const theme = getAmbientTheme(showroom.ambientStyle);

  return (
    <section id="showroom-founder" className={`${theme.sectionSpacing}`}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-0 items-stretch">
          
          {/* Image Side */}
          {founderImageUrl && (
            <div className="relative aspect-[4/5] lg:aspect-auto lg:min-h-[500px] rounded-xl lg:rounded-r-none overflow-hidden">
              <Image
                src={founderImageUrl}
                alt={showroom.founderName}
                fill
                unoptimized={isCdnUrl(founderImageUrl)}
                className="object-cover"
              />
            </div>
          )}

          {/* Content Side */}
          <div className={`p-8 sm:p-12 rounded-xl ${founderImageUrl ? 'lg:rounded-l-none' : ''} bg-sidebar border border-border/40 ${founderImageUrl ? 'lg:border-l-0' : ''} flex flex-col justify-center`}>
            
            {/* Label */}
            <span className="text-sm font-semibold uppercase tracking-wider text-primary mb-4 block">
              Leadership
            </span>
            
            {/* Quote */}
            {showroom.founderQuote && (
              <blockquote className="mb-6">
                <p className="text-lg sm:text-xl font-semibold text-foreground leading-relaxed">
                  "{showroom.founderQuote}"
                </p>
              </blockquote>
            )}
            
            {/* Founder Info */}
            <div className="mt-auto pt-6 border-t border-border/40">
              <p className="text-base font-semibold text-foreground">
                {showroom.founderName}
              </p>
              {showroom.founderTitle && (
                <p className="text-sm text-muted-foreground mt-1">
                  {showroom.founderTitle}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Skeleton
function ShowroomFounderSkeleton() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center">
            <Skeleton className="w-48 h-48 rounded-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </section>
  );
}
ShowroomFounder.Skeleton = ShowroomFounderSkeleton;
