/**
 * Car Card Component - Revvup Design System
 * Following "Less is More" principle with minimalist aesthetic
 * Responsive: Mobile-first with desktop enhancements is been taken care of
 */

'use client';

import Link from 'next/link';
import { Share2, Heart, CheckCircle2, Zap } from 'lucide-react';
import { useFavorite, useSuperlike } from '@/hooks/engagement';
import { useUser } from '@/hooks/auth/use-auth';
import { shareListing } from '@/lib/listing-share';
import { cn } from '@/utils';
import { getAppThumbUrl } from '@/utils/storage';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useCallback, useEffect, useRef } from 'react';
import { SuperlikeConfirmationDialog } from '@/components/engagement/favorites/superlike-confirmation-dialog';
import { SuperlikeLimitDialog } from '@/components/engagement/favorites/superlike-limit-dialog';
import { AuthRequiredModal } from '@/components/auth/auth-required-modal';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { BrandAvatar } from '@/components/partner/car-dealer/ui/brand-avatar';

// ============================================================================
// FORMAT UTILITIES (Module-level to avoid recreation on every render)
// ============================================================================

const priceFormatter = new Intl.NumberFormat('en-AE', {
  style: 'currency',
  currency: 'AED',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function formatPrice(amount: number): string {
  return priceFormatter.format(amount);
}

function formatMileage(km: number): string {
  if (km >= 1000) {
    return `${(km / 1000).toFixed(0)}k`;
  }
  return km.toString();
}

const EMIRATE_MAP: Record<string, string> = {
  'dubai': 'Dubai',
  'abu_dhabi': 'Abu Dhabi',
  'sharjah': 'Sharjah',
  'ajman': 'Ajman',
  'ras_al_khaimah': 'Ras Al Khaimah',
  'fujairah': 'Fujairah',
  'umm_al_quwain': 'Umm Al Quwain',
};

function formatEmirate(emirate: string): string {
  return EMIRATE_MAP[emirate.toLowerCase()] || emirate;
}

const SPECS_MAP: Record<string, string> = {
  'gcc': 'GCC',
  'us': 'US',
  'european': 'European',
  'japanese': 'Japanese',
  'canadian': 'Canadian',
  'american': 'American',
};

function formatSpecs(specs: string): string {
  return SPECS_MAP[specs.toLowerCase()] || specs;
}

// ============================================================================
// COMPONENT
// ============================================================================

interface CarCardProps {
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
  viewCount?: number; // Reserved for future use
  qiScore?: number | null;
  isBlkListing?: boolean; // Black listing flag
  // Partner/Dealer info
  partnerName?: string;
  partnerLogo?: string | null;
  partnerVerified?: boolean;
  isBlackTierPartner?: boolean; // Partner is black tier member
  sellerName?: string | null;
  sellerAvatarUrl?: string | null;
  kycVerified?: boolean; // User/Seller KYC verification status
  className?: string;
  priority?: boolean; // LCP optimization
}

export function CarCard({
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
  qiScore: _qiScore, // Reserved for future use
  isBlkListing,
  partnerName,
  partnerLogo,
  partnerVerified,
  isBlackTierPartner,
  sellerName,
  sellerAvatarUrl,
  kycVerified,
  className,
  priority = false, // LCP optimization for first card
}: CarCardProps) {
  // Derived display values
  // Use thumb URL for grid cards (480w, ~30-90KB) - bandwidth optimization
  const displayImage = getAppThumbUrl(thumbnail || images?.[0]);
  const displaySpecs = formatSpecs(specs || 'GCC');
  const displayEmirate = formatEmirate(emirate);
  const displaySellerName = partnerName || sellerName || 'Private Seller';
  const isPartnerListing = Boolean(partnerLogo || partnerName);
  const carTitle = `${year} ${make} ${model}${trim ? ` ${trim}` : ''}`;
  
  // Hydration-safe: track if client has mounted
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  
  const { isSignedIn } = useUser();
  
  // Separate hooks for favorites and superlikes - completely independent
  const favorite = useFavorite(id);
  const superlike = useSuperlike(id);

  const [showSuperlikeConfirmRaw, setShowSuperlikeConfirm] = useState(false);
  const [showSuperlikeLimitRaw, setShowSuperlikeLimit] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showHearts, setShowHearts] = useState(false);
  const [heartScale, setHeartScale] = useState(false);

  // Timer refs for cleanup
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  // Cleanup timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  const handleShare = useCallback(async () => {
    await shareListing({
      listingId: id,
      year,
      make,
      model,
      trim,
      price,
      mileage,
      emirate,
      specs,
    });
  }, [id, year, make, model, trim, price, mileage, emirate, specs]);

  // Derive dialog visibility - close dialogs when auth is required
  const authDialogOpen = favorite.authRequired || superlike.authRequired;
  const showSuperlikeConfirm = showSuperlikeConfirmRaw && !authDialogOpen;
  const showSuperlikeLimit = showSuperlikeLimitRaw && !authDialogOpen;

  const handleSuperlikeClick = useCallback(() => {
    // Check if user is authenticated first - show auth modal without API call
    if (!isSignedIn) {
      superlike.requireAuth();
      return;
    }

    // If already superliked, remove it without confirmation
    if (superlike.isSuperliked) {
      superlike.toggle();
      return;
    }

    // If quota isn't loaded yet, try anyway (API will validate)
    if (!superlike.quota) {
      setShowSuperlikeConfirm(true);
      return;
    }

    // Check if user has superlikes remaining
    if (superlike.quota.remaining <= 0) {
      setShowSuperlikeLimit(true);
      return;
    }

    // Show confirmation dialog
    setShowSuperlikeConfirm(true);
  }, [isSignedIn, superlike]);

  const confirmSuperlike = useCallback(() => {
    // Show ripple effect
    setShowSparkles(true);
    
    // Trigger the toggle after a brief delay
    const timer1 = setTimeout(() => {
      superlike.toggle();
    }, 100);
    timersRef.current.push(timer1);
    
    // Hide ripple after animation
    const timer2 = setTimeout(() => {
      setShowSparkles(false);
    }, 400);
    timersRef.current.push(timer2);
  }, [superlike]);

  const handleFavoriteClick = useCallback(() => {
    // Check if user is authenticated first - show auth modal without API call
    if (!isSignedIn) {
      favorite.requireAuth();
      return;
    }

    // Show ripple effect if adding to favorites (not removing)
    if (!favorite.isFavorite) {
      setShowHearts(true);
      const timer1 = setTimeout(() => {
        setShowHearts(false);
      }, 400);
      timersRef.current.push(timer1);
    }

    // Trigger heart scale animation
    setHeartScale(true);
    favorite.toggle();
    
    // Reset animation after it completes
    const timer2 = setTimeout(() => {
      setHeartScale(false);
    }, 400);
    timersRef.current.push(timer2);
  }, [isSignedIn, favorite]);

  return (
    <div className={cn(
      "group relative flex flex-col overflow-hidden rounded-[20px] transition-all duration-300 w-full",
      isBlkListing 
        ? "bg-background dark:bg-card border border-border hover:border-border/80 hover:shadow-2xl hover:shadow-black/20" 
        : "bg-sidebar border border-sidebar-border hover:border-sidebar-border/80 hover:shadow-md",
      className
    )}>
      {/* Subtle top accent for BLK listings */}
      {isBlkListing && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      )}

      {/* Image Section */}
      <Link href={`/listings/${id}`} prefetch={false} className={cn(
        "block mx-1 mt-1"
      )}>
        <div className={cn(
          "relative w-full aspect-[16/9] overflow-hidden rounded-[20px]",
          isBlkListing ? "bg-zinc-900" : "bg-muted/20"
        )}>
          {displayImage ? (
            <img
              src={displayImage}
              alt={`${year} ${make} ${model}`}
              className="absolute inset-0 h-full w-full object-cover"
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'auto'}
              decoding="auto"
            />
          ) : (
            <div className="absolute inset-0 bg-muted/30" />
          )}
        </div>
        
      </Link>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-3 sm:p-4 gap-2 sm:gap-1.5">
        {/* Title with Year */}
        <Link href={`/listings/${id}`} prefetch={false} className="group/title">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className={cn(
              "text-headline sm:text-subhead font-bold tracking-tight line-clamp-1 transition-colors flex-1 min-w-0 leading-tight",
              isBlkListing 
                ? "text-zinc-900 dark:text-white group-hover/title:text-zinc-600 dark:group-hover/title:text-zinc-300" 
                : "text-foreground group-hover/title:text-primary"
            )}>
              {make} {model}
            </h3>
            <span className={cn(
              "text-subhead sm:text-caption1 font-semibold tabular-nums flex-shrink-0",
              isBlkListing ? "text-zinc-500 dark:text-zinc-500" : "text-muted-foreground/80"
            )}>
              {year}
            </span>
          </div>
        </Link>

        {/* Price */}
        <p className={cn(
          "text-title3 sm:text-headline font-black tracking-tight leading-none",
          isBlkListing ? "text-zinc-900 dark:text-white" : "text-primary dark:text-primary"
        )}>
          {formatPrice(price)}
        </p>

        {/* Mobile: Stats Row */}
        <div className={cn(
          "flex items-center gap-2 text-subhead min-w-0 overflow-hidden sm:hidden",
          isBlkListing ? "text-zinc-500 dark:text-zinc-400" : "text-muted-foreground"
        )}>
          <span className="font-medium tabular-nums whitespace-nowrap">{formatMileage(mileage)} km</span>
          <span className="font-medium whitespace-nowrap">{displaySpecs}</span>
          <span className="font-medium truncate">{displayEmirate}</span>
        </div>

        {/* Mobile: Footer - Seller + Actions */}
        <div className={cn(
          "flex items-center justify-between pt-3 mt-1 sm:hidden border-t",
          isBlkListing ? "border-zinc-100 dark:border-zinc-800" : "border-border/40"
        )}>
          {/* Seller Info */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {isBlackTierPartner ? (
              <div className="flex-shrink-0 rounded-full ring-2 ring-black ring-offset-1 ring-offset-background">
                {isPartnerListing ? (
                  <BrandAvatar
                    logoUrl={partnerLogo}
                    brandName={displaySellerName}
                    size="xs"
                    className={cn(
                      "w-6 h-6",
                      isBlkListing ? "bg-zinc-800 border-zinc-700" : "bg-muted/40 border-border/40"
                    )}
                  />
                ) : (
                  <UserAvatar
                    src={sellerAvatarUrl}
                    name={displaySellerName}
                    size="sm"
                    className={cn(
                      "w-6 h-6",
                      isBlkListing ? "bg-zinc-800 border-zinc-700 text-zinc-500" : "bg-muted/40 border-border/40 text-muted-foreground/70"
                    )}
                  />
                )}
              </div>
            ) : isPartnerListing ? (
              <BrandAvatar
                logoUrl={partnerLogo}
                brandName={displaySellerName}
                size="xs"
                className={cn(
                  "w-6 h-6 flex-shrink-0",
                  isBlkListing ? "bg-zinc-800 border-zinc-700" : "bg-muted/40 border-border/40"
                )}
              />
            ) : (
              <UserAvatar
                src={sellerAvatarUrl}
                name={displaySellerName}
                size="sm"
                className={cn(
                  "w-6 h-6 flex-shrink-0",
                  isBlkListing ? "bg-zinc-800 border-zinc-700 text-zinc-500" : "bg-muted/40 border-border/40 text-muted-foreground/70"
                )}
              />
            )}
            <span className={cn(
              "text-subhead sm:text-caption2 font-semibold truncate",
              isBlkListing ? "text-zinc-600 dark:text-zinc-300" : "text-foreground"
            )}>
              {displaySellerName}
            </span>
            {!isBlackTierPartner && (partnerVerified || kycVerified) && (
              <CheckCircle2 
                className="w-3.5 h-3.5 flex-shrink-0 text-primary" 
                aria-label="Verified" 
              />
            )}
            {isBlackTierPartner && (
              <span className="flex-shrink-0 px-1.5 h-4 inline-flex items-center text-[8px] font-black tracking-widest uppercase bg-black text-white">
                BLK
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button 
              className={cn(
                "rounded-full p-1.5 transition-colors touch-manipulation",
                isBlkListing 
                  ? "text-zinc-400 dark:text-zinc-400 active:bg-zinc-200 dark:active:bg-zinc-800 active:text-zinc-600 dark:active:text-zinc-200" 
                  : "text-muted-foreground active:bg-muted active:text-foreground"
              )}
              aria-label="Share"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleShare();
              }}
            >
              <Share2 className="h-[18px] w-[18px]" />
            </button>
            
            <button 
              className={cn(
                "relative rounded-full p-1.5 transition-all active:scale-95 touch-manipulation",
                favorite.isUpdating && "opacity-50",
                mounted && favorite.isFavorite
                  ? "text-favorite active:bg-favorite/10"
                  : isBlkListing 
                    ? "text-zinc-400 dark:text-zinc-400 active:bg-zinc-200 dark:active:bg-zinc-800 active:text-zinc-600 dark:active:text-zinc-200" 
                    : "text-muted-foreground active:bg-muted active:text-foreground"
              )}
              aria-label={(mounted && favorite.isFavorite) ? "Remove favorite" : "Add to favorites"}
              disabled={favorite.isUpdating}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleFavoriteClick();
              }}
            >
              {showHearts && (
                <span className="absolute inset-0 rounded-full bg-favorite/20 animate-ripple" />
              )}
              <Heart
                className={cn(
                  "h-[18px] w-[18px] transition-transform duration-200",
                  heartScale && "scale-125"
                )}
                strokeWidth={(mounted && favorite.isFavorite) ? 2.5 : 1.5}
                fill={(mounted && favorite.isFavorite) ? "currentColor" : "none"}
              />
            </button>
            
            <button
              className={cn(
                "relative rounded-full p-1.5 transition-all active:scale-95 touch-manipulation",
                superlike.isUpdating && "opacity-50",
                mounted && superlike.isSuperliked
                  ? "text-warning active:bg-warning-muted"
                  : isBlkListing 
                    ? "text-zinc-400 dark:text-zinc-400 active:bg-zinc-200 dark:active:bg-zinc-800 active:text-zinc-600 dark:active:text-zinc-200" 
                    : "text-muted-foreground active:bg-muted active:text-foreground"
              )}
              aria-label={(mounted && superlike.isSuperliked) ? "Remove superlike" : "Superlike"}
              disabled={superlike.isUpdating}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleSuperlikeClick();
              }}
            >
              {showSparkles && (
                <span className="absolute inset-0 rounded-full bg-warning/20 animate-ripple" />
              )}
              <Zap
                className={cn(
                  "h-[18px] w-[18px] transition-transform duration-200",
                  showSparkles && "scale-125"
                )}
                strokeWidth={(mounted && superlike.isSuperliked) ? 2.5 : 1.5}
                fill={(mounted && superlike.isSuperliked) ? "currentColor" : "none"}
              />
            </button>
          </div>
        </div>

        {/* Desktop: Stats Row */}
        <div className="hidden sm:flex items-center gap-1.5 text-subhead">
          <span className={cn(
            "font-semibold tabular-nums",
            isBlkListing ? "text-zinc-400 dark:text-zinc-500" : "text-muted-foreground/70"
          )}>
            {formatMileage(mileage)} km
          </span>
          <span className={cn("opacity-30", isBlkListing ? "text-zinc-400 dark:text-zinc-600" : "")}>·</span>
          <span className={cn(
            "font-semibold",
            isBlkListing ? "text-zinc-400 dark:text-zinc-500" : "text-muted-foreground/70"
          )}>
            {displaySpecs}
          </span>
          <span className={cn("opacity-30", isBlkListing ? "text-zinc-400 dark:text-zinc-600" : "")}>·</span>
          <span className={cn(
            "font-semibold truncate",
            isBlkListing ? "text-zinc-400 dark:text-zinc-500" : "text-muted-foreground/70"
          )}>
            {displayEmirate}
          </span>
        </div>

        {/* Desktop: Bottom Section with dealer + actions */}
        <div className="hidden sm:flex items-center justify-between pt-3 mt-auto">
          {/* Left - Dealer */}
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Avatar - with ring for Black tier */}
            {isBlackTierPartner ? (
              <div className="flex-shrink-0 rounded-full ring-2 ring-black ring-offset-1 ring-offset-background">
                {isPartnerListing ? (
                  <BrandAvatar
                    logoUrl={partnerLogo}
                    brandName={displaySellerName}
                    size="xs"
                    className={cn(
                      "w-7 h-7",
                      isBlkListing ? "bg-zinc-800 border-zinc-700" : "bg-muted/40 border-border/40"
                    )}
                  />
                ) : (
                  <UserAvatar
                    src={sellerAvatarUrl}
                    name={displaySellerName}
                    size="sm"
                    className={cn(
                      "w-7 h-7",
                      isBlkListing ? "bg-zinc-800 border-zinc-700 text-zinc-500" : "bg-muted/40 border-border/40 text-muted-foreground/70"
                    )}
                  />
                )}
              </div>
            ) : isPartnerListing ? (
              <BrandAvatar
                logoUrl={partnerLogo}
                brandName={displaySellerName}
                size="xs"
                className={cn(
                  "w-7 h-7 flex-shrink-0",
                  isBlkListing ? "bg-zinc-800 border-zinc-700" : "bg-muted/40 border-border/40"
                )}
              />
            ) : (
              <UserAvatar
                src={sellerAvatarUrl}
                name={displaySellerName}
                size="sm"
                className={cn(
                  "w-7 h-7 flex-shrink-0",
                  isBlkListing ? "bg-zinc-800 border-zinc-700 text-zinc-500" : "bg-muted/40 border-border/40 text-muted-foreground/70"
                )}
              />
            )}
            <span className={cn(
              "text-footnote",
              isBlkListing ? "text-zinc-700 dark:text-zinc-200" : "text-foreground"
            )}>
              {displaySellerName}
            </span>
            {!isBlackTierPartner && (partnerVerified || kycVerified) && (
              <CheckCircle2 
                className="w-[18px] h-[18px] flex-shrink-0 text-primary" 
                aria-label="Verified" 
              />
            )}
            {isBlackTierPartner && (
              <span className="flex-shrink-0 px-1.5 h-4 inline-flex items-center text-[8px] font-black tracking-widest uppercase bg-black text-white">
                BLK
              </span>
            )}
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-1 -mr-1.5 flex-shrink-0 ml-auto">
            <button 
              className={cn(
                "rounded-full p-1.5 transition-colors touch-manipulation",
                isBlkListing 
                  ? "text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 active:bg-zinc-200 dark:active:bg-zinc-700/50" 
                  : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/50 active:bg-muted/70"
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
                "relative rounded-full p-1.5 transition-all active:scale-95 touch-manipulation",
                favorite.isUpdating && "opacity-50 cursor-not-allowed",
                mounted && favorite.isFavorite
                  ? isBlkListing 
                    ? "text-favorite dark:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50" 
                    : "text-favorite hover:bg-muted/50"
                  : isBlkListing 
                    ? "text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 active:bg-zinc-200 dark:active:bg-zinc-700/50" 
                    : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/50 active:bg-muted/70"
              )}
              aria-label={(mounted && favorite.isFavorite) ? "Remove favorite" : "Add to favorites"}
              aria-pressed={mounted && favorite.isFavorite}
              disabled={favorite.isUpdating}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleFavoriteClick();
              }}
            >
              {showHearts && (
                <span className="absolute inset-0 rounded-full bg-favorite/20 animate-ripple" />
              )}
              <Heart
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  heartScale && "scale-[1.3]"
                )}
                strokeWidth={(mounted && favorite.isFavorite) ? 2.5 : 1.5}
                fill={(mounted && favorite.isFavorite) ? "currentColor" : "none"}
              />
            </button>
            
            {/* Superlike Button */}
            <button
              className={cn(
                "relative rounded-full p-1.5 transition-all active:scale-95 touch-manipulation",
                superlike.isUpdating && "opacity-50 cursor-not-allowed",
                mounted && superlike.isSuperliked
                  ? isBlkListing 
                    ? "text-warning hover:bg-zinc-100 dark:hover:bg-zinc-800/50" 
                    : "text-warning hover:bg-muted/50"
                  : isBlkListing 
                    ? "text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 active:bg-zinc-200 dark:active:bg-zinc-700/50" 
                    : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/50 active:bg-muted/70"
              )}
              aria-label={(mounted && superlike.isSuperliked) ? "Remove superlike" : "Superlike"}
              aria-pressed={mounted && superlike.isSuperliked}
              disabled={superlike.isUpdating}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleSuperlikeClick();
              }}
            >
              {showSparkles && (
                <span className="absolute inset-0 rounded-full bg-warning/20 animate-ripple" />
              )}
              <Zap
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  showSparkles && "scale-[1.3]"
                )}
                strokeWidth={(mounted && superlike.isSuperliked) ? 2.5 : 1.5}
                fill={(mounted && superlike.isSuperliked) ? "currentColor" : "none"}
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

      {/* Auth Required Modals - Separate for each feature */}
      <AuthRequiredModal
        open={favorite.authRequired}
        onClose={favorite.dismissAuth}
        feature="save favorites"
      />
      
      <AuthRequiredModal
        open={superlike.authRequired}
        onClose={superlike.dismissAuth}
        feature="superlike listings"
      />

    </div>
  );
}

// ============================================================================
// SKELETON
// ============================================================================

interface CarCardSkeletonProps {
  className?: string;
}

function CarCardSkeletonComponent({ className }: CarCardSkeletonProps) {
  return (
    <div className={cn(
      "flex flex-col overflow-hidden rounded-[20px] w-full",
      "bg-sidebar border border-sidebar-border",
      className
    )}>
      {/* Image Section - matches CarCard aspect ratios */}
      <div className="mx-1 mt-1">
        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-[20px]">
          <Skeleton className="absolute inset-0" />
        </div>
      </div>
      
      {/* Content Section */}
      <div className="flex flex-1 flex-col p-3 sm:p-4 gap-2 sm:gap-1">
        {/* Title + Year row */}
        <div className="flex items-baseline justify-between gap-2">
          <Skeleton className="h-5 sm:h-[15px] w-2/3" />
          <Skeleton className="h-4 sm:h-3 w-8 flex-shrink-0" />
        </div>

        {/* Price */}
        <Skeleton className="h-6 sm:h-[18px] w-24 sm:w-28" />

        {/* Mobile: Stats Row */}
        <div className="flex items-center gap-2 sm:hidden">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>

        {/* Mobile: Footer - Seller + Actions */}
        <div className="flex items-center justify-between pt-3 mt-1 border-t border-border/40 sm:hidden">
          <div className="flex items-center gap-2 min-w-0">
            <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex items-center gap-0.5">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-7 w-7 rounded-full" />
          </div>
        </div>

        {/* Desktop: Stats Row */}
        <div className="hidden sm:flex items-center gap-1.5">
          <Skeleton className="h-3.5 w-14" />
          <Skeleton className="h-3.5 w-8" />
          <Skeleton className="h-3.5 w-12" />
        </div>

        {/* Desktop: Bottom Section */}
        <div className="hidden sm:flex items-center justify-between pt-3 mt-auto">
          <div className="flex items-center gap-2.5 min-w-0">
            <Skeleton className="w-7 h-7 rounded-full flex-shrink-0" />
            <Skeleton className="h-[13px] w-24" />
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

CarCard.Skeleton = CarCardSkeletonComponent;
