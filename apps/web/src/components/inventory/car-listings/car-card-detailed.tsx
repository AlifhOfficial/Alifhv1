/**
 * Car Card Detailed Component - Alifh Design System
 * 
 * Comprehensive car listing view matching the listing form fields.
 * AI metrics section kept as placeholder for future data.
 * Following "Less is More" principle with clean typography.
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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
  Grid3X3,
} from 'lucide-react';
import { useFavorite, useSuperlike } from '@/hooks/engagement';
import { useUser } from '@/hooks/auth/use-auth';
import { cn } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { SuperlikeConfirmationDialog } from '@/components/engagement/favorites/superlike-confirmation-dialog';
import { SuperlikeLimitDialog } from '@/components/engagement/favorites/superlike-limit-dialog';
import { AuthRequiredDialog } from '@/components/auth/auth-required-dialog';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { ImageGridModal } from '@/components/ui/image-grid-modal';
import type { CarDetailedData } from '@alifh/database';

// ============================================================================
// Types
// ============================================================================

interface CarCardDetailedProps {
  listing: CarDetailedData;
  kycVerified?: boolean; // User/Seller KYC verification status
  isBlackTierPartner?: boolean; // Partner is Black tier member
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
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showAllImages, setShowAllImages] = useState(false);
  
  // Ensure images is always an array and filter out empty/invalid entries
  const imageArray = Array.isArray(images) ? images : [];
  const validImages = useMemo(() => 
    imageArray.filter(img => img && typeof img === 'string' && img.trim().length > 0),
    [imageArray]
  );
  const allImages = validImages.length > 0 ? validImages : ['/assets/cars/placeholder.avif'];
  
  // Ensure currentIndex is always valid
  const safeCurrentIndex = Math.min(Math.max(0, currentIndex), allImages.length - 1);
  const currentImage = allImages[safeCurrentIndex] || '/assets/cars/placeholder.avif';

  const next = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % allImages.length);
  }, [allImages.length]);

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  // Handle image click from grid - opens lightbox at that index
  const handleGridImageClick = useCallback((index: number) => {
    setLightboxIndex(index);
    setShowAllImages(false);
    setIsLightboxOpen(true);
  }, []);

  // Handle index change from lightbox
  const handleLightboxIndexChange = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

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
          onClick={() => { setLightboxIndex(safeCurrentIndex); setIsLightboxOpen(true); }}
        >
          {currentImage && (
            <Image
              src={currentImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 66vw"
              priority
            />
          )}
          
          {/* Navigation Arrows */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/70 hover:bg-white/90 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center transition-all shadow-lg"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4 text-black" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/70 hover:bg-white/90 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center transition-all shadow-lg"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4 text-black" />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/70 text-white text-xs font-medium tabular-nums rounded">
            {safeCurrentIndex + 1}/{allImages.length}
          </div>
        </div>

        {/* Thumbnails Row */}
        {allImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin min-w-0">
            {displayedThumbnails.map((img, idx) => (
              img && (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    "relative w-16 h-12 flex-shrink-0 overflow-hidden transition-all rounded-md",
                    idx === safeCurrentIndex 
                      ? "opacity-100 scale-105" 
                      : "opacity-50 hover:opacity-80"
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
              )
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

      {/* Fullscreen Lightbox */}
      <ImageLightbox
        images={allImages}
        currentIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        title={title}
        onClose={() => setIsLightboxOpen(false)}
        onIndexChange={handleLightboxIndexChange}
      />

      {/* View All Images Grid */}
      <ImageGridModal
        images={allImages}
        isOpen={showAllImages}
        title="All Photos"
        onClose={() => setShowAllImages(false)}
        onImageClick={handleGridImageClick}
      />
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

export function CarCardDetailed({ listing, kycVerified: _kycVerified, isBlackTierPartner, className }: CarCardDetailedProps) {
  const { isSignedIn } = useUser();
  
  // Show BLK badge if listing is Black OR partner is Black tier
  const showBlkBadge = listing.isBlkListing || isBlackTierPartner;
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
            {showBlkBadge && (
              <span className="inline-flex items-center px-1.5 h-5 text-[10px] font-black tracking-wider bg-black text-white">
                BLK
              </span>
            )}

            <button 
              onClick={handleShare}
              className="p-1.5 rounded-full hover:bg-muted/50 transition-colors"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4 text-muted-foreground" />
            </button>
            
            <button 
              onClick={handleFavoriteClick}
              disabled={favorite.isUpdating}
              className="p-1.5 rounded-full hover:bg-muted/50 transition-colors"
              aria-label={favorite.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart 
                className={cn(
                  "w-4 h-4 transition-transform",
                  heartScale && "scale-125",
                  favorite.isFavorite ? "text-rose-500" : "text-muted-foreground"
                )}
                fill={favorite.isFavorite ? "currentColor" : "none"}
              />
            </button>
            
            <button 
              onClick={handleSuperlikeClick}
              disabled={superlike.isUpdating}
              className="p-1.5 rounded-full hover:bg-muted/50 transition-colors"
              aria-label={superlike.isSuperliked ? "Remove superlike" : "Superlike"}
            >
              <Sparkles 
                className={cn(
                  "w-4 h-4",
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

// ============================================================================
// SKELETON
// ============================================================================

function CarCardDetailedSkeletonComponent() {
  return (
    <div className="space-y-8">
      {/* Image Gallery */}
      <div className="space-y-3">
        {/* Main Image */}
        <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
        
        {/* Thumbnails */}
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-16 h-12 rounded-lg flex-shrink-0" />
          ))}
        </div>
      </div>

      {/* Highlights */}
      <div className="space-y-3">
        <Skeleton className="h-[13px] w-20" />
        <div className="flex flex-wrap gap-x-5 gap-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <Skeleton className="w-4 h-4 rounded-full" />
              <Skeleton className="h-3.5 w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* Header Section */}
      <div className="space-y-4">
        {/* Title & Actions */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-1.5">
            <Skeleton className="h-5 sm:h-6 w-3/4" />
            <Skeleton className="h-6 sm:h-7 w-36" />
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-7 w-7 rounded-full" />
          </div>
        </div>

        {/* Quick Details - mileage · specs · location */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-28" />
        </div>

        {/* VIN */}
        <div className="flex items-baseline gap-2.5">
          <Skeleton className="h-[11px] w-8" />
          <Skeleton className="h-3.5 w-40" />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-3">
        <Skeleton className="h-[13px] w-24" />
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-2/3" />
        </div>
      </div>

      {/* Specifications - Two Column Grid */}
      <div className="space-y-4">
        <Skeleton className="h-[13px] w-28" />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex justify-between py-3 border-b border-border">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3.5 w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Features/Extras */}
      <div className="space-y-3">
        <Skeleton className="h-[13px] w-16" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-24 rounded-md" />
          ))}
        </div>
      </div>

      {/* AI Pricing Insights */}
      <div className="space-y-4">
        <div className="pt-4 border-t border-border">
          <Skeleton className="h-3 w-32" />
        </div>
        
        {/* Price Trend & Fair Value Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>

        {/* Value Range */}
        <Skeleton className="h-24 w-full rounded-xl" />

        {/* Value Factors */}
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
    </div>
  );
}

CarCardDetailed.Skeleton = CarCardDetailedSkeletonComponent;
