/**
 * Image Lightbox Component
 * 
 * Fullscreen image viewer with navigation, theme-aware styling,
 * and keyboard controls. Rendered via React Portal.
 */

'use client';

import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/utils';

// ============================================================================
// Types
// ============================================================================

export interface ImageLightboxProps {
  images: string[];
  thumbnailImages?: string[];
  currentIndex: number;
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

// ============================================================================
// Component
// ============================================================================

export function ImageLightbox({
  images,
  thumbnailImages,
  currentIndex,
  isOpen,
  title = 'Image',
  onClose,
  onIndexChange,
}: ImageLightboxProps) {
  // Use images directly - parent should pass pre-validated images
  // This ensures indices match between parent and this component
  const validImages = images;
  const validThumbnailImages = thumbnailImages?.length === images.length ? thumbnailImages : images;
  const totalImages = validImages.length;
  
  // Ensure currentIndex is always valid
  const safeIndex = Math.min(Math.max(0, currentIndex), Math.max(0, totalImages - 1));
  const currentImage = validImages[safeIndex] || null;

  // Navigation handlers
  const goNext = useCallback(() => {
    if (totalImages > 1) {
      onIndexChange((safeIndex + 1) % totalImages);
    }
  }, [safeIndex, totalImages, onIndexChange]);

  const goPrev = useCallback(() => {
    if (totalImages > 1) {
      onIndexChange((safeIndex - 1 + totalImages) % totalImages);
    }
  }, [safeIndex, totalImages, onIndexChange]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowRight':
          goNext();
          break;
        case 'ArrowLeft':
          goPrev();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, goNext, goPrev, onClose]);

  // Don't render if not open or no valid images
  if (!isOpen || totalImages === 0 || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-background"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
      }}
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 compact:top-4 compact:right-4 z-20 w-9 h-9 compact:w-10 compact:h-10 bg-muted/80 hover:bg-muted rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
        aria-label="Close"
      >
        <X className="w-4 h-4 compact:w-5 compact:h-5 text-foreground" />
      </button>

      {/* Image Counter */}
      <div className="absolute top-3 left-3 compact:top-4 compact:left-4 z-20 px-2.5 py-1 compact:px-3 compact:py-1.5 bg-muted/80 backdrop-blur-sm text-foreground text-caption1 compact:text-subhead tabular-nums rounded-full">
        {safeIndex + 1} / {totalImages}
      </div>

      {/* Main Image */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {currentImage && (
          <img
            src={currentImage}
            alt={`${title} - Image ${safeIndex + 1}`}
            className="absolute inset-0 h-full w-full object-contain"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        )}
      </div>

      {/* Navigation Arrows */}
      {totalImages > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-2 compact:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 compact:w-12 compact:h-12 bg-muted/80 hover:bg-muted backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5 compact:w-6 compact:h-6 text-foreground" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-2 compact:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 compact:w-12 compact:h-12 bg-muted/80 hover:bg-muted backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 compact:w-6 compact:h-6 text-foreground" />
          </button>
        </>
      )}

      {/* Thumbnail Strip */}
      <div className="absolute bottom-3 compact:bottom-4 left-1/2 -translate-x-1/2 z-20 hidden compact:flex gap-1.5 compact:gap-2 px-3 compact:px-4 py-2 compact:py-2.5 bg-muted/80 backdrop-blur-sm rounded-xl max-w-[90vw] overflow-x-auto scrollbar-thin">
        {validThumbnailImages.map((img, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              onIndexChange(idx);
            }}
            className={cn(
              'relative w-12 h-8 compact:w-14 compact:h-10 flex-shrink-0 rounded-md overflow-hidden transition-all',
              idx === safeIndex ? 'opacity-100 scale-105' : 'opacity-50 hover:opacity-100'
            )}
          >
            <img
              src={img}
              alt={`Thumbnail ${idx + 1}`}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
}
