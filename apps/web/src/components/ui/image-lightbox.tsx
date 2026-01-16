/**
 * Image Lightbox Component
 * 
 * Fullscreen image viewer with navigation, theme-aware styling,
 * and keyboard controls. Rendered via React Portal.
 */

'use client';

import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/utils';

// ============================================================================
// Types
// ============================================================================

export interface ImageLightboxProps {
  images: string[];
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
  currentIndex,
  isOpen,
  title = 'Image',
  onClose,
  onIndexChange,
}: ImageLightboxProps) {
  // Use images directly - parent should pass pre-validated images
  // This ensures indices match between parent and this component
  const validImages = images;
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
        className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-9 h-9 sm:w-10 sm:h-10 bg-muted/80 hover:bg-muted rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
        aria-label="Close"
      >
        <X className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
      </button>

      {/* Image Counter */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-muted/80 backdrop-blur-sm text-foreground text-xs sm:text-sm font-medium tabular-nums rounded-full">
        {safeIndex + 1} / {totalImages}
      </div>

      {/* Main Image */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {currentImage && (
          <Image
            src={currentImage}
            alt={`${title} - Image ${safeIndex + 1}`}
            fill
            className="object-contain"
            sizes="100vw"
            priority
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
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-muted/80 hover:bg-muted backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-muted/80 hover:bg-muted backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
          </button>
        </>
      )}

      {/* Thumbnail Strip */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 hidden sm:flex gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-muted/80 backdrop-blur-sm rounded-xl max-w-[90vw] overflow-x-auto scrollbar-thin">
        {validImages.map((img, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              onIndexChange(idx);
            }}
            className={cn(
              'relative w-12 h-8 sm:w-14 sm:h-10 flex-shrink-0 rounded-md overflow-hidden transition-all',
              idx === safeIndex ? 'opacity-100 scale-105' : 'opacity-50 hover:opacity-100'
            )}
          >
            <Image
              src={img}
              alt={`Thumbnail ${idx + 1}`}
              fill
              className="object-cover"
              sizes="56px"
            />
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
}
