/**
 * Showroom Hero
 * Full-bleed media first, then clean content block below.
 * Immersive, minimal, lets the brand breathe.
 */

'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getVideoEmbedUrl } from '@/components/partner/car-dealer/showroom/components';
import { getPublicUrl } from '@/utils/storage';
import type { ShowroomData } from './types';
import { getAmbientTheme } from './types';

interface ShowroomHeroProps {
  showroom: ShowroomData;
}

export function ShowroomHero({ showroom }: ShowroomHeroProps) {
  const partner = showroom.partner;
  const videoRef = useRef<HTMLVideoElement>(null);
  const theme = getAmbientTheme(showroom.ambientStyle);
  
  // Video state
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const heroImageUrl = getPublicUrl(showroom.heroImage);
  
  // Check for uploaded video file first, then YouTube/Vimeo URL
  const heroVideoFileUrl = getPublicUrl((showroom as any).heroVideoFile);
  const { embedUrl: heroVideoEmbedUrl } = getVideoEmbedUrl(showroom.heroVideoUrl);
  
  // Priority: Video first, then image, then gradient
  const hasUploadedVideo = !!heroVideoFileUrl;
  const hasEmbeddedVideo = !!heroVideoEmbedUrl;
  const hasImage = !!heroImageUrl;
  
  const showUploadedVideo = hasUploadedVideo;
  const showEmbeddedVideo = !hasUploadedVideo && hasEmbeddedVideo;
  const showImage = !hasUploadedVideo && !hasEmbeddedVideo && hasImage;
  const showGradient = !hasUploadedVideo && !hasEmbeddedVideo && !hasImage;

  // Brand colors for gradient
  const primaryColor = showroom.primaryColor || '#000000';
  const accentColor = showroom.accentColor || '#c9a962';

  // Stats data
  const hasStats = showroom.yearsInBusiness || showroom.totalCarsSold || partner.googleRating;

  // Preload video
  useEffect(() => {
    if (heroVideoFileUrl) {
      const existingLink = document.querySelector(`link[href="${heroVideoFileUrl}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'video';
        link.href = heroVideoFileUrl;
        link.setAttribute('fetchpriority', 'high');
        document.head.appendChild(link);
      }
    }
  }, [heroVideoFileUrl]);

  return (
    <section className={theme.sectionSpacing}>
      <div className="max-w-[1600px] mx-auto">
        
        {/* Brand Name & Tagline - Top, Centered */}
        <div className="px-4 sm:px-6 lg:px-8 mb-8 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary mb-4 block">
            {partner.brandName}
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            {(() => {
              const tagline = showroom.heroTagline || `Welcome to ${partner.brandName}`;
              const words = tagline.split(' ');
              const midPoint = Math.ceil(words.length / 2);
              const firstHalf = words.slice(0, midPoint).join(' ');
              const secondHalf = words.slice(midPoint).join(' ');
              return (
                <>
                  {firstHalf}
                  {secondHalf && (
                    <>
                      <br />
                      <span className="text-muted-foreground">{secondHalf}</span>
                    </>
                  )}
                </>
              );
            })()}
          </h1>
        </div>

        {/* ================================================================== */}
        {/* HERO MEDIA - Consistent with other sections */}
        {/* ================================================================== */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="relative w-full aspect-[16/9] lg:aspect-[21/9] overflow-hidden rounded-xl bg-sidebar border border-border/40 group">
            
            {/* Media Layer */}
            {showUploadedVideo ? (
              <>
                {/* Poster image while video loads */}
                {heroImageUrl && (
                  <img
                    src={heroImageUrl}
                    alt={showroom.heroTagline || partner.brandName}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                )}
                <video
                  ref={videoRef}
                  src={heroVideoFileUrl}
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay
                  muted={isMuted}
                  loop
                  playsInline
                  controls={false}
                  preload="auto"
                  poster={heroImageUrl || undefined}
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
              </>
            ) : showEmbeddedVideo ? (
              <iframe
                src={`${heroVideoEmbedUrl}?autoplay=1&mute=1&loop=1`}
                title={showroom.heroTagline || partner.brandName}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : showImage && heroImageUrl ? (
              <img
                src={heroImageUrl}
                alt={showroom.heroTagline || partner.brandName}
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            ) : showGradient ? (
              <div 
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                }}
              />
            ) : null}
          </div>
        </div>

        {/* ================================================================== */}
        {/* CONTENT BLOCK - Below media */}
        {/* ================================================================== */}
        <div className="px-4 sm:px-6 lg:px-8 pt-12 lg:pt-16">
          
          {/* Philosophy + CTAs Row */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 lg:gap-12">
            
            {/* Philosophy */}
            <div className="flex-1 max-w-2xl">
              {showroom.brandPhilosophy && (
                <>
                  <span className="text-sm font-semibold uppercase tracking-wider text-primary mb-4 block">
                    Philosophy
                  </span>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {showroom.brandPhilosophy}
                  </p>
                </>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {showroom.heroCtaLink ? (
                <a
                  href={showroom.heroCtaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-11 px-8 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
                >
                  {showroom.heroCtaText || 'Talk to Us'}
                </a>
              ) : (
                <button
                  onClick={() => document.getElementById('showroom-contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="h-11 px-8 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
                >
                  {showroom.heroCtaText || 'Talk to Us'}
                </button>
              )}
              
              {showroom.heroCtaSecondaryText && (
                showroom.heroCtaSecondaryLink ? (
                  <a
                    href={showroom.heroCtaSecondaryLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-11 px-8 bg-muted text-foreground text-sm font-semibold rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
                  >
                    {showroom.heroCtaSecondaryText}
                  </a>
                ) : (
                  <button
                    onClick={() => document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' })}
                    className="h-11 px-8 bg-muted text-foreground text-sm font-semibold rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
                  >
                    {showroom.heroCtaSecondaryText}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Stats Row - Bold, Card-like presentation */}
          {hasStats && (
            <div className="mt-12 lg:mt-16">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                
                {showroom.yearsInBusiness && (
                  <div className="p-6 rounded-xl bg-sidebar border border-border/40">
                    <span className="text-2xl sm:text-3xl font-semibold text-foreground tabular-nums">
                      {showroom.yearsInBusiness}+
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Years in Business
                    </p>
                  </div>
                )}
                
                {showroom.totalCarsSold && (
                  <div className="p-6 rounded-xl bg-sidebar border border-border/40">
                    <span className="text-2xl sm:text-3xl font-semibold text-foreground tabular-nums">
                      {showroom.totalCarsSold.toLocaleString()}+
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Vehicles Sold
                    </p>
                  </div>
                )}
                
                {partner.googleRating && (
                  <div className="p-6 rounded-xl bg-sidebar border border-border/40">
                    <span className="text-2xl sm:text-3xl font-semibold text-foreground tabular-nums">
                      {partner.googleRating.toFixed(1)}
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Google Rating
                    </p>
                  </div>
                )}
                
                {partner.googleReviewCount > 0 && (
                  <div className="p-6 rounded-xl bg-sidebar border border-border/40">
                    <span className="text-2xl sm:text-3xl font-semibold text-foreground tabular-nums">
                      {partner.googleReviewCount.toLocaleString()}
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Reviews
                    </p>
                  </div>
                )}
                
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Skeleton
function ShowroomHeroSkeleton() {
  return (
    <section className="pt-28 pb-20">
      <div className="max-w-[1600px] mx-auto">
        <div className="px-4 sm:px-6 lg:px-8 mb-8 text-center">
          <Skeleton className="h-4 w-24 mx-auto mb-4" />
          <Skeleton className="h-10 w-80 max-w-full mx-auto" />
        </div>
        <div className="px-4 sm:px-6 lg:px-8">
          <Skeleton className="w-full aspect-[16/9] lg:aspect-[21/9] rounded-xl" />
        </div>
      </div>
    </section>
  );
}
ShowroomHero.Skeleton = ShowroomHeroSkeleton;
