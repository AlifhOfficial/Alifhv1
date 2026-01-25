/**
 * Showroom Story
 * The narrative. Content top, full width media bottom.
 */

'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { getPublicUrl } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { getVideoEmbedUrl } from '@/components/partner/car-dealer/showroom/components';
import type { ShowroomData } from './types';
import { getAmbientTheme } from './types';

interface ShowroomStoryProps {
  showroom: ShowroomData;
}

export function ShowroomStory({ showroom }: ShowroomStoryProps) {
  if (!showroom.brandStoryContent) return null;

  const partner = showroom.partner;
  const firstImage = showroom.showroomImages?.[0];
  
  // Check for uploaded video file first, then YouTube/Vimeo URL
  const storyVideoFileUrl = showroom.brandStoryVideoFile ? getPublicUrl(showroom.brandStoryVideoFile) : null;
  const { embedUrl } = getVideoEmbedUrl(showroom.brandStoryVideoUrl);
  const theme = getAmbientTheme(showroom.ambientStyle);

  return (
    <section id="showroom-story" className={`${theme.sectionSpacing}`}>
      <div className="max-w-[1600px] mx-auto">
        
        {/* Content - Top */}
        <div className="px-4 sm:px-6 lg:px-8 mb-8">
          <div className="max-w-3xl">
            <p className={`text-xs uppercase tracking-widest ${theme.labelClass} text-muted-foreground mb-3`}>
              {showroom.brandStoryTitle || 'Our Story'}
            </p>
            
            <h2 className={`text-xl sm:text-2xl lg:text-3xl ${theme.headingClass} text-foreground tracking-tight leading-tight mb-6`}>
              The Story Behind
              <br />
              <span className="text-muted-foreground/70">{partner?.brandName}</span>
            </h2>
            
            <div className={`${theme.bodyClass} text-muted-foreground leading-relaxed`}>
              {showroom.brandStoryContent.split('\n\n').slice(0, 3).map((paragraph, idx) => (
                <p key={idx} className={idx > 0 ? 'mt-4' : ''} style={{ fontSize: '1.25rem', lineHeight: '1.75rem' }}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
        
        {/* Media - Full Width Bottom */}
        <div className="px-4 sm:px-6 lg:px-8">
          <StoryMedia 
            storyVideoFileUrl={storyVideoFileUrl}
            embedUrl={embedUrl}
            firstImage={firstImage}
            title={showroom.brandStoryTitle || 'Brand Story'}
          />
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Story Media Sub-component (matches Hero video handling)
// ============================================================================

interface StoryMediaProps {
  storyVideoFileUrl: string | null;
  embedUrl: string | null;
  firstImage: string | undefined;
  title: string;
}

function StoryMedia({ storyVideoFileUrl, embedUrl, firstImage, title }: StoryMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  if (storyVideoFileUrl) {
    return (
      <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden bg-muted group">
        <video
          ref={videoRef}
          src={storyVideoFileUrl}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted={isMuted}
          loop
          playsInline
          controls={false}
          poster={firstImage ? getPublicUrl(firstImage) : undefined}
        />
        
        {/* Video Controls */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => {
              if (videoRef.current) {
                if (isPlaying) {
                  videoRef.current.pause();
                } else {
                  videoRef.current.play();
                }
                setIsPlaying(!isPlaying);
              }
            }}
            className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-foreground" />
            ) : (
              <Play className="w-4 h-4 text-foreground ml-0.5" />
            )}
          </button>
          
          <button
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.muted = !isMuted;
                setIsMuted(!isMuted);
              }
            }}
            className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-foreground" />
            ) : (
              <Volume2 className="w-4 h-4 text-foreground" />
            )}
          </button>
        </div>
      </div>
    );
  }

  if (embedUrl) {
    return (
      <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden bg-muted">
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

  if (firstImage) {
    return (
      <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden bg-muted">
        <Image
          src={getPublicUrl(firstImage) || firstImage}
          alt="Showroom"
          fill
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden bg-muted">
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
