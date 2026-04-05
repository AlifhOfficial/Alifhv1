/**
 * Image Grid Modal Component
 * 
 * Full-page gallery view with bento-style layout.
 * Rendered via React Portal.
 */

'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils';

// ============================================================================
// Types
// ============================================================================

export interface ImageGridModalProps {
  images: string[];
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  onImageClick: (index: number) => void;
}

// ============================================================================
// Component
// ============================================================================

export function ImageGridModal({
  images,
  isOpen,
  title = 'All Photos',
  onClose,
  onImageClick,
}: ImageGridModalProps) {
  // Use images directly - parent should pass pre-validated images
  // This ensures indices match between parent and this component
  const validImages = images;
  const totalImages = validImages.length;

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Don't render if not open
  if (!isOpen || totalImages === 0 || typeof document === 'undefined') {
    return null;
  }

  // Build bento grid rows
  const buildRows = () => {
    const rows: React.ReactNode[] = [];
    let i = 0;

    while (i < totalImages) {
      const remaining = totalImages - i;
      const rowIndex = rows.length;
      const baseIndex = i; // Capture index for closures

      if (remaining >= 3 && rowIndex % 3 === 0) {
        // Pattern A: Large left + 2 stacked right
        const mainImg = validImages[baseIndex];
        rows.push(
          <div key={`row-${rowIndex}`} className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <button
              onClick={() => onImageClick(baseIndex)}
              className="relative col-span-2 sm:col-span-2 aspect-[4/3] overflow-hidden rounded-lg sm:rounded-xl bg-muted/30 group cursor-pointer"
            >
              <img src={mainImg} alt={`Photo ${baseIndex + 1}`} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" decoding="async" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 px-1.5 sm:px-2 py-0.5 bg-black/60 text-white text-[10px] sm:text-caption1 font-bold rounded">{baseIndex + 1}</div>
            </button>
            <div className="col-span-2 sm:col-span-1 grid grid-cols-2 sm:flex sm:flex-col gap-1.5 sm:gap-2">
              {[1, 2].map((offset) => {
                const imgIdx = baseIndex + offset;
                const img = validImages[imgIdx];
                if (!img || imgIdx >= totalImages) return null;
                return (
                  <button
                    key={imgIdx}
                    onClick={() => onImageClick(imgIdx)}
                    className="relative aspect-[4/3] sm:aspect-auto sm:flex-1 overflow-hidden rounded-lg sm:rounded-xl bg-muted/30 group cursor-pointer"
                  >
                    <img src={img} alt={`Photo ${imgIdx + 1}`} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" decoding="async" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 px-1.5 sm:px-2 py-0.5 bg-black/60 text-white text-[10px] sm:text-caption1 font-bold rounded">{imgIdx + 1}</div>
                  </button>
                );
              })}
            </div>
          </div>
        );
        i += 3;
      } else if (remaining >= 3 && rowIndex % 3 === 1) {
        // Pattern B: 3 equal
        rows.push(
          <div key={`row-${rowIndex}`} className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            {[0, 1, 2].map((offset) => {
              const imgIdx = baseIndex + offset;
              const img = validImages[imgIdx];
              if (!img || imgIdx >= totalImages) return null;
              return (
                <button
                  key={imgIdx}
                  onClick={() => onImageClick(imgIdx)}
                  className={cn(
                    'relative aspect-square overflow-hidden rounded-lg sm:rounded-xl bg-muted/30 group cursor-pointer',
                    offset === 2 && 'col-span-2 sm:col-span-1 aspect-[2/1] sm:aspect-square'
                  )}
                >
                  <img src={img} alt={`Photo ${imgIdx + 1}`} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" decoding="async" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 px-1.5 sm:px-2 py-0.5 bg-black/60 text-white text-[10px] sm:text-caption1 font-bold rounded">{imgIdx + 1}</div>
                </button>
              );
            })}
          </div>
        );
        i += 3;
      } else if (remaining >= 3 && rowIndex % 3 === 2) {
        // Pattern C: Large right + 2 stacked left
        const mainImg = validImages[baseIndex + 2];
        rows.push(
          <div key={`row-${rowIndex}`} className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <button
              onClick={() => onImageClick(baseIndex + 2)}
              className="relative col-span-2 sm:col-span-2 sm:order-2 aspect-[4/3] overflow-hidden rounded-lg sm:rounded-xl bg-muted/30 group cursor-pointer"
            >
              <img src={mainImg} alt={`Photo ${baseIndex + 3}`} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" decoding="async" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 px-1.5 sm:px-2 py-0.5 bg-black/60 text-white text-[10px] sm:text-caption1 font-bold rounded">{baseIndex + 3}</div>
            </button>
            <div className="col-span-2 sm:col-span-1 sm:order-1 grid grid-cols-2 sm:flex sm:flex-col gap-1.5 sm:gap-2">
              {[0, 1].map((offset) => {
                const imgIdx = baseIndex + offset;
                const img = validImages[imgIdx];
                if (!img || imgIdx >= totalImages) return null;
                return (
                  <button
                    key={imgIdx}
                    onClick={() => onImageClick(imgIdx)}
                    className="relative aspect-[4/3] sm:aspect-auto sm:flex-1 overflow-hidden rounded-lg sm:rounded-xl bg-muted/30 group cursor-pointer"
                  >
                    <img src={img} alt={`Photo ${imgIdx + 1}`} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" decoding="async" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 px-1.5 sm:px-2 py-0.5 bg-black/60 text-white text-[10px] sm:text-caption1 font-bold rounded">{imgIdx + 1}</div>
                  </button>
                );
              })}
            </div>
          </div>
        );
        i += 3;
      } else if (remaining === 2) {
        // 2 remaining: side by side
        rows.push(
          <div key={`row-${rowIndex}`} className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            {[0, 1].map((offset) => {
              const imgIdx = baseIndex + offset;
              const img = validImages[imgIdx];
              if (!img) return null;
              return (
                <button
                  key={imgIdx}
                  onClick={() => onImageClick(imgIdx)}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg sm:rounded-xl bg-muted/30 group cursor-pointer"
                >
                  <img src={img} alt={`Photo ${imgIdx + 1}`} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" decoding="async" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 px-1.5 sm:px-2 py-0.5 bg-black/60 text-white text-[10px] sm:text-caption1 font-bold rounded">{imgIdx + 1}</div>
                </button>
              );
            })}
          </div>
        );
        i += 2;
      } else if (remaining === 1) {
        // 1 remaining: full width
        const img = validImages[baseIndex];
        rows.push(
          <div key={`row-${rowIndex}`} className="mb-1.5 sm:mb-2">
            <button
              onClick={() => onImageClick(baseIndex)}
              className="relative w-full aspect-[16/9] overflow-hidden rounded-lg sm:rounded-xl bg-muted/30 group cursor-pointer"
            >
              <img src={img} alt={`Photo ${baseIndex + 1}`} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" decoding="async" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 px-1.5 sm:px-2 py-0.5 bg-black/60 text-white text-[10px] sm:text-caption1 font-bold rounded">{baseIndex + 1}</div>
            </button>
          </div>
        );
        i += 1;
      } else {
        // Safety: skip if none of the patterns match
        i += 1;
      }
    }

    return rows;
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-background overflow-y-auto"
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
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-9 h-9 sm:w-10 sm:h-10 bg-muted/80 hover:bg-muted rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
        aria-label="Close"
      >
        <X className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
      </button>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
          <div>
            <h2 className="text-subhead sm:text-callout font-bold text-foreground">{title}</h2>
            <p className="text-[10px] sm:text-caption1 text-muted-foreground">{totalImages} images</p>
          </div>
        </div>
      </div>

      {/* Image Grid */}
      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
        {buildRows()}
      </div>
    </div>,
    document.body
  );
}
