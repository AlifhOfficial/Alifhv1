/**
 * Car Card Detailed Component - Alifh Design System
 * 
 * Comprehensive car listing view matching the listing form fields.
 * AI metrics section kept as placeholder for future data.
 * Following "Less is More" principle with clean typography.
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { 
  Share2, 
  Heart, 
  Sparkles, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  MapPin,
  X,
  Grid3X3,
} from 'lucide-react';
import { useFavorite, useSuperlike } from '@/hooks/engagement';
import { useUser } from '@/hooks/auth/use-auth';
import { cn } from '@/utils';
import { SuperlikeConfirmationDialog } from '@/components/engagement/favorites/superlike-confirmation-dialog';
import { SuperlikeLimitDialog } from '@/components/engagement/favorites/superlike-limit-dialog';
import { AuthRequiredDialog } from '@/components/auth/auth-required-dialog';
import type { CarDetailedData } from '@alifh/database';

// ============================================================================
// Types
// ============================================================================

interface CarCardDetailedProps {
  listing: CarDetailedData;
  kycVerified?: boolean; // User/Seller KYC verification status
  className?: string;
}

// ============================================================================
// Utility Functions (Module-level to avoid recreation on every render)
// ============================================================================

const priceFormatter = new Intl.NumberFormat('en-AE', {
  style: 'currency',
  currency: 'AED',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const mileageFormatter = new Intl.NumberFormat('en-US');

const formatPrice = (amount: number) => priceFormatter.format(amount);

const formatMileage = (km: number) => mileageFormatter.format(km);

const formatPriceShort = (amount: number) => {
  if (amount >= 1000000) {
    return `AED ${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `AED ${Math.round(amount / 1000)}K`;
  }
  return `AED ${amount}`;
};

const formatEnumValue = (value: string | null): string => {
  if (!value) return '—';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
};

// ============================================================================
// Sub-Components
// ============================================================================

function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showAllImages, setShowAllImages] = useState(false);
  const validImages = images.filter(img => img && typeof img === 'string' && img.trim().length > 0);
  const allImages = validImages.length > 0 ? validImages : ['/assets/cars/placeholder.avif'];

  const next = () => setCurrentIndex((i) => (i + 1) % allImages.length);
  const prev = () => setCurrentIndex((i) => (i - 1 + allImages.length) % allImages.length);

  const openLightbox = (index?: number) => {
    if (typeof index === 'number') {
      setCurrentIndex(index);
    }
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => setIsLightboxOpen(false);

  // Handle keyboard navigation in lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  // Handle keyboard for all images view
  useEffect(() => {
    if (!showAllImages) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowAllImages(false);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [showAllImages]);

  // Max thumbnails to show before "View All"
  const maxThumbnails = 5;
  const displayedThumbnails = allImages.slice(0, maxThumbnails);
  const remainingCount = allImages.length - maxThumbnails;

  return (
    <>
      <div className="space-y-3">
        {/* Main Image */}
        <div 
          className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-muted/20 cursor-pointer group"
          onClick={() => openLightbox()}
        >
          <Image
            src={allImages[currentIndex]}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 1024px) 100vw, 66vw"
            priority
          />
          
          {/* Navigation Arrows */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4 text-neutral-800" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4 text-neutral-800" />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/70 text-white text-xs font-medium tabular-nums rounded">
            {currentIndex + 1}/{allImages.length}
          </div>
        </div>

        {/* Thumbnails Row */}
        {allImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin min-w-0">
            {displayedThumbnails.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  "relative w-16 h-12 flex-shrink-0 overflow-hidden transition-all rounded-md",
                  idx === currentIndex 
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background" 
                    : "opacity-70 hover:opacity-100"
                )}
              >
                <Image 
                  src={img} 
                  alt={`View ${idx + 1}`} 
                  fill 
                  className="object-cover" 
                  sizes="64px" 
                />
              </button>
            ))}
            
            {/* View All Button */}
            {remainingCount > 0 && (
              <button
                onClick={() => setShowAllImages(true)}
                className="relative w-16 h-12 flex-shrink-0 rounded-md bg-muted/80 hover:bg-muted transition-colors flex flex-col items-center justify-center gap-0.5"
              >
                <Grid3X3 className="w-4 h-4 text-muted-foreground" />
                <span className="text-[10px] font-bold text-muted-foreground">+{remainingCount}</span>
              </button>
            )}
            
            {/* View All for smaller counts */}
            {remainingCount <= 0 && allImages.length > 3 && (
              <button
                onClick={() => setShowAllImages(true)}
                className="relative w-16 h-12 flex-shrink-0 rounded-md bg-muted/80 hover:bg-muted transition-colors flex flex-col items-center justify-center gap-0.5"
              >
                <Grid3X3 className="w-4 h-4 text-muted-foreground" />
                <span className="text-[10px] font-bold text-muted-foreground">All</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox - Theme Aware - Rendered via Portal */}
      {isLightboxOpen && typeof document !== 'undefined' && createPortal(
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
          onClick={closeLightbox}
        >
          {/* Close Button - Floating */}
          <button
            onClick={closeLightbox}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-9 h-9 sm:w-10 sm:h-10 bg-muted/80 hover:bg-muted rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
            aria-label="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
          </button>

          {/* Image Counter - Floating */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-muted/80 backdrop-blur-sm text-foreground text-xs sm:text-sm font-medium tabular-nums rounded-full">
            {currentIndex + 1} / {allImages.length}
          </div>

          {/* Main Image - Full Screen */}
          <div 
            className="absolute inset-0 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={allImages[currentIndex]}
              alt={`${title} - Image ${currentIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Navigation Arrows */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-muted/80 hover:bg-muted backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-muted/80 hover:bg-muted backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
              </button>
            </>
          )}

          {/* Thumbnail Strip at Bottom */}
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 hidden sm:flex gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-muted/80 backdrop-blur-sm rounded-xl max-w-[90vw] overflow-x-auto scrollbar-thin">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                className={cn(
                  "relative w-12 h-8 sm:w-14 sm:h-10 flex-shrink-0 rounded-md overflow-hidden transition-all",
                  idx === currentIndex 
                    ? "ring-2 ring-primary" 
                    : "opacity-50 hover:opacity-100"
                )}
              >
                <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" sizes="56px" />
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}

      {/* View All Images Modal - Rendered via Portal */}
      {showAllImages && typeof document !== 'undefined' && createPortal(
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
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
            <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 max-w-5xl mx-auto">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <button
                  onClick={() => setShowAllImages(false)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full hover:bg-muted/80 flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-foreground">All Photos</h2>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{allImages.length} images</p>
                </div>
              </div>
            </div>
          </div>

          {/* Image Grid - Bento Layout */}
          <div className="max-w-5xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
            {/* Render images in groups of 6 with bento pattern */}
            {(() => {
              const rows: React.ReactNode[] = [];
              let i = 0;
              
              while (i < allImages.length) {
                const remaining = allImages.length - i;
                const rowIndex = rows.length;
                
                // Pattern alternates between different bento layouts
                // Pattern A: 1 large (2x2) + 2 small stacked
                // Pattern B: 3 equal columns
                // Pattern C: 2 medium side by side
                
                if (remaining >= 3 && rowIndex % 3 === 0) {
                  // Pattern A: Large left + 2 stacked right
                  rows.push(
                    <div key={`row-${rowIndex}`} className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                      <button
                        onClick={() => { setCurrentIndex(i); setShowAllImages(false); setIsLightboxOpen(true); }}
                        className="relative col-span-2 sm:col-span-2 aspect-[4/3] overflow-hidden rounded-lg sm:rounded-xl bg-muted/30 group cursor-pointer"
                      >
                        <Image src={allImages[i]} alt={`Photo ${i + 1}`} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="66vw" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 px-1.5 sm:px-2 py-0.5 bg-black/60 text-white text-[10px] sm:text-xs font-bold rounded">{i + 1}</div>
                      </button>
                      <div className="col-span-2 sm:col-span-1 grid grid-cols-2 sm:flex sm:flex-col gap-1.5 sm:gap-2">
                        {[1, 2].map((offset) => {
                          const imgIdx = i + offset;
                          if (imgIdx >= allImages.length) return null;
                          return (
                            <button
                              key={imgIdx}
                              onClick={() => { setCurrentIndex(imgIdx); setShowAllImages(false); setIsLightboxOpen(true); }}
                              className="relative aspect-[4/3] sm:aspect-auto sm:flex-1 overflow-hidden rounded-lg sm:rounded-xl bg-muted/30 group cursor-pointer"
                            >
                              <Image src={allImages[imgIdx]} alt={`Photo ${imgIdx + 1}`} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="33vw" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                              <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 px-1.5 sm:px-2 py-0.5 bg-black/60 text-white text-[10px] sm:text-xs font-bold rounded">{imgIdx + 1}</div>
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
                        const imgIdx = i + offset;
                        if (imgIdx >= allImages.length) return null;
                        return (
                          <button
                            key={imgIdx}
                            onClick={() => { setCurrentIndex(imgIdx); setShowAllImages(false); setIsLightboxOpen(true); }}
                            className={cn(
                              "relative aspect-square overflow-hidden rounded-lg sm:rounded-xl bg-muted/30 group cursor-pointer",
                              offset === 2 && "col-span-2 sm:col-span-1 aspect-[2/1] sm:aspect-square"
                            )}
                          >
                            <Image src={allImages[imgIdx]} alt={`Photo ${imgIdx + 1}`} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="33vw" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 px-1.5 sm:px-2 py-0.5 bg-black/60 text-white text-[10px] sm:text-xs font-bold rounded">{imgIdx + 1}</div>
                          </button>
                        );
                      })}
                    </div>
                  );
                  i += 3;
                } else if (remaining >= 3 && rowIndex % 3 === 2) {
                  // Pattern C: 2 stacked left + Large right (reversed on mobile)
                  rows.push(
                    <div key={`row-${rowIndex}`} className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                      <button
                        onClick={() => { setCurrentIndex(i + 2); setShowAllImages(false); setIsLightboxOpen(true); }}
                        className="relative col-span-2 sm:col-span-2 sm:order-2 aspect-[4/3] overflow-hidden rounded-lg sm:rounded-xl bg-muted/30 group cursor-pointer"
                      >
                        <Image src={allImages[i + 2]} alt={`Photo ${i + 3}`} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="66vw" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 px-1.5 sm:px-2 py-0.5 bg-black/60 text-white text-[10px] sm:text-xs font-bold rounded">{i + 3}</div>
                      </button>
                      <div className="col-span-2 sm:col-span-1 sm:order-1 grid grid-cols-2 sm:flex sm:flex-col gap-1.5 sm:gap-2">
                        {[0, 1].map((offset) => {
                          const imgIdx = i + offset;
                          if (imgIdx >= allImages.length) return null;
                          return (
                            <button
                              key={imgIdx}
                              onClick={() => { setCurrentIndex(imgIdx); setShowAllImages(false); setIsLightboxOpen(true); }}
                              className="relative aspect-[4/3] sm:aspect-auto sm:flex-1 overflow-hidden rounded-lg sm:rounded-xl bg-muted/30 group cursor-pointer"
                            >
                              <Image src={allImages[imgIdx]} alt={`Photo ${imgIdx + 1}`} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="33vw" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                              <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 px-1.5 sm:px-2 py-0.5 bg-black/60 text-white text-[10px] sm:text-xs font-bold rounded">{imgIdx + 1}</div>
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
                        const imgIdx = i + offset;
                        return (
                          <button
                            key={imgIdx}
                            onClick={() => { setCurrentIndex(imgIdx); setShowAllImages(false); setIsLightboxOpen(true); }}
                            className="relative aspect-[4/3] overflow-hidden rounded-lg sm:rounded-xl bg-muted/30 group cursor-pointer"
                          >
                            <Image src={allImages[imgIdx]} alt={`Photo ${imgIdx + 1}`} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="50vw" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 px-1.5 sm:px-2 py-0.5 bg-black/60 text-white text-[10px] sm:text-xs font-bold rounded">{imgIdx + 1}</div>
                          </button>
                        );
                      })}
                    </div>
                  );
                  i += 2;
                } else if (remaining === 1) {
                  // 1 remaining: full width
                  rows.push(
                    <div key={`row-${rowIndex}`} className="mb-1.5 sm:mb-2">
                      <button
                        onClick={() => { setCurrentIndex(i); setShowAllImages(false); setIsLightboxOpen(true); }}
                        className="relative w-full aspect-[16/9] overflow-hidden rounded-lg sm:rounded-xl bg-muted/30 group cursor-pointer"
                      >
                        <Image src={allImages[i]} alt={`Photo ${i + 1}`} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="100vw" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 px-1.5 sm:px-2 py-0.5 bg-black/60 text-white text-[10px] sm:text-xs font-bold rounded">{i + 1}</div>
                      </button>
                    </div>
                  );
                  i += 1;
                }
              }
              
              return rows;
            })()}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}


function PricingInsights({ listing }: { listing: CarDetailedData }) {
  const valueFactors = listing.aiValueFactors;
  const hasValueFactors = valueFactors && (
    (valueFactors.positives && valueFactors.positives.length > 0) ||
    (valueFactors.considerations && valueFactors.considerations.length > 0)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground/70">
          AI Market Insights
        </p>
      </div>

      {/* Price Trend & Fair Value Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground/70">Price Trend</p>
          <div className="relative h-14 bg-muted/30 rounded-lg p-3">
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path
                d={listing.priceTrend === 'down' 
                  ? "M 5 5 L 25 8 L 50 10 L 75 14 L 95 18" 
                  : listing.priceTrend === 'up'
                  ? "M 5 18 L 25 14 L 50 10 L 75 8 L 95 5"
                  : "M 5 10 L 25 11 L 50 10 L 75 9 L 95 10"
                }
                stroke={listing.priceTrend === 'up' ? '#22c55e' : listing.priceTrend === 'down' ? '#ef4444' : '#a1a1aa'}
                strokeWidth="2"
                fill="none"
              />
            </svg>
            <div className={cn(
              "absolute top-1 right-2 text-xs font-semibold",
              listing.priceTrend === 'up' && "text-green-500",
              listing.priceTrend === 'down' && "text-red-500",
              !listing.priceTrend && "text-muted-foreground"
            )}>
              {listing.priceTrend === 'up' && '↑ Rising'}
              {listing.priceTrend === 'down' && '↓ Falling'}
              {listing.priceTrend === 'stable' && '→ Stable'}
              {!listing.priceTrend && '—'}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground/70">Estimated Value</p>
          <div className="h-14 bg-muted/30 rounded-lg flex items-center justify-center">
            <p className="text-lg font-bold tabular-nums text-foreground">
              {listing.fairValue ? formatPriceShort(listing.fairValue) : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Value Range */}
      <div className="p-4 bg-muted/30 rounded-xl border border-border/40 space-y-3">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground/70">Market Range</p>
          <p className="text-base font-bold tabular-nums text-foreground">
            {listing.estimateMin && listing.estimateMax 
              ? `${formatPrice(listing.estimateMin)} - ${formatPrice(listing.estimateMax)}`
              : '—'
            }
          </p>
        </div>

        <div className="flex justify-between pt-2 border-t border-border/40 text-xs">
          <span className="font-medium text-muted-foreground/70">AI Confidence</span>
          <span className="text-foreground font-bold">
            {listing.aiConfidenceScore ? `${Math.round(listing.aiConfidenceScore * 100)}%` : '—'}
          </span>
        </div>
      </div>

      {/* Value Factors - Neutral, non-judgmental */}
      {hasValueFactors && (
        <div className="p-4 bg-muted/20 rounded-xl border border-border/30 space-y-3">
          <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground/70 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            Value Factors
          </p>
          
          {/* Positives */}
          {valueFactors.positives && valueFactors.positives.length > 0 && (
            <div className="space-y-1.5">
              {valueFactors.positives.map((factor, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="font-medium text-foreground/80">{factor}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Considerations (neutral, not negatives) */}
          {valueFactors.considerations && valueFactors.considerations.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-border/20">
              <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">Consider</p>
              {valueFactors.considerations.map((factor, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground mt-0.5">•</span>
                  <span className="font-medium text-muted-foreground">{factor}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Market Context */}
          {valueFactors.marketContext && (
            <p className="text-xs font-medium text-muted-foreground/70 pt-2 border-t border-border/20">
              {valueFactors.marketContext}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function CarCardDetailed({ listing, kycVerified: _kycVerified, className }: CarCardDetailedProps) {
  const { isSignedIn } = useUser();
  const favorite = useFavorite(listing.id);
  const superlike = useSuperlike(listing.id);
  
  const [showSuperlikeConfirm, setShowSuperlikeConfirm] = useState(false);
  const [showSuperlikeLimit, setShowSuperlikeLimit] = useState(false);
  const [heartScale, setHeartScale] = useState(false);

  // Timer refs for cleanup
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const carTitle = `${listing.year} ${listing.make} ${listing.model}${listing.trim ? ` ${listing.trim}` : ''}`;

  // Memoize derived data to avoid recalculation on every render
  const ownerRemarks = useMemo(() => 
    listing.specialNotes?.ownerRemarks || [], 
    [listing.specialNotes?.ownerRemarks]
  );
  
  const allHighlights = useMemo(() => {
    const highlights: string[] = [...listing.tags];
    if (listing.specialNotes?.serviceHistory) highlights.push('Full Service History');
    if (listing.specialNotes?.singleOwner) highlights.push('Single Owner');
    if (listing.specialNotes?.accidentFree) highlights.push('Accident Free');
    if (listing.specialNotes?.underWarranty) highlights.push('Under Warranty');
    return highlights;
  }, [listing.tags, listing.specialNotes]);

  // Handlers with useCallback to prevent recreation on every render
  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/listings/${listing.slug || listing.id}`;
    const text = `${carTitle} - ${formatPrice(listing.price)}\n${formatMileage(listing.mileage)} km • ${formatEnumValue(listing.specs)} Specs • ${listing.emirate}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: carTitle, text, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Share error:', error);
      }
    }
  }, [listing.slug, listing.id, listing.price, listing.mileage, listing.specs, listing.emirate, carTitle]);

  const handleFavoriteClick = useCallback(() => {
    if (!isSignedIn) {
      favorite.toggle();
      return;
    }
    setHeartScale(true);
    favorite.toggle();
    const timer = setTimeout(() => setHeartScale(false), 400);
    timersRef.current.push(timer);
  }, [isSignedIn, favorite]);

  const handleSuperlikeClick = useCallback(() => {
    if (!isSignedIn) {
      superlike.toggle();
      return;
    }
    if (superlike.isSuperliked) {
      superlike.toggle();
      return;
    }
    // If quota isn't loaded yet, show confirmation (API will validate)
    if (!superlike.quota) {
      setShowSuperlikeConfirm(true);
      return;
    }
    // Check if user has superlikes remaining
    if (superlike.quota.remaining <= 0) {
      setShowSuperlikeLimit(true);
      return;
    }
    setShowSuperlikeConfirm(true);
  }, [isSignedIn, superlike]);

  const confirmSuperlike = useCallback(() => {
    superlike.toggle();
    setShowSuperlikeConfirm(false);
  }, [superlike]);

  return (
    <div className={cn("space-y-8", className)}>
      {/* Image Gallery */}
      <ImageGallery images={listing.images} title={carTitle} />

      {/* Highlights - Clean minimal list */}
      {allHighlights.length > 0 && (
        <div className="space-y-3">
          <p className="text-[13px] uppercase tracking-wider font-bold text-muted-foreground/70">
            Highlights
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2.5">
            {allHighlights.map((highlight, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-sm font-semibold text-foreground">{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="space-y-4">
        {/* Title & Actions Row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-1.5">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              {carTitle}
            </h1>
            
            {/* Price */}
            <div className="flex items-baseline gap-2.5 flex-wrap">
              <p className="text-xl sm:text-2xl font-bold tabular-nums text-blue-500">
                {formatPrice(listing.price)}
              </p>
              {listing.isNegotiable && (
                <span className="text-sm text-green-500 font-semibold">Negotiable</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {listing.isBlkListing && (
              <div className="px-2.5 py-1 text-[10px] font-bold tracking-widest bg-black text-white dark:bg-white dark:text-black rounded">
                BLK
              </div>
            )}

            <button 
              onClick={handleShare}
              className="p-2 sm:p-2.5 rounded-full hover:bg-muted/50 transition-colors"
              aria-label="Share"
            >
              <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
            </button>
            
            <button 
              onClick={handleFavoriteClick}
              disabled={favorite.isUpdating}
              className="p-2 sm:p-2.5 rounded-full hover:bg-muted/50 transition-colors"
              aria-label={favorite.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart 
                className={cn(
                  "w-5 h-5 sm:w-6 sm:h-6 transition-transform",
                  heartScale && "scale-125",
                  favorite.isFavorite ? "text-rose-500" : "text-muted-foreground"
                )}
                fill={favorite.isFavorite ? "currentColor" : "none"}
              />
            </button>
            
            <button 
              onClick={handleSuperlikeClick}
              disabled={superlike.isUpdating}
              className="p-2 sm:p-2.5 rounded-full hover:bg-muted/50 transition-colors"
              aria-label={superlike.isSuperliked ? "Remove superlike" : "Superlike"}
            >
              <Sparkles 
                className={cn(
                  "w-5 h-5 sm:w-6 sm:h-6",
                  superlike.isSuperliked ? "text-yellow-500" : "text-muted-foreground"
                )}
                fill={superlike.isSuperliked ? "currentColor" : "none"}
              />
            </button>
          </div>
        </div>

        {/* Quick Details */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted-foreground">
          <span className="font-bold tabular-nums text-foreground/80">{formatMileage(listing.mileage)} km</span>
          <span className="text-muted-foreground/40">•</span>
          <span className="font-bold text-foreground/80">{formatEnumValue(listing.specs)} Specs</span>
          <span className="text-muted-foreground/40">•</span>
          <span className="flex items-center gap-1.5 font-bold text-foreground/80">
            <MapPin className="w-4 h-4" />
            {listing.city ? `${listing.city}, ${formatEnumValue(listing.emirate)}` : formatEnumValue(listing.emirate)}
          </span>
        </div>

        {/* VIN */}
        {listing.vin && (
          <div className="flex items-baseline gap-2.5">
            <span className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground/70">VIN</span>
            <span className="font-mono text-sm font-medium text-muted-foreground/80">{listing.vin}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {listing.description && (
        <div className="space-y-3">
          <p className="text-[13px] uppercase tracking-wider font-bold text-muted-foreground/70">
            Description
          </p>
          <p className="text-sm font-medium text-muted-foreground leading-relaxed">
            {listing.description}
          </p>
        </div>
      )}

      {/* Specifications - Two Column with Label/Value rows */}
      <div className="space-y-4">
        <p className="text-[13px] uppercase tracking-wider font-bold text-muted-foreground/70">
          Specifications
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          {/* Left Column */}
          <div className="space-y-0">
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm font-medium text-muted-foreground/70">Body Type</span>
              <span className="text-sm font-semibold text-foreground">{formatEnumValue(listing.bodyType)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm font-medium text-muted-foreground/70">Engine</span>
              <span className="text-sm font-semibold text-foreground">{formatEnumValue(listing.engineSize)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm font-medium text-muted-foreground/70">Trim</span>
              <span className="text-sm font-semibold text-foreground">{listing.trim || '—'}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm font-medium text-muted-foreground/70">Exterior Color</span>
              <span className="text-sm font-semibold text-foreground">{formatEnumValue(listing.exteriorColor)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm font-medium text-muted-foreground/70">Cylinders</span>
              <span className="text-sm font-semibold text-foreground">{listing.cylinders || '—'}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm font-medium text-muted-foreground/70">Doors</span>
              <span className="text-sm font-semibold text-foreground">{listing.doors || '—'}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm font-medium text-muted-foreground/70">Seating Capacity</span>
              <span className="text-sm font-semibold text-foreground">{listing.seatingCapacity ? `${listing.seatingCapacity} Seater` : '—'}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm font-medium text-muted-foreground/70">Steering Side</span>
              <span className="text-sm font-semibold text-foreground">{formatEnumValue(listing.steeringSide)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm font-medium text-muted-foreground/70">Regional Specs</span>
              <span className="text-sm font-semibold text-foreground">{formatEnumValue(listing.specs)}</span>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-0">
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm font-medium text-muted-foreground/70">Transmission</span>
              <span className="text-sm font-semibold text-foreground">{formatEnumValue(listing.transmission)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm font-medium text-muted-foreground/70">Power</span>
              <span className="text-sm font-semibold text-foreground">{formatEnumValue(listing.powerRange)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm font-medium text-muted-foreground/70">Fuel Type</span>
              <span className="text-sm font-semibold text-foreground">{formatEnumValue(listing.fuelType)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm font-medium text-muted-foreground/70">Interior Color</span>
              <span className="text-sm font-semibold text-foreground">{formatEnumValue(listing.interiorColor)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm font-medium text-muted-foreground/70">Warranty</span>
              <span className="text-sm font-semibold text-foreground">{formatEnumValue(listing.warrantyType)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm font-medium text-muted-foreground/70">Seller Type</span>
              <span className="text-sm font-semibold text-foreground">{formatEnumValue(listing.sellerType)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm font-medium text-muted-foreground/70">Export Status</span>
              <span className="text-sm font-semibold text-foreground">{formatEnumValue(listing.exportStatus)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm font-medium text-muted-foreground/70">Engine Type</span>
              <span className="text-sm font-semibold text-foreground">{formatEnumValue(listing.engineType)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm font-medium text-muted-foreground/70">Torque</span>
              <span className="text-sm font-semibold text-foreground">{listing.torque || '—'}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm font-medium text-muted-foreground/70">Fuel Economy</span>
              <span className="text-sm font-semibold text-foreground">{listing.fuelEconomy || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Extras / Features */}
      {listing.extras.length > 0 && (
        <div className="space-y-3">
          <p className="text-[13px] uppercase tracking-wider font-bold text-muted-foreground/70">
            Features
          </p>
          <div className="flex flex-wrap gap-2">
            {listing.extras.map((extra, idx) => (
              <span 
                key={idx}
                className="px-3 py-1.5 text-sm font-semibold text-foreground/80 bg-muted/50 rounded-lg"
              >
                {extra}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick Notes / Owner Remarks */}
      {ownerRemarks.length > 0 && (
        <div className="space-y-3 pt-4">
          <p className="text-[13px] uppercase tracking-wider font-bold text-muted-foreground/70">
            Quick Notes
          </p>
          <ul className="space-y-2.5">
            {ownerRemarks.map((remark, idx) => (
              <li 
                key={idx}
                className="flex items-start gap-2.5 text-sm text-muted-foreground"
              >
                <span className="text-blue-500/60 mt-0.5">•</span>
                <span className="font-semibold">{remark}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Video */}
      {listing.videoUrl && (
        <a 
          href={listing.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3.5 p-4 bg-muted/30 rounded-xl border border-border/40 hover:bg-muted/50 transition-colors group"
        >
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Play className="w-5 h-5 text-primary ml-0.5" />
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground">Watch Video</span>
        </a>
      )}

      {/* AI Pricing Insights - Experimental */}
      <div className="space-y-4">
        <div className="pt-4 border-t border-border/40 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            <span className="font-bold text-foreground">Experimental:</span> AI-generated insights are for reference only. <span className="text-red-500 font-bold">Do not rely on this data.</span>
          </p>
        </div>
        <PricingInsights listing={listing} />
      </div>

      {/* Dialogs */}
      <SuperlikeConfirmationDialog
        isOpen={showSuperlikeConfirm}
        onClose={() => setShowSuperlikeConfirm(false)}
        onConfirm={confirmSuperlike}
        quota={superlike.quota}
        listingTitle={carTitle}
      />
      
      <SuperlikeLimitDialog
        isOpen={showSuperlikeLimit}
        onClose={() => setShowSuperlikeLimit(false)}
        resetDate={superlike.quota?.periodEndDate}
      />
      
      <AuthRequiredDialog
        isOpen={favorite.authRequired}
        onClose={favorite.dismissAuth}
        message={favorite.authMessage}
        feature="favorites"
      />
      
      <AuthRequiredDialog
        isOpen={superlike.authRequired}
        onClose={superlike.dismissAuth}
        message={superlike.authMessage}
        feature="superlikes"
      />
    </div>
  );
}
