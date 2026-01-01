/**
 * Car Card Detailed Component - Alifh Design System
 * 
 * Comprehensive car listing view matching the listing form fields.
 * AI metrics section kept as placeholder for future data.
 * Following "Less is More" principle with clean typography.
 */

'use client';

import React, { useState } from 'react';
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
  Package,
  MessageSquare,
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
// Utility Functions
// ============================================================================

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatMileage = (km: number) => {
  return new Intl.NumberFormat('en-US').format(km);
};

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
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
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

function SpecRow({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="flex flex-col gap-0.5 py-2">
      <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-medium tracking-tight text-foreground">{value || '—'}</span>
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
        <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground/70">
          AI Market Insights
        </p>
      </div>

      {/* Price Trend & Fair Value Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Price Trend</p>
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
          <p className="text-xs text-muted-foreground">Estimated Value</p>
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
          <p className="text-xs text-muted-foreground">Market Range</p>
          <p className="text-base font-semibold tabular-nums text-foreground">
            {listing.estimateMin && listing.estimateMax 
              ? `${formatPrice(listing.estimateMin)} - ${formatPrice(listing.estimateMax)}`
              : '—'
            }
          </p>
        </div>

        <div className="flex justify-between pt-2 border-t border-border/40 text-xs">
          <span className="text-muted-foreground">AI Confidence</span>
          <span className="text-foreground font-medium">
            {listing.aiConfidenceScore ? `${Math.round(listing.aiConfidenceScore * 100)}%` : '—'}
          </span>
        </div>
      </div>

      {/* Value Factors - Neutral, non-judgmental */}
      {hasValueFactors && (
        <div className="p-4 bg-muted/20 rounded-xl border border-border/30 space-y-3">
          <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground/70 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            Value Factors
          </p>
          
          {/* Positives */}
          {valueFactors.positives && valueFactors.positives.length > 0 && (
            <div className="space-y-1.5">
              {valueFactors.positives.map((factor, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span className="text-foreground/80">{factor}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Considerations (neutral, not negatives) */}
          {valueFactors.considerations && valueFactors.considerations.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-border/20">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Consider</p>
              {valueFactors.considerations.map((factor, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground mt-0.5">•</span>
                  <span className="text-muted-foreground">{factor}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Market Context */}
          {valueFactors.marketContext && (
            <p className="text-xs text-muted-foreground/70 pt-2 border-t border-border/20">
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

export function CarCardDetailed({ listing, kycVerified, className }: CarCardDetailedProps) {
  const { isSignedIn } = useUser();
  const favorite = useFavorite(listing.id);
  const superlike = useSuperlike(listing.id);
  
  const [showSuperlikeConfirm, setShowSuperlikeConfirm] = useState(false);
  const [showSuperlikeLimit, setShowSuperlikeLimit] = useState(false);
  const [heartScale, setHeartScale] = useState(false);

  const carTitle = `${listing.year} ${listing.make} ${listing.model}${listing.trim ? ` ${listing.trim}` : ''}`;

  // Get owner remarks from specialNotes
  const ownerRemarks: string[] = listing.specialNotes?.ownerRemarks || [];
  
  // Combine all highlights: tags + legacy booleans
  const allHighlights: string[] = [...listing.tags];
  if (listing.specialNotes?.serviceHistory) allHighlights.push('Full Service History');
  if (listing.specialNotes?.singleOwner) allHighlights.push('Single Owner');
  if (listing.specialNotes?.accidentFree) allHighlights.push('Accident Free');
  if (listing.specialNotes?.underWarranty) allHighlights.push('Under Warranty');

  // Handlers
  const handleShare = async () => {
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
  };

  const handleFavoriteClick = () => {
    if (!isSignedIn) {
      favorite.toggle();
      return;
    }
    setHeartScale(true);
    favorite.toggle();
    setTimeout(() => setHeartScale(false), 400);
  };

  const handleSuperlikeClick = () => {
    if (!isSignedIn) {
      superlike.toggle();
      return;
    }
    if (superlike.isSuperliked) {
      superlike.toggle();
      return;
    }
    if (!superlike.quota || superlike.quota.remaining <= 0) {
      setShowSuperlikeLimit(true);
      return;
    }
    setShowSuperlikeConfirm(true);
  };

  const confirmSuperlike = () => {
    superlike.toggle();
    setShowSuperlikeConfirm(false);
  };

  return (
    <div className={cn("space-y-8", className)}>
      {/* Image Gallery */}
      <ImageGallery images={listing.images} title={carTitle} />

      {/* Highlights - Clean minimal list */}
      {allHighlights.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground/70">
            Highlights
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {allHighlights.map((highlight, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                <span className="text-sm text-foreground">{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="space-y-4">
        {/* Title & Actions Row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {carTitle}
            </h1>
            
            {/* Price */}
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold tabular-nums text-foreground">
                {formatPrice(listing.price)}
              </p>
              {listing.isNegotiable && (
                <span className="text-xs text-muted-foreground/70">Negotiable</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {listing.isBlackMember && (
              <div className="px-2 py-1 text-[10px] font-bold tracking-widest bg-black text-white dark:bg-white dark:text-black rounded">
                BLK
              </div>
            )}

            <button 
              onClick={handleShare}
              className="p-2 hover:opacity-70 transition-opacity"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4 text-muted-foreground" />
            </button>
            
            <button 
              onClick={handleFavoriteClick}
              disabled={favorite.isUpdating}
              className="p-2 hover:opacity-70 transition-opacity"
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
              className="p-2 hover:opacity-70 transition-opacity"
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
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="font-medium tabular-nums">{formatMileage(listing.mileage)} km</span>
          <span className="text-muted-foreground/40">•</span>
          <span>{formatEnumValue(listing.specs)} Specs</span>
          <span className="text-muted-foreground/40">•</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {listing.city ? `${listing.city}, ${formatEnumValue(listing.emirate)}` : formatEnumValue(listing.emirate)}
          </span>
        </div>

        {/* VIN */}
        {listing.vin && (
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">VIN</span>
            <span className="font-mono text-xs text-foreground">{listing.vin}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {listing.description && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground/70">
            Description
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {listing.description}
          </p>
        </div>
      )}

      {/* AI Pricing Insights */}
      <PricingInsights listing={listing} />

      {/* Specifications - Two Column with Label/Value rows */}
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground/70">
          Specifications
        </p>
        
        <div className="grid grid-cols-2 gap-x-8">
          {/* Left Column */}
          <div className="space-y-0">
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Body Type</span>
              <span className="text-sm font-medium text-foreground">{formatEnumValue(listing.bodyType)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Engine</span>
              <span className="text-sm font-medium text-foreground">{formatEnumValue(listing.engineSize)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Trim</span>
              <span className="text-sm font-medium text-foreground">{listing.trim || '—'}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Exterior Color</span>
              <span className="text-sm font-medium text-foreground">{formatEnumValue(listing.exteriorColor)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Cylinders</span>
              <span className="text-sm font-medium text-foreground">{listing.cylinders || '—'}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Doors</span>
              <span className="text-sm font-medium text-foreground">{listing.doors || '—'}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Seating Capacity</span>
              <span className="text-sm font-medium text-foreground">{listing.seatingCapacity ? `${listing.seatingCapacity} Seater` : '—'}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Steering Side</span>
              <span className="text-sm font-medium text-foreground">{formatEnumValue(listing.steeringSide)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Regional Specs</span>
              <span className="text-sm font-medium text-foreground">{formatEnumValue(listing.specs)}</span>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-0">
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Transmission</span>
              <span className="text-sm font-medium text-foreground">{formatEnumValue(listing.transmission)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Power</span>
              <span className="text-sm font-medium text-foreground">{formatEnumValue(listing.powerRange)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Fuel Type</span>
              <span className="text-sm font-medium text-foreground">{formatEnumValue(listing.fuelType)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Interior Color</span>
              <span className="text-sm font-medium text-foreground">{formatEnumValue(listing.interiorColor)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Warranty</span>
              <span className="text-sm font-medium text-foreground">{formatEnumValue(listing.warrantyType)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Seller Type</span>
              <span className="text-sm font-medium text-foreground">{formatEnumValue(listing.sellerType)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Export Status</span>
              <span className="text-sm font-medium text-foreground">{formatEnumValue(listing.exportStatus)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Engine Type</span>
              <span className="text-sm font-medium text-foreground">{formatEnumValue(listing.engineType)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Torque</span>
              <span className="text-sm font-medium text-foreground">{listing.torque || '—'}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Fuel Economy</span>
              <span className="text-sm font-medium text-foreground">{listing.fuelEconomy || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Extras / Features */}
      {listing.extras.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground/70">
            Features
          </p>
          <div className="flex flex-wrap gap-2">
            {listing.extras.map((extra, idx) => (
              <span 
                key={idx}
                className="px-2.5 py-1 text-xs text-muted-foreground bg-muted/50 rounded"
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
          <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground/70">
            Quick Notes
          </p>
          <ul className="space-y-2">
            {ownerRemarks.map((remark, idx) => (
              <li 
                key={idx}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="text-muted-foreground/50 mt-0.5">•</span>
                <span>{remark}</span>
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
          className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border/40 hover:bg-muted/50 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Play className="w-4 h-4 text-primary ml-0.5" />
          </div>
          <span className="text-sm font-medium tracking-tight text-foreground">Watch Video</span>
        </a>
      )}

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
        isOpen={favorite.authRequired || superlike.authRequired}
        onClose={() => {
          if (favorite.authRequired) favorite.toggle();
          if (superlike.authRequired) superlike.toggle();
        }}
        feature={favorite.authRequired ? 'favorites' : 'superlikes'}
      />
    </div>
  );
}
