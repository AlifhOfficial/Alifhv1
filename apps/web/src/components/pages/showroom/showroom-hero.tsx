/**
 * Showroom Hero
 * Content first, then full-width media, then stats.
 */

'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { getPublicUrl } from '@/utils';
import { getVideoEmbedUrl } from '@/components/partner/car-dealer/showroom/components';
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

  const heroImageUrl = showroom.heroImage ? getPublicUrl(showroom.heroImage) : null;
  
  // Check for uploaded video file first, then YouTube/Vimeo URL
  const heroVideoFileUrl = (showroom as any).heroVideoFile ? getPublicUrl((showroom as any).heroVideoFile) : null;
  const { embedUrl: heroVideoEmbedUrl } = getVideoEmbedUrl(showroom.heroVideoUrl);
  
  // Priority: Video first, then image, then gradient
  // Video > Image > Gradient (no background type preference needed)
  const hasUploadedVideo = !!heroVideoFileUrl;
  const hasEmbeddedVideo = !!heroVideoEmbedUrl;
  const hasImage = !!heroImageUrl;
  
  // Show video if available (uploaded takes priority over embedded)
  const showUploadedVideo = hasUploadedVideo;
  const showEmbeddedVideo = !hasUploadedVideo && hasEmbeddedVideo;
  const showImage = !hasUploadedVideo && !hasEmbeddedVideo && hasImage;
  const showGradient = !hasUploadedVideo && !hasEmbeddedVideo && !hasImage;

  // Brand colors for gradient (use showroom colors with fallbacks)
  const primaryColor = showroom.primaryColor || '#000000';
  const accentColor = showroom.accentColor || '#c9a962';

  // Preload video for instant playback
  useEffect(() => {
    if (heroVideoFileUrl) {
      // Create preload link for the video
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
    <section className={`${theme.sectionSpacing}`}>
      <div className="max-w-[1600px] mx-auto">

        {/* Brand Name - Top */}
        <div className="px-4 sm:px-6 lg:px-8 mb-8">
          <p className={`text-xs uppercase tracking-widest ${theme.labelClass} text-muted-foreground text-center`}>
            {partner.brandName}
          </p>
        </div>

        {/* Hero Media - Full Width */}
        <div className="px-4 sm:px-6 lg:px-8">
          {showUploadedVideo ? (
            <div className="relative w-full aspect-[21/9] overflow-hidden rounded-2xl bg-muted group">
              {/* Show image as poster while video loads */}
              {heroImageUrl && (
                <Image
                  src={heroImageUrl}
                  alt={showroom.heroTagline || partner.brandName}
                  fill
                  priority
                  className="object-cover"
                  sizes="100vw"
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
            </div>
          ) : showEmbeddedVideo ? (
            <div className="relative w-full aspect-[21/9] overflow-hidden rounded-2xl bg-muted">
              <iframe
                src={`${heroVideoEmbedUrl}?autoplay=1&mute=1&loop=1`}
                title={showroom.heroTagline || partner.brandName}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : showImage && heroImageUrl ? (
            <div className="relative w-full aspect-[21/9] overflow-hidden rounded-2xl bg-muted">
              <Image
                src={heroImageUrl}
                alt={showroom.heroTagline || partner.brandName}
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
            </div>
          ) : showGradient ? (
            <div 
              className="relative w-full aspect-[21/9] overflow-hidden rounded-2xl"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
              }}
            />
          ) : null}
        </div>

        {/* Content - Below Media */}
        <div className="px-4 sm:px-6 lg:px-8 pt-12 lg:pt-16">
          
          {/* Title with CTAs on right */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-8">
            <h1 className={`text-xl sm:text-2xl lg:text-3xl ${theme.headingClass} text-foreground tracking-tight leading-tight`}>
              {showroom.heroTagline || `Welcome to ${partner.brandName}`}
            </h1>
            
            {/* CTAs - Far right */}
            <div className="flex items-center gap-3 shrink-0">
              {showroom.heroCtaLink ? (
                <a
                  href={showroom.heroCtaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-11 px-6 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors flex items-center justify-center"
                >
                  {showroom.heroCtaText || 'Talk to Us'}
                </a>
              ) : (
                <button
                  onClick={() => document.getElementById('showroom-contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="h-11 px-6 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors flex items-center justify-center"
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
                    className="h-11 px-6 bg-muted text-foreground text-sm font-medium rounded-full hover:bg-muted/80 transition-colors flex items-center justify-center"
                  >
                    {showroom.heroCtaSecondaryText}
                  </a>
                ) : (
                  <Link
                    href={`/dealer/${partner.id}/inventory`}
                    className="h-11 px-6 bg-muted text-foreground text-sm font-medium rounded-full hover:bg-muted/80 transition-colors flex items-center justify-center"
                  >
                    {showroom.heroCtaSecondaryText}
                  </Link>
                )
              )}
            </div>
          </div>
          
          {/* Philosophy */}
          {showroom.brandPhilosophy && (
            <p className={`text-sm sm:text-base ${theme.bodyClass} text-muted-foreground leading-relaxed max-w-3xl mt-4`}>
              {showroom.brandPhilosophy}
            </p>
          )}

          {/* Stats */}
          {(showroom.yearsInBusiness || showroom.totalCarsSold || partner.googleRating) && (
            <div className="flex items-center gap-6 mt-6">
              {showroom.yearsInBusiness && (
                <div className="flex items-baseline gap-1">
                  <span className={`text-lg ${theme.subheadingClass} text-foreground`}>
                    {showroom.yearsInBusiness}+
                  </span>
                  <span className="text-xs text-muted-foreground">years</span>
                </div>
              )}
              {showroom.totalCarsSold && (
                <div className="flex items-baseline gap-1">
                  <span className={`text-lg ${theme.subheadingClass} text-foreground`}>
                    {showroom.totalCarsSold.toLocaleString()}+
                  </span>
                  <span className="text-xs text-muted-foreground">sold</span>
                </div>
              )}
              {partner.googleRating && (
                <div className="flex items-baseline gap-1">
                  <span className={`text-lg ${theme.subheadingClass} text-foreground`}>
                    {partner.googleRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">rating</span>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

// ============================================================================
// Stats Sub-component (no longer needed, integrated above)
// ============================================================================
