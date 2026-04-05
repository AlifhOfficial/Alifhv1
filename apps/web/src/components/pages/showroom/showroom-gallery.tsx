/**
 * Showroom Gallery
 * Featured slider with bento grid. Visual storytelling.
 */

'use client';

import { useState, useCallback } from 'react';
import { Expand, Images } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getVideoEmbedUrl } from '@/components/partner/car-dealer/showroom/components';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { getCdnPublicUrl } from '@/utils/storage';
import type { ShowroomData } from './types';
import { getAmbientTheme } from './types';

interface ShowroomGalleryProps {
  showroom: ShowroomData;
}

// Individual gallery image with hover effect
function GalleryImage({ 
  src, 
  alt, 
  onClick,
  priority = false,
  className = "",
  showCount,
}: { 
  src: string; 
  alt: string;
  onClick: () => void;
  priority?: boolean;
  className?: string;
  showCount?: number;
}) {
  return (
    <div 
      className={`relative overflow-hidden rounded-xl cursor-pointer group ${className}`}
      onClick={onClick}
    >
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
      />
      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Expand className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>
      {/* Show remaining count overlay */}
      {showCount && showCount > 0 && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white">
            <Images className="h-8 w-8 mx-auto mb-2" />
            <span className="text-headline">+{showCount} more</span>
          </div>
        </div>
      )}
    </div>
  );
}



export function ShowroomGallery({ showroom }: ShowroomGalleryProps) {
  const interiorImages = (showroom.showroomImages || []).filter((img): img is string => Boolean(img));
  const exteriorImages = (showroom.showroomExteriorImages || []).filter((img): img is string => Boolean(img));
  const allImages = [...interiorImages, ...exteriorImages];
  const sectionImage = getCdnPublicUrl(showroom.gallerySectionImage);
  const { embedUrl: sectionVideoEmbedUrl } = getVideoEmbedUrl(showroom.gallerySectionVideoUrl);
  
  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  // Prepare all images with public URLs for lightbox
  const lightboxImages = allImages;
  
  const handleImageClick = useCallback((index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  }, []);
  
  const handleLightboxIndexChange = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);
  
  if (allImages.length === 0 && !sectionImage && !sectionVideoEmbedUrl && !showroom.showroomVideoTourUrl) return null;

  const theme = getAmbientTheme(showroom.ambientStyle);
  
  const { embedUrl: videoTourEmbedUrl } = getVideoEmbedUrl(showroom.showroomVideoTourUrl);
  const hasVideoTour = videoTourEmbedUrl;

  // Show up to 8 in the grid; last cell shows overflow count
  const maxGrid = 8;
  const gridImages = allImages.slice(0, maxGrid);
  const remainingCount = allImages.length - maxGrid;

  return (
    <>
      <section id="showroom-gallery" className={`${theme.sectionSpacing} px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-[1600px] mx-auto">
          
          {/* Header - Above Media */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <span className="text-subhead font-semibold uppercase tracking-wider text-primary mb-4 block">
                The Space
              </span>
              <h2 className="text-title2 sm:text-title1 lg:text-display font-semibold tracking-tight">
                Our Showroom
              </h2>
            </div>
            {allImages.length > 1 && (
              <button
                onClick={() => handleImageClick(0)}
                className="text-subhead font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Images className="h-4 w-4" />
                View all {allImages.length}
              </button>
            )}
          </div>

          {(sectionVideoEmbedUrl || sectionImage) && (
            <div className="mb-8">
              <div className="relative aspect-[16/9] lg:aspect-[21/9] rounded-xl overflow-hidden bg-sidebar border border-border/40">
                {sectionVideoEmbedUrl ? (
                  <iframe
                    src={`${sectionVideoEmbedUrl}?autoplay=1&mute=1&loop=1`}
                    title="Showroom Section Media"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                ) : sectionImage ? (
                  <img
                    src={sectionImage}
                    alt="Our Showroom"
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
              </div>
            </div>
          )}

          {/* Video Tour - Full Width */}
          {hasVideoTour && (
            <div className="mb-8">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-sidebar border border-border/40">
                {videoTourEmbedUrl ? (
                  <iframe
                    src={`${videoTourEmbedUrl}?autoplay=1&mute=1&loop=1`}
                    title="Virtual Showroom Tour"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                ) : null}
              </div>
              <p className="text-center mt-3 text-subhead text-muted-foreground">
                Virtual Showroom Tour
              </p>
            </div>
          )}

          {/* Uniform Image Grid */}
          {gridImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {gridImages.map((img, idx) => {
                const isLast = idx === gridImages.length - 1 && remainingCount > 0;
                return (
                  <GalleryImage
                    key={idx}
                    src={img}
                    alt={`Showroom ${idx + 1}`}
                    onClick={() => handleImageClick(idx)}
                    className="aspect-[4/3]"
                    showCount={isLast ? remainingCount : undefined}
                  />
                );
              })}
            </div>
          )}

          {/* Description - Below Media */}
          <p className="text-callout text-muted-foreground max-w-2xl leading-relaxed mt-8">
            Where every detail is crafted with care.
          </p>
        </div>
      </section>
      
      {/* Lightbox */}
      <ImageLightbox
        images={lightboxImages}
        currentIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        title="Showroom Gallery"
        onClose={() => setIsLightboxOpen(false)}
        onIndexChange={handleLightboxIndexChange}
      />
    </>
  );
}

// Skeleton
function ShowroomGallerySkeleton() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <Skeleton className="h-3 w-16 mx-auto mb-4" />
          <Skeleton className="h-8 w-40 mx-auto" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
    </section>
  );
}
ShowroomGallery.Skeleton = ShowroomGallerySkeleton;
