/**
 * Showroom Story
 * The narrative. Content top, full width media bottom.
 */

'use client';

import { Play } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getVideoEmbedUrl } from '@/components/partner/car-dealer/showroom/components';
import { getCdnPublicUrl } from '@/utils/storage';
import type { ShowroomData } from './types';
import { getAmbientTheme } from './types';

interface ShowroomStoryProps {
  showroom: ShowroomData;
}

export function ShowroomStory({ showroom }: ShowroomStoryProps) {
  if (!showroom.brandStoryContent) return null;

  const partner = showroom.partner;
  const storyImage = getCdnPublicUrl(showroom.brandStoryImage) || undefined;
  const { embedUrl } = getVideoEmbedUrl(showroom.brandStoryVideoUrl);
  const theme = getAmbientTheme(showroom.ambientStyle);

  return (
    <section id="showroom-story" className={`${theme.sectionSpacing}`}>
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header - Above Media */}
        <div className="px-4 sm:px-6 lg:px-8 mb-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary mb-4 block">
            {showroom.brandStoryTitle || 'Our Story'}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            The Story Behind
            <br />
            <span className="text-muted-foreground">{partner?.brandName}</span>
          </h2>
        </div>

        {/* Media */}
        <div className="px-4 sm:px-6 lg:px-8 mb-12">
          <StoryMedia 
            embedUrl={embedUrl}
            imageUrl={embedUrl ? undefined : storyImage}
            title={showroom.brandStoryTitle || 'Brand Story'}
          />
        </div>

        {/* Description - Below Media */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {showroom.brandStoryContent.split('\n\n').slice(0, 3).map((paragraph, idx) => (
              <p key={idx} className="text-base text-muted-foreground leading-relaxed">{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Story Media Sub-component (matches Hero video handling)
// ============================================================================

interface StoryMediaProps {
  embedUrl: string | null;
  imageUrl: string | undefined;
  title: string;
}

function StoryMedia({ embedUrl, imageUrl, title }: StoryMediaProps) {
  if (embedUrl) {
    return (
      <div className="relative aspect-[16/9] lg:aspect-[21/9] w-full rounded-xl overflow-hidden bg-sidebar border border-border/40">
        <iframe
          src={`${embedUrl}?autoplay=1&mute=1&loop=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  if (imageUrl) {
    return (
      <div className="relative aspect-[16/9] lg:aspect-[21/9] w-full rounded-xl overflow-hidden bg-sidebar border border-border/40">
        <img
          src={imageUrl}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/9] lg:aspect-[21/9] w-full rounded-xl overflow-hidden bg-sidebar border border-border/40">
      <div className="absolute inset-0 flex items-center justify-center">
        <Play className="w-12 h-12 text-muted-foreground/30" />
      </div>
    </div>
  );
}

// Skeleton
function ShowroomStorySkeleton() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <Skeleton className="h-3 w-20 mx-auto mb-4" />
          <Skeleton className="h-8 w-48 mx-auto" />
        </div>
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="aspect-[21/9] rounded-xl" />
        </div>
      </div>
    </section>
  );
}
ShowroomStory.Skeleton = ShowroomStorySkeleton;
