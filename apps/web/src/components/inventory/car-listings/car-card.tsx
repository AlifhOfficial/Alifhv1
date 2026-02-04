/**
 * Car Card Component - Revvup Design System
 * Following "Less is More" principle with minimalist aesthetic
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Share2, Heart, CheckCircle2, Sparkles } from 'lucide-react';
import { useFavorite, useSuperlike } from '@/hooks/engagement';
import { useUser } from '@/hooks/auth/use-auth';
import { cn } from '@/utils';
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
  const displayImage = thumbnail || images?.[0] || '/assets/cars/car1.avif';
  const displaySpecs = formatSpecs(specs || 'GCC');
  const displayEmirate = formatEmirate(emirate);
  const displaySellerName = partnerName || sellerName || 'Private Seller';
  const isPartnerListing = Boolean(partnerLogo || partnerName);
  const carTitle = `${year} ${make} ${model}${trim ? ` ${trim}` : ''}`;
  
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
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/listings/${id}`;
    const title = carTitle;
    
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled or share failed silently
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  }, [id, carTitle]);

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
      "group relative flex flex-col overflow-hidden rounded-lg transition-all duration-300 w-full",
      isBlkListing 
        ? "bg-black border border-zinc-800 hover:border-zinc-700 hover:shadow-2xl hover:shadow-zinc-900/50" 
        : "bg-sidebar border border-sidebar-border hover:border-sidebar-border/80 hover:shadow-md",
      className
    )}>
      {/* Subtle top accent for BLK listings */}
      {isBlkListing && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
      )}

      {/* Image Section */}
      <Link href={`/listings/${id}`} className={cn(
        "relative aspect-[4/3] xs:aspect-[16/10] sm:aspect-[3/2] lg:aspect-[16/10] w-full overflow-hidden block",
        isBlkListing ? "bg-zinc-900" : "bg-muted/20"
      )}>
        <Image
          src={displayImage}
          alt={`${year} ${make} ${model}`}
          fill
          priority={priority}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
      </Link>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-3 sm:p-4 gap-1.5">
        {/* Title with Year */}
        <Link href={`/listings/${id}`} className="group/title">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className={cn(
              "text-[15px] font-bold tracking-tight line-clamp-1 transition-colors flex-1",
              isBlkListing 
                ? "text-white group-hover/title:text-zinc-300" 
                : "text-foreground group-hover/title:text-primary"
            )}>
              {make} {model}
            </h3>
            <span className={cn(
              "text-xs font-semibold tabular-nums flex-shrink-0",
              isBlkListing ? "text-zinc-500" : "text-muted-foreground/70"
            )}>
              {year}
            </span>
          </div>
        </Link>

        {/* Price */}
        <p className={cn(
          "text-lg font-bold tracking-tight",
          isBlkListing ? "text-white" : "text-blue-600"
        )}>
          {formatPrice(price)}
        </p>

        {/* Stats Row */}
        <div className="flex items-center gap-1.5 text-sm">
          <span className={cn(
            "font-semibold",
            isBlkListing ? "text-zinc-500" : "text-muted-foreground/70"
          )}>
            {formatMileage(mileage)} km
          </span>
          <span className={isBlkListing ? "text-zinc-700" : "text-muted-foreground/30"}>·</span>
          <span className={cn(
            "font-semibold",
            isBlkListing ? "text-zinc-500" : "text-muted-foreground/70"
          )}>
            {displaySpecs}
          </span>
          <span className={isBlkListing ? "text-zinc-700" : "text-muted-foreground/30"}>·</span>
          <span className={cn(
            "font-semibold truncate",
            isBlkListing ? "text-zinc-500" : "text-muted-foreground/70"
          )}>
            {displayEmirate}
          </span>
        </div>

        {/* Bottom Section */}
        <div className="flex items-center justify-between pt-3 mt-auto">
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
              "text-[13px] font-medium",
              isBlkListing ? "text-zinc-200" : "text-foreground"
            )}>
              {displaySellerName}
            </span>
            {!isBlackTierPartner && (partnerVerified || kycVerified) && (
              <CheckCircle2 
                className="w-[18px] h-[18px] flex-shrink-0 -ml-1 text-blue-500" 
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
          <div className="flex items-center -mr-2 sm:-mr-1.5 flex-shrink-0">
            <button 
              className={cn(
                "rounded-full p-2 sm:p-1.5 transition-colors touch-manipulation",
                isBlkListing 
                  ? "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/50 active:bg-zinc-700/50" 
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
                "relative rounded-full p-2 sm:p-1.5 transition-all active:scale-95 touch-manipulation",
                favorite.isUpdating && "opacity-50 cursor-not-allowed",
                favorite.isFavorite
                  ? isBlkListing 
                    ? "text-rose-400 hover:bg-zinc-800/50" 
                    : "text-rose-500 hover:bg-muted/50"
                  : isBlkListing 
                    ? "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/50 active:bg-zinc-700/50" 
                    : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/50 active:bg-muted/70"
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
              {/* Ripple effect */}
              {showHearts && (
                <span className="absolute inset-0 rounded-full bg-rose-500/20 animate-ripple" />
              )}
              <Heart
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  heartScale && "scale-[1.3]"
                )}
                strokeWidth={favorite.isFavorite ? 2.5 : 1.5}
                fill={favorite.isFavorite ? "currentColor" : "none"}
              />
            </button>
            
            {/* Superlike Button */}
            <button
              className={cn(
                "relative rounded-full p-2 sm:p-1.5 transition-all active:scale-95 touch-manipulation",
                superlike.isUpdating && "opacity-50 cursor-not-allowed",
                superlike.isSuperliked
                  ? isBlkListing 
                    ? "text-yellow-400 hover:bg-zinc-800/50" 
                    : "text-yellow-500 hover:bg-muted/50"
                  : isBlkListing 
                    ? "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/50 active:bg-zinc-700/50" 
                    : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/50 active:bg-muted/70"
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
              {/* Ripple effect */}
              {showSparkles && (
                <span className="absolute inset-0 rounded-full bg-yellow-500/20 animate-ripple" />
              )}
              <Sparkles
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  showSparkles && "scale-[1.3]"
                )}
                strokeWidth={superlike.isSuperliked ? 2.5 : 1.5}
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
      "flex flex-col overflow-hidden rounded-lg w-full",
      "bg-sidebar border border-sidebar-border",
      className
    )}>
      {/* Image Section - matches CarCard aspect ratios */}
      <Skeleton className="aspect-[4/3] xs:aspect-[16/10] sm:aspect-[3/2] lg:aspect-[16/10] w-full" />
      
      {/* Content Section */}
      <div className="flex flex-1 flex-col p-3 sm:p-4 gap-1.5">
        {/* Title + Year row */}
        <div className="flex items-baseline justify-between gap-3">
          <Skeleton className="h-[15px] w-2/3" />
          <Skeleton className="h-3 w-8 flex-shrink-0" />
        </div>

        {/* Price */}
        <Skeleton className="h-[18px] w-28" />

        {/* Stats Row - mileage · specs · emirate */}
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-3.5 w-14" />
          <Skeleton className="h-3.5 w-8" />
          <Skeleton className="h-3.5 w-12" />
        </div>

        {/* Bottom Section - Seller and Actions */}
        <div className="flex items-center justify-between pt-3 mt-auto">
          {/* Left - Seller avatar + name */}
          <div className="flex items-center gap-2.5 min-w-0">
            <Skeleton className="w-7 h-7 rounded-full flex-shrink-0" />
            <Skeleton className="h-[13px] w-24" />
          </div>

          {/* Right - Actions (share, favorite, superlike) */}
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

CarCard.Skeleton = CarCardSkeletonComponent;
