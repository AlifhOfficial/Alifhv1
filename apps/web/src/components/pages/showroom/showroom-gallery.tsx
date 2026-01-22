/**
 * Showroom Gallery
 * Featured slider with bento grid. Visual storytelling.
 */

'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Expand, Images, ChevronLeft, ChevronRight } from 'lucide-react';
import { getPublicUrl } from '@/utils';
import { getVideoEmbedUrl } from '@/components/partner/car-dealer/showroom/components';
import { ImageLightbox } from '@/components/ui/image-lightbox';
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
      className={`relative overflow-hidden rounded-2xl cursor-pointer group ${className}`}
      onClick={onClick}
    >
      <Image
        src={getPublicUrl(src) || src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        priority={priority}
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
            <span className="text-lg">+{showCount} more</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Image Slider Component
function ImageSlider({
  images,
  onImageClick,
  currentIndex,
  onIndexChange,
}: {
  images: string[];
  onImageClick: (index: number) => void;
  currentIndex: number;
  onIndexChange: (index: number) => void;
}) {
  const goNext = () => {
    onIndexChange((currentIndex + 1) % images.length);
  };

  const goPrev = () => {
    onIndexChange((currentIndex - 1 + images.length) % images.length);
  };

  if (images.length === 0) return null;

  return (
    <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden bg-muted group">
      {/* Main Image */}
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={() => onImageClick(currentIndex)}
      >
        <Image
          src={getPublicUrl(images[currentIndex]) || images[currentIndex]}
          alt={`Showroom ${currentIndex + 1}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          priority
        />
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Expand className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-background hover:scale-105"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6 text-foreground" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-background hover:scale-105"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6 text-foreground" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.slice(0, 6).map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); onIndexChange(idx); }}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                idx === currentIndex 
                  ? 'bg-white w-6' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
          {images.length > 6 && (
            <span className="text-white/70 text-xs font-medium ml-1">+{images.length - 6}</span>
          )}
        </div>
      )}

      {/* Image Counter */}
      <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm text-xs text-foreground">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}

export function ShowroomGallery({ showroom }: ShowroomGalleryProps) {
  const interiorImages = showroom.showroomImages || [];
  const exteriorImages = showroom.showroomExteriorImages || [];
  const allImages = [...interiorImages, ...exteriorImages];
  
  // Slider state
  const [sliderIndex, setSliderIndex] = useState(0);
  
  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  // Prepare all images with public URLs for lightbox
  const lightboxImages = allImages.map(img => getPublicUrl(img) || img);
  
  const handleImageClick = useCallback((index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  }, []);
  
  const handleLightboxIndexChange = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);
  
  if (allImages.length === 0 && !showroom.showroomVideoTourFile && !showroom.showroomVideoTourUrl) return null;

  const theme = getAmbientTheme(showroom.ambientStyle);
  
  // Check for uploaded video file first, then YouTube/Vimeo URL
  const videoTourFileUrl = showroom.showroomVideoTourFile ? getPublicUrl(showroom.showroomVideoTourFile) : null;
  const { embedUrl: videoTourEmbedUrl } = getVideoEmbedUrl(showroom.showroomVideoTourUrl);
  const hasVideoTour = videoTourFileUrl || videoTourEmbedUrl;

  // Show max 6 images in the grid (1 in slider + 5 thumbnails)
  const maxThumbnails = 5;
  const thumbnailImages = allImages.slice(1, maxThumbnails + 1);
  const remainingCount = allImages.length - maxThumbnails - 1;

  return (
    <>
      <section id="showroom-gallery" className={`${theme.sectionSpacing} px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-[1600px] mx-auto">
          
          {/* Header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className={`text-xs uppercase tracking-widest ${theme.labelClass} text-muted-foreground mb-3`}>
                The Space
              </p>
              <h2 className={`text-xl sm:text-2xl lg:text-3xl ${theme.headingClass} text-foreground tracking-tight`}>
                Our Showroom
              </h2>
            </div>
            {allImages.length > 1 && (
              <button
                onClick={() => handleImageClick(0)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Images className="h-4 w-4" />
                View all {allImages.length}
              </button>
            )}
          </div>

          {/* Video Tour - Full Width */}
          {hasVideoTour && (
            <div className="mb-8">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted">
                {videoTourFileUrl ? (
                  <video
                    src={videoTourFileUrl}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster={allImages[0] ? getPublicUrl(allImages[0]) : undefined}
                  />
                ) : videoTourEmbedUrl ? (
                  <iframe
                    src={`${videoTourEmbedUrl}?autoplay=1&mute=1&loop=1`}
                    title="Virtual Showroom Tour"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                ) : null}
              </div>
              <p className={`text-center mt-3 text-sm ${theme.bodyClass} text-muted-foreground`}>
                Virtual Showroom Tour
              </p>
            </div>
          )}

          {/* Main Slider */}
          {allImages.length > 0 && (
            <ImageSlider
              images={allImages}
              onImageClick={handleImageClick}
              currentIndex={sliderIndex}
              onIndexChange={setSliderIndex}
            />
          )}

          {/* Thumbnail Grid - Show max 5 thumbnails */}
          {thumbnailImages.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
              {thumbnailImages.map((img, idx) => {
                const isLast = idx === thumbnailImages.length - 1 && remainingCount > 0;
                return (
                  <GalleryImage
                    key={idx}
                    src={img}
                    alt={`Showroom ${idx + 2}`}
                    onClick={() => handleImageClick(idx + 1)}
                    className="aspect-[4/3]"
                    showCount={isLast ? remainingCount : undefined}
                  />
                );
              })}
            </div>
          )}
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