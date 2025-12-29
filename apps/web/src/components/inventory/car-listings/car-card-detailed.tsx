/**
 * Car Card Detailed Component - Alifh Design System
 * 
 * Comprehensive car listing view with full specifications,
 * pricing insights, features, and partner info.
 * Following "Less is More" principle with clean typography.
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Share2, Heart, Sparkles, CheckCircle2, ChevronLeft, ChevronRight, Play, Wrench, FileText, Package, Tag } from 'lucide-react';
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
  if (!value) return 'N/A';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
};

// ============================================================================
// Sub-Components
// ============================================================================

function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const allImages = images.length > 0 ? images : ['/assets/cars/placeholder.avif'];

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

      {/* Gallery Info */}
      <p className="text-xs text-muted-foreground/70">
        Gallery ({allImages.length} photos)
        <span className="ml-3 text-primary hover:text-primary/80 cursor-pointer transition-colors">
          View all
        </span>
      </p>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-border/40">
      <span className="text-xs text-muted-foreground/70">{label}</span>
      <span className="text-xs font-medium tracking-tight text-foreground">{value ?? 'N/A'}</span>
    </div>
  );
}

function PricingInsights({ listing }: { listing: CarDetailedData }) {
  const hasAIInsights = listing.fairValue || listing.estimateMin || listing.estimateMax;
  
  // Calculate price position for market bar
  const getPricePosition = () => {
    if (!listing.estimateMin || !listing.estimateMax) return 50;
    const range = listing.estimateMax - listing.estimateMin;
    if (range === 0) return 50;
    const position = ((listing.price - listing.estimateMin) / range) * 100;
    return Math.min(Math.max(position, 5), 95);
  };

  const getPriceVsMarket = () => {
    if (!listing.fairValue) return null;
    const diff = ((listing.price - listing.fairValue) / listing.fairValue) * 100;
    if (Math.abs(diff) < 3) return { label: 'Fair Value', color: 'text-green-500' };
    if (diff < 0) return { label: 'Below Market', color: 'text-green-500' };
    return { label: 'Above Market', color: 'text-yellow-500' };
  };

  const priceVsMarket = getPriceVsMarket();

  return (
    <div className="space-y-4 pt-6 border-t border-border">
      {/* Price Trend & Fair Value Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Price Trend */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground">Price Trend</p>
          <div className="relative h-14 bg-muted/30 rounded-lg p-3">
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path
                d={listing.priceTrend === 'down' 
                  ? "M 5 5 L 25 8 L 50 10 L 75 14 L 95 18" 
                  : listing.priceTrend === 'up'
                  ? "M 5 18 L 25 14 L 50 10 L 75 8 L 95 5"
                  : "M 5 10 L 25 11 L 50 10 L 75 9 L 95 10"
                }
                stroke={listing.priceTrend === 'up' ? '#22c55e' : listing.priceTrend === 'down' ? '#ef4444' : '#eab308'}
                strokeWidth="2"
                fill="none"
              />
            </svg>
            <div className={cn(
              "absolute top-1 right-2 text-xs font-semibold",
              listing.priceTrend === 'up' && "text-green-500",
              listing.priceTrend === 'down' && "text-red-500",
              listing.priceTrend === 'stable' && "text-yellow-500",
              !listing.priceTrend && "text-muted-foreground"
            )}>
              {listing.priceTrend === 'up' && '+2.3%'}
              {listing.priceTrend === 'down' && '-1.8%'}
              {listing.priceTrend === 'stable' && '→ Stable'}
              {!listing.priceTrend && 'N/A'}
            </div>
          </div>
        </div>

        {/* Fair Value */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground">Fair Value</p>
          <div className="h-14 bg-muted/30 rounded-lg flex items-center justify-center">
            <p className="text-lg font-bold tabular-nums text-foreground">
              {listing.fairValue ? formatPriceShort(listing.fairValue) : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Market Analysis Available indicator */}
      {hasAIInsights && (
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="text-xs text-primary">Market Analysis Available</span>
        </div>
      )}

      {/* Estimated Value Range Card */}
      <div className="p-4 bg-muted/30 rounded-xl border border-border/40 space-y-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Estimated Value Range</p>
          <p className="text-base font-semibold tabular-nums text-foreground">
            {listing.estimateMin && listing.estimateMax 
              ? `${formatPrice(listing.estimateMin)} - ${formatPrice(listing.estimateMax)}`
              : 'Not available'
            }
          </p>
        </div>

        {/* Market Position */}
        {listing.estimateMin && listing.estimateMax && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Market Position</span>
              <span className="text-foreground font-medium">
                {priceVsMarket?.label || 'N/A'}
              </span>
            </div>
            
            {/* Market position bar */}
            <div className="relative">
              <div className="h-1.5 bg-gradient-to-r from-green-300/40 via-yellow-300/40 to-orange-300/40 rounded-full" />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-yellow-500 rounded-sm"
                style={{ left: `${getPricePosition()}%`, transform: 'translate(-50%, -50%)' }}
              />
            </div>
            
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Low</span>
              <span>Market</span>
              <span>High</span>
            </div>
          </div>
        )}

        {/* Additional metrics */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/40 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price vs Market</span>
            <span className={priceVsMarket?.color || 'text-muted-foreground'}>
              {priceVsMarket?.label || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Confidence</span>
            <span className="text-foreground font-medium">
              {listing.aiConfidenceScore 
                ? `${Math.round(listing.aiConfidenceScore * 100)}%` 
                : 'N/A'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TechnicalFeaturesList({ features }: { features: CarDetailedData['technicalFeatures'] }) {
  const featureLabels: Record<string, string> = {
    abs: 'ABS',
    airbags: 'Airbags',
    parkingSensors: 'Parking Sensors',
    rearCamera: 'Rear Camera',
    blindSpotMonitor: 'Blind Spot Monitor',
    laneAssist: 'Lane Assist',
    adaptiveCruise: 'Adaptive Cruise',
    collisionWarning: 'Collision Warning',
    leatherSeats: 'Leather Seats',
    heatedSeats: 'Heated Seats',
    ventilatedSeats: 'Ventilated Seats',
    sunroof: 'Sunroof',
    panoramicRoof: 'Panoramic Roof',
    climateControl: 'Climate Control',
    powerSeats: 'Power Seats',
    memorySeats: 'Memory Seats',
    touchscreen: 'Touchscreen',
    appleCarPlay: 'Apple CarPlay',
    androidAuto: 'Android Auto',
    bluetooth: 'Bluetooth',
    navigation: 'Navigation',
    wirelessCharging: 'Wireless Charging',
    sportMode: 'Sport Mode',
    paddleShifters: 'Paddle Shifters',
    allWheelDrive: 'All-Wheel Drive',
    adjustableSuspension: 'Adjustable Suspension',
    launchControl: 'Launch Control',
  };

  const activeFeatures = Object.entries(features)
    .filter(([key, value]) => value === true && featureLabels[key])
    .map(([key]) => featureLabels[key]);

  if (features.airbags && typeof features.airbags === 'number') {
    activeFeatures.push(`${features.airbags} Airbags`);
  }
  if (features.screenSize) {
    activeFeatures.push(`${features.screenSize} Screen`);
  }
  if (features.soundSystem) {
    activeFeatures.push(features.soundSystem);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground/70">
        Technical Features
      </p>
      {activeFeatures.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {activeFeatures.map((feature, idx) => (
            <span 
              key={idx}
              className="px-2.5 py-1 text-xs font-medium tracking-tight bg-muted text-muted-foreground rounded border border-border/40"
            >
              {feature}
            </span>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-3 py-4">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <Wrench className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground">No technical features listed</p>
        </div>
      )}
    </div>
  );
}

function SpecialNotesList({ notes }: { notes: CarDetailedData['specialNotes'] }) {
  const items: string[] = [];
  
  if (notes.serviceHistory) items.push('Full Service History');
  if (notes.singleOwner) items.push('Single Owner');
  if (notes.accidentFree) items.push('Accident Free');
  if (notes.underWarranty) items.push('Under Warranty');
  if (notes.registeredUntil) items.push(`Registered Until: ${notes.registeredUntil}`);
  if (notes.customizations?.length) {
    items.push(...notes.customizations.map(c => `Custom: ${c}`));
  }
  if (notes.recentServices?.length) {
    items.push(...notes.recentServices.map(s => `Recent: ${s}`));
  }
  if (notes.knownIssues?.length) {
    items.push(...notes.knownIssues.map(i => `Note: ${i}`));
  }

  // Separate highlight items and other notes
  const highlightLabels = ['Full Service History', 'Single Owner', 'Accident Free', 'Under Warranty'];
  const highlights = items.filter(item => highlightLabels.includes(item));
  const otherNotes = items.filter(item => !highlightLabels.includes(item));

  if (items.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground/70">
          Highlights
        </p>
        <div className="flex items-center gap-3 py-4">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <FileText className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground">No highlights or special notes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Highlights with badges */}
      {highlights.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground/70">
            Highlights
          </p>
          <div className="flex flex-wrap gap-1.5">
            {highlights.map((item, idx) => (
              <span 
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium tracking-tight bg-green-500/10 text-green-600 dark:text-green-400 rounded border border-green-500/20"
              >
                <CheckCircle2 className="w-3 h-3" />
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Other notes */}
      {otherNotes.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground/70">
            Additional Notes
          </p>
          <ul className="space-y-1.5">
            {otherNotes.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                <div className="w-1 h-1 bg-muted-foreground rounded-full mt-1.5 flex-shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function CarCardDetailed({ listing, className }: CarCardDetailedProps) {
  const { isSignedIn } = useUser();
  const favorite = useFavorite(listing.id);
  const superlike = useSuperlike(listing.id);
  
  const [showSuperlikeConfirm, setShowSuperlikeConfirm] = useState(false);
  const [showSuperlikeLimit, setShowSuperlikeLimit] = useState(false);
  const [heartScale, setHeartScale] = useState(false);

  const carTitle = `${listing.year} ${listing.make} ${listing.model}${listing.trim ? ` ${listing.trim}` : ''}`;

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
    <div className={cn("space-y-6", className)}>
      {/* Image Gallery */}
      <ImageGallery images={listing.images} title={carTitle} />

      {/* Tags */}
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground/70">
          Tags
        </p>
        {listing.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {listing.tags.map((tag, idx) => (
              <span 
                key={idx}
                className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-muted text-muted-foreground rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 py-4">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Tag className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">No tags</p>
          </div>
        )}
      </div>

      {/* Header Section */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Title, Price, Details */}
        <div className="flex-1 space-y-3">
          {/* Title */}
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
          
          {/* Quick Details */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium tabular-nums">{formatMileage(listing.mileage)} km</span>
            <span className="text-muted-foreground/40">•</span>
            <span>{formatEnumValue(listing.specs)} Specs</span>
            <span className="text-muted-foreground/40">•</span>
            <span>{listing.emirate}</span>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {listing.description || `Experience this meticulously maintained ${listing.year} ${listing.make} ${listing.model}. This vehicle combines performance with practicality, featuring quality materials and reliable engineering throughout.`}
          </p>

          {/* VIN */}
          <div className="space-y-1">
            <p className="text-[10px] text-primary uppercase tracking-wider font-medium">Vehicle Identification Number</p>
            <p className="font-mono text-xs text-foreground">{listing.vin || 'Not provided'}</p>
          </div>
        </div>

        {/* Right: QI Score & Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {listing.qiScore && (
            <div className="px-2 py-1 text-[10px] font-bold tabular-nums bg-foreground text-background rounded">
              QI {Math.round(listing.qiScore)}
            </div>
          )}
          
          {listing.isBlackMember && (
            <div className="px-2 py-1 text-[10px] font-bold tracking-widest bg-black text-white dark:bg-white dark:text-black rounded">
              BLK
            </div>
          )}

          <button 
            onClick={handleShare}
            className="p-2 rounded-full bg-muted/40 hover:bg-muted transition-colors"
            aria-label="Share"
          >
            <Share2 className="w-4 h-4 text-muted-foreground" />
          </button>
          
          <button 
            onClick={handleFavoriteClick}
            disabled={favorite.isUpdating}
            className={cn(
              "p-2 rounded-full transition-all",
              favorite.isFavorite 
                ? "bg-rose-100 dark:bg-rose-900/20 text-rose-500" 
                : "bg-muted/40 hover:bg-muted text-muted-foreground"
            )}
            aria-label={favorite.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart 
              className={cn("w-4 h-4 transition-transform", heartScale && "scale-125")}
              fill={favorite.isFavorite ? "currentColor" : "none"}
            />
          </button>
          
          <button 
            onClick={handleSuperlikeClick}
            disabled={superlike.isUpdating}
            className={cn(
              "p-2 rounded-full transition-all",
              superlike.isSuperliked 
                ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-500" 
                : "bg-muted/40 hover:bg-muted text-muted-foreground"
            )}
            aria-label={superlike.isSuperliked ? "Remove superlike" : "Superlike"}
          >
            <Sparkles 
              className="w-4 h-4"
              fill={superlike.isSuperliked ? "currentColor" : "none"}
            />
          </button>
        </div>
      </div>

      {/* Pricing Insights */}
      <PricingInsights listing={listing} />

      {/* Special Notes / Highlights */}
      <SpecialNotesList notes={listing.specialNotes} />

      {/* Specifications */}
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground/70">
          Specifications
        </p>
        <div className="grid grid-cols-2 gap-x-6">
          <SpecRow label="Body Type" value={formatEnumValue(listing.bodyType)} />
          <SpecRow label="Transmission" value={formatEnumValue(listing.transmission)} />
          <SpecRow label="Engine Size" value={listing.engineSize} />
          <SpecRow label="Engine Type" value={formatEnumValue(listing.engineType)} />
          <SpecRow label="Power" value={formatEnumValue(listing.powerRange)} />
          <SpecRow label="Cylinders" value={listing.cylinders} />
          <SpecRow label="Fuel Type" value={formatEnumValue(listing.fuelType)} />
          <SpecRow label="Fuel Economy" value={listing.fuelEconomy} />
          <SpecRow label="Exterior Color" value={formatEnumValue(listing.exteriorColor)} />
          <SpecRow label="Interior Color" value={formatEnumValue(listing.interiorColor)} />
          <SpecRow label="Doors" value={listing.doors} />
          <SpecRow label="Seating Capacity" value={listing.seatingCapacity} />
          <SpecRow label="Steering Side" value={formatEnumValue(listing.steeringSide)} />
          <SpecRow label="Export Status" value={formatEnumValue(listing.exportStatus)} />
          <SpecRow label="Warranty" value={formatEnumValue(listing.warrantyType)} />
          <SpecRow label="Seller Type" value={formatEnumValue(listing.sellerType)} />
        </div>
      </div>

      {/* Extras */}
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground/70">
          Extras
        </p>
        {listing.extras.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {listing.extras.map((extra, idx) => (
              <span 
                key={idx}
                className="px-2.5 py-1 text-xs font-medium tracking-tight bg-muted text-muted-foreground rounded border border-border/40"
              >
                {extra}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 py-4">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Package className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">No extras listed</p>
          </div>
        )}
      </div>

      {/* Technical Features */}
      <TechnicalFeaturesList features={listing.technicalFeatures} />

      {/* Video */}
      {listing.videoUrl && (
        <a 
          href={listing.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-border/40 hover:bg-muted/50 transition-colors group"
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
