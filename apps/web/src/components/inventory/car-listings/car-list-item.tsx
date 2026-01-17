/**
 * Car List Item Component - Alifh Design System
 * List view variant following "Less is More" principle
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Share2, Heart, Sparkles, CheckCircle2 } from 'lucide-react';
import { useFavorite, useSuperlike } from '@/hooks/engagement';
import { cn } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect, useRef, useCallback } from 'react';
import { SuperlikeConfirmationDialog } from '@/components/engagement/favorites/superlike-confirmation-dialog';
import { SuperlikeLimitDialog } from '@/components/engagement/favorites/superlike-limit-dialog';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { BrandAvatar } from '@/components/partner/car-dealer/ui/brand-avatar';

interface CarListItemProps {
  id: string;
  make: string;
  model: string;
  year: number;
  trim?: string | null;
  price: number;
  mileage: number;
  emirate: string;
  specs?: string | null;
  thumbnail?: string | null;
  images?: string[];
  qiScore?: number | null;
  isBlkListing?: boolean; // Black listing flag
  partnerName?: string;
  partnerLogo?: string | null;
  partnerVerified?: boolean;
  isBlackTierPartner?: boolean; // Partner is black tier member
  sellerName?: string | null;
  sellerAvatarUrl?: string | null;
  kycVerified?: boolean; // User/Seller KYC verification status
  className?: string;
}

export function CarListItem({
  id,
  make,
  model,
  year,
  trim,
  price,
  mileage,
  emirate,
  specs = 'GCC',
  thumbnail,
  images,
  qiScore,
  isBlkListing,
  partnerName,
  partnerLogo,
  partnerVerified,
  isBlackTierPartner,
  sellerName,
  sellerAvatarUrl,
  kycVerified,
  className
}: CarListItemProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount); // Price stored as full AED, not fils
  };

  const formatMileage = (km: number) => {
    if (km >= 1000) {
      return `${(km / 1000).toFixed(0)}k`;
    }
    return km.toString();
  };

  const formatEmirate = (emirate: string) => {
    const emirateMap: Record<string, string> = {
      'dubai': 'Dubai',
      'abu_dhabi': 'Abu Dhabi',
      'sharjah': 'Sharjah',
      'ajman': 'Ajman',
      'ras_al_khaimah': 'Ras Al Khaimah',
      'fujairah': 'Fujairah',
      'umm_al_quwain': 'Umm Al Quwain',
    };
    return emirateMap[emirate.toLowerCase()] || emirate;
  };

  const formatSpecs = (specs: string) => {
    const specsMap: Record<string, string> = {
      'gcc': 'GCC',
      'us': 'US',
      'european': 'European',
      'japanese': 'Japanese',
      'canadian': 'Canadian',
      'american': 'American',
    };
    return specsMap[specs.toLowerCase()] || specs;
  };

  const displayImage = thumbnail || images?.[0] || '/assets/cars/car1.avif';
  const displaySpecs = formatSpecs(specs || 'GCC');
  const displayEmirate = formatEmirate(emirate);
  const displaySellerName = partnerName || sellerName || 'Private Seller';
  const isPartnerListing = Boolean(partnerLogo || partnerName);
  
  // Separate hooks for favorites and superlikes
  const favorite = useFavorite(id);
  const superlike = useSuperlike(id);

  const [showSuperlikeConfirm, setShowSuperlikeConfirm] = useState(false);
  const [showSuperlikeLimit, setShowSuperlikeLimit] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [heartScale, setHeartScale] = useState(false);

  // Timer refs for cleanup
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/listings/${id}`;
    const title = `${year} ${make} ${model}${trim ? ` ${trim}` : ''}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled or share failed silently
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  }, [id, year, make, model, trim]);

  const handleSuperlikeClick = () => {
    if (superlike.isSuperliked) {
      superlike.toggle();
      return;
    }

    if (!superlike.quota) {
      setShowSuperlikeConfirm(true);
      return;
    }

    if (superlike.quota.remaining <= 0) {
      setShowSuperlikeLimit(true);
      return;
    }

    setShowSuperlikeConfirm(true);
  };

  const confirmSuperlike = async () => {
    setShowSparkles(true);
    const timer1 = setTimeout(() => superlike.toggle(), 100);
    const timer2 = setTimeout(() => setShowSparkles(false), 2000);
    timersRef.current.push(timer1, timer2);
  };

  const handleFavoriteClick = () => {
    setHeartScale(true);
    favorite.toggle();
    const timer = setTimeout(() => setHeartScale(false), 400);
    timersRef.current.push(timer);
  };

  const carTitle = `${year} ${make} ${model}${trim ? ` ${trim}` : ''}`;

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-xl transition-all duration-200 flex flex-col lg:flex-row w-full",
      isBlkListing 
        ? "bg-zinc-950 border border-zinc-800/60 hover:border-zinc-700/80" 
        : "bg-sidebar border border-border/40 hover:border-border/60",
      className
    )}>
      {/* Subtle top accent for BLK listings */}
      {isBlkListing && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      )}

      {/* Image Section */}
      <div className="p-3 w-full lg:w-80 flex-shrink-0">
        <Link href={`/listings/${id}`} className={cn(
          "relative aspect-[4/3] w-full overflow-hidden rounded-lg block",
          isBlkListing ? "bg-white/5" : "bg-muted/20"
        )}>
          <Image
            src={displayImage}
            alt={`${year} ${make} ${model}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 1024px) 100vw, 320px"
          />
          {/* BLK Badge */}
          {isBlkListing && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-zinc-900/90 backdrop-blur-sm">
              <span className="text-[10px] font-bold tracking-wider text-white">BLK</span>
            </div>
          )}
        </Link>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col px-4 lg:px-6 py-4 lg:py-5 min-w-0 min-h-0">
        {/* Top Section - Title and Price */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2 lg:gap-6 mb-3">
          <Link href={`/listings/${id}`} className="group/title flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className={cn(
                "text-[15px] lg:text-lg font-bold tracking-tight transition-colors line-clamp-1",
                isBlkListing 
                  ? "text-white group-hover/title:text-zinc-300" 
                  : "text-foreground group-hover/title:text-primary"
              )}>
                {make} {model}
              </h3>
              <span className={cn(
                "text-sm font-semibold flex-shrink-0",
                isBlkListing ? "text-zinc-500" : "text-muted-foreground/70"
              )}>
                {year}
              </span>
            </div>
            {trim && (
              <p className={cn(
                "text-sm line-clamp-1",
                isBlkListing ? "text-zinc-500" : "text-muted-foreground/70"
              )}>
                {trim}
              </p>
            )}
          </Link>
          <p className={cn(
            "text-lg font-bold tracking-tight whitespace-nowrap",
            isBlkListing ? "text-white" : "text-foreground"
          )}>
            {formatPrice(price)}
          </p>
        </div>

        {/* Specs Row */}
        <div className={cn(
          "flex flex-wrap items-center gap-2 text-sm mb-2",
          isBlkListing ? "text-zinc-500" : "text-muted-foreground/70"
        )}>
          <span className="font-semibold">{formatMileage(mileage)} km</span>
          <span className="text-muted-foreground/30">•</span>
          <span className="font-semibold">{displaySpecs}</span>
          <span className="text-muted-foreground/30">•</span>
          <span className="font-semibold">{displayEmirate}</span>
        </div>

        {/* Bottom Section - Dealer and Actions */}
        <div className={cn(
          "flex items-center justify-between gap-4 pt-4 border-t mt-auto",
          isBlkListing ? "border-zinc-800/60" : "border-border/40"
        )}>
          {/* Left - Dealer */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Avatar - with ring for Black tier */}
            {isBlackTierPartner ? (
              <div className="flex-shrink-0 rounded-full ring-2 ring-black ring-offset-1 ring-offset-background">
                {isPartnerListing ? (
                  <BrandAvatar
                    logoUrl={partnerLogo}
                    brandName={displaySellerName}
                    size="xs"
                    className="w-8 h-8 lg:w-9 lg:h-9"
                  />
                ) : (
                  <UserAvatar
                    src={sellerAvatarUrl}
                    name={displaySellerName}
                    size="sm"
                    className="w-8 h-8 lg:w-9 lg:h-9"
                  />
                )}
              </div>
            ) : isPartnerListing ? (
              <BrandAvatar
                logoUrl={partnerLogo}
                brandName={displaySellerName}
                size="xs"
                className="w-8 h-8 lg:w-9 lg:h-9 flex-shrink-0"
              />
            ) : (
              <UserAvatar
                src={sellerAvatarUrl}
                name={displaySellerName}
                size="sm"
                className="w-8 h-8 lg:w-9 lg:h-9 flex-shrink-0"
              />
            )}
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={cn(
                "text-sm font-semibold truncate",
                isBlkListing ? "text-zinc-400" : "text-muted-foreground/70"
              )}>
                {displaySellerName}
              </span>
              {!isBlackTierPartner && (partnerVerified || kycVerified) && (
                <CheckCircle2 
                  className="w-4 h-4 flex-shrink-0 text-blue-500" 
                  aria-label="Verified" 
                />
              )}
              {isBlackTierPartner && (
                <span className="flex-shrink-0 px-1.5 h-4 inline-flex items-center text-[8px] font-black tracking-widest uppercase bg-black text-white">
                  BLK
                </span>
              )}
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button 
              className={cn(
                "rounded-full p-2 transition-colors",
                isBlkListing 
                  ? "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/50" 
                  : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/50"
              )}
              aria-label="Share"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleShare();
              }}
            >
              <Share2 className="h-4 w-4" />
            </button>
            
            {/* Favorite Button */}
            <button 
              className={cn(
                "relative rounded-full p-2 transition-all",
                favorite.isUpdating && "opacity-50",
                favorite.isFavorite
                  ? "text-rose-500" 
                  : isBlkListing 
                    ? "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/50" 
                    : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/50"
              )}
              aria-label={favorite.isFavorite ? "Remove favorite" : "Add to favorites"}
              aria-pressed={favorite.isFavorite}
              disabled={favorite.isUpdating}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleFavoriteClick();
              }}
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-transform",
                  heartScale && "scale-125"
                )}
                fill={favorite.isFavorite ? "currentColor" : "none"}
              />
            </button>
            
            {/* Superlike Button */}
            <button
              className={cn(
                "relative rounded-full p-2 transition-all",
                superlike.isUpdating && "opacity-50",
                superlike.isSuperliked
                  ? "text-amber-500" 
                  : isBlkListing 
                    ? "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/50" 
                    : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/50"
              )}
              aria-label={superlike.isSuperliked ? "Remove superlike" : "Superlike"}
              aria-pressed={superlike.isSuperliked}
              disabled={superlike.isUpdating}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleSuperlikeClick();
              }}
            >
              <Sparkles
                className="h-4 w-4"
                fill={superlike.isSuperliked ? "currentColor" : "none"}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Superlike Confirmation Dialog */}
      <SuperlikeConfirmationDialog
        isOpen={showSuperlikeConfirm}
        onClose={() => setShowSuperlikeConfirm(false)}
        onConfirm={confirmSuperlike}
        quota={superlike.quota}
        listingTitle={carTitle}
      />

      {/* Superlike Limit Dialog */}
      <SuperlikeLimitDialog
        isOpen={showSuperlikeLimit}
        onClose={() => setShowSuperlikeLimit(false)}
        resetDate={superlike.quota?.periodEndDate}
      />

      {/* Falling Sparkles Effect */}
      {showSparkles && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-[9999]">
          {Array.from({ length: 30 }, (_, i) => {
            const left = (i * 3.33) + Math.random() * 2;
            const delay = (i % 5) * 0.1;
            const duration = 1.5 + (i % 3) * 0.3;
            const size = 16 + (i % 4) * 4;
            
            return (
              <span
                key={i}
                className="absolute animate-sparkle-fall"
                style={{
                  left: `${left}%`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                  fontSize: `${size}px`,
                }}
              >
                {i % 3 === 0 ? '⭐' : i % 3 === 1 ? '✨' : '💫'}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SKELETON
// ============================================================================

interface CarListItemSkeletonProps {
  className?: string;
}

function CarListItemSkeletonComponent({ className }: CarListItemSkeletonProps) {
  return (
    <div className={cn(
      "overflow-hidden rounded-xl flex flex-col lg:flex-row w-full",
      "bg-sidebar border border-border/40",
      className
    )}>
      {/* Image Section */}
      <div className="p-3 w-full lg:w-80 flex-shrink-0">
        <Skeleton className="aspect-[4/3] w-full rounded-lg" />
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col px-4 lg:px-6 py-4 lg:py-5 min-w-0">
        {/* Top Section - Title and Price */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2 lg:gap-6 mb-3">
          <div className="flex-1 min-w-0 space-y-1">
            {/* Title with year */}
            <div className="flex items-baseline gap-2">
              <Skeleton className="h-[15px] lg:h-[18px] w-32" />
              <Skeleton className="h-3.5 w-10" />
            </div>
            {/* Trim */}
            <Skeleton className="h-3.5 w-24" />
          </div>
          {/* Price */}
          <Skeleton className="h-[18px] w-28 flex-shrink-0" />
        </div>

        {/* Specs Row - mileage · specs · emirate */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-3.5 w-10" />
          <Skeleton className="h-3.5 w-14" />
        </div>

        {/* Bottom Section - Seller and Actions */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-border/40 mt-auto">
          {/* Left - Seller */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <Skeleton className="w-8 h-8 lg:w-9 lg:h-9 rounded-full flex-shrink-0" />
            <Skeleton className="h-3.5 w-28" />
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

CarListItem.Skeleton = CarListItemSkeletonComponent;
