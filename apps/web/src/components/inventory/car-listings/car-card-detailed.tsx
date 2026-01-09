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
  const validImages = images.filter(img => img && typeof img === 'string' && img.trim().length > 0);
  const allImages = validImages.length > 0 ? validImages : ['/assets/cars/placeholder.avif'];

  const next = () => setCurrentIndex((i) => (i + 1) % allImages.length);
  const prev = () => setCurrentIndex((i) => (i - 1 + allImages.length) % allImages.length);

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-muted/20">
        <Image
          src={allImages[currentIndex]}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 66vw"
          priority
        />
        
        {/* Navigation Arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4 text-neutral-800" />
            </button>
            <button
              onClick={next}
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

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin min-w-0">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "relative w-16 h-12 flex-shrink-0 rounded-lg overflow-hidden transition-all",
                idx === currentIndex 
                  ? "ring-2 ring-primary ring-offset-1" 
                  : "opacity-60 hover:opacity-100"
              )}
            >
              <Image src={img} alt={`View ${idx + 1}`} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
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
