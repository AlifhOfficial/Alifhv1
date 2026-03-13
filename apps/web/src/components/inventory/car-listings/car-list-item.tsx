/**
 * Car List Item Component - Revvup Design System
 * List view variant following "Less is More" principle
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Share2, Heart, Zap, CheckCircle2 } from 'lucide-react';
import { useFavorite, useSuperlike } from '@/hooks/engagement';
import { cn } from '@/lib/utils';
import { getCdnThumbUrl } from '@/utils/storage';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect, useRef, useCallback } from 'react';
import { SuperlikeConfirmationDialog } from '@/components/engagement/favorites/superlike-confirmation-dialog';
import { SuperlikeLimitDialog } from '@/components/engagement/favorites/superlike-limit-dialog';
import { AuthRequiredModal } from '@/components/auth/auth-required-modal';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { BrandAvatar } from '@/components/partner/car-dealer/ui/brand-avatar';
import { useUser } from '@/hooks/auth/use-auth';

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

  // Use thumb URL for list items (480w, ~30-90KB) - bandwidth optimization
  const displayImage = getCdnThumbUrl(thumbnail || images?.[0]);
  const displaySpecs = formatSpecs(specs || 'GCC');
  const displayEmirate = formatEmirate(emirate);
  const displaySellerName = partnerName || sellerName || 'Private Seller';
  const isPartnerListing = Boolean(partnerLogo || partnerName);
  
  const { isSignedIn } = useUser();
  
  // Separate hooks for favorites and superlikes
  const favorite = useFavorite(id);
  const superlike = useSuperlike(id);

  const [showSuperlikeConfirmRaw, setShowSuperlikeConfirm] = useState(false);
  const [showSuperlikeLimitRaw, setShowSuperlikeLimit] = useState(false);
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

  // Derive dialog visibility - close dialogs when auth is required
  const authDialogOpen = favorite.authRequired || superlike.authRequired;
  const showSuperlikeConfirm = showSuperlikeConfirmRaw && !authDialogOpen;
  const showSuperlikeLimit = showSuperlikeLimitRaw && !authDialogOpen;

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
    setShowSparkles(true);
    const timer1 = setTimeout(() => superlike.toggle(), 100);
    const timer2 = setTimeout(() => setShowSparkles(false), 2000);
    timersRef.current.push(timer1, timer2);
  }, [superlike]);

  const handleFavoriteClick = useCallback(() => {
    // Check if user is authenticated first - show auth modal without API call
    if (!isSignedIn) {
      favorite.requireAuth();
      return;
    }

    // Trigger heart scale animation
    setHeartScale(true);
    favorite.toggle();
    const timer = setTimeout(() => setHeartScale(false), 400);
    timersRef.current.push(timer);
  }, [isSignedIn, favorite]);

  const carTitle = `${year} ${make} ${model}${trim ? ` ${trim}` : ''}`;

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-lg transition-all duration-300 flex flex-col lg:flex-row w-full",
      isBlkListing 
        ? "bg-white dark:bg-[#0D0D0D] border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-2xl hover:shadow-zinc-900/50" 
        : "bg-sidebar border border-sidebar-border hover:border-sidebar-border/80 hover:shadow-md",
      className
    )}>
      {/* Subtle top accent for BLK listings */}
      {isBlkListing && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent" />
      )}

      {/* Image Section */}
      <div className="p-3 w-full lg:w-72 flex-shrink-0">
        <Link href={`/listings/${id}`} className={cn(
          "relative aspect-[4/3] w-full overflow-hidden rounded-lg block",
          isBlkListing ? "bg-zinc-900" : "bg-muted/20"
        )}>
          {displayImage ? (
            <Image
              src={displayImage}
              alt={`${year} ${make} ${model}`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 288px"
            />
          ) : (
            <div className="absolute inset-0 bg-muted/30" />
          )}
        </Link>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col px-3 lg:px-4 py-3 lg:py-4 min-w-0 min-h-0">
        {/* Top Section - Title and Price */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-1.5 lg:gap-4 mb-2">
          <Link href={`/listings/${id}`} className="group/title flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <h3 className={cn(
                "text-[15px] font-bold tracking-tight transition-colors line-clamp-1",
                isBlkListing 
                  ? "text-zinc-900 dark:text-white group-hover/title:text-zinc-600 dark:group-hover/title:text-zinc-300" 
                  : "text-foreground group-hover/title:text-primary"
              )}>
                {make} {model}
              </h3>
              <span className={cn(
                "text-xs font-semibold tabular-nums flex-shrink-0",
                isBlkListing ? "text-zinc-400 dark:text-zinc-500" : "text-muted-foreground/70"
              )}>
                {year}
              </span>
            </div>
            {trim && (
              <p className={cn(
                "text-xs line-clamp-1 mt-0.5",
                isBlkListing ? "text-zinc-400 dark:text-zinc-500" : "text-muted-foreground/70"
              )}>
                {trim}
              </p>
            )}
          </Link>
          <p className={cn(
            "text-lg font-bold tracking-tight whitespace-nowrap",
            isBlkListing ? "text-zinc-900 dark:text-white" : "text-blue-600"
          )}>
            {formatPrice(price)}
          </p>
        </div>

        {/* Specs Row */}
        <div className="flex items-center gap-1.5 text-sm">
          <span className={cn(
            "font-semibold",
            isBlkListing ? "text-zinc-400 dark:text-zinc-500" : "text-muted-foreground/70"
          )}>
            {formatMileage(mileage)} km
          </span>
          <span className={isBlkListing ? "text-zinc-300 dark:text-zinc-700" : "text-muted-foreground/30"}>·</span>
          <span className={cn(
            "font-semibold",
            isBlkListing ? "text-zinc-400 dark:text-zinc-500" : "text-muted-foreground/70"
          )}>
            {displaySpecs}
          </span>
          <span className={isBlkListing ? "text-zinc-300 dark:text-zinc-700" : "text-muted-foreground/30"}>·</span>
          <span className={cn(
            "font-semibold truncate",
            isBlkListing ? "text-zinc-400 dark:text-zinc-500" : "text-muted-foreground/70"
          )}>
            {displayEmirate}
          </span>
        </div>

        {/* Bottom Section - Dealer and Actions */}
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
              isBlkListing ? "text-zinc-700 dark:text-zinc-200" : "text-foreground"
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
          <div className="flex items-center -mr-1.5 flex-shrink-0">
            <button 
              className={cn(
                "rounded-full p-1.5 transition-colors",
                isBlkListing 
                  ? "text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50" 
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
                "relative rounded-full p-1.5 transition-all active:scale-95",
                favorite.isUpdating && "opacity-50 cursor-not-allowed",
                favorite.isFavorite
                  ? isBlkListing 
                    ? "text-rose-500 dark:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50" 
                    : "text-rose-500 hover:bg-muted/50"
                  : isBlkListing 
                    ? "text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50" 
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
                "relative rounded-full p-1.5 transition-all active:scale-95",
                superlike.isUpdating && "opacity-50 cursor-not-allowed",
                superlike.isSuperliked
                  ? isBlkListing 
                    ? "text-yellow-500 dark:text-yellow-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50" 
                    : "text-yellow-500 hover:bg-muted/50"
                  : isBlkListing 
                    ? "text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50" 
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
              <Zap
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

interface CarListItemSkeletonProps {
  className?: string;
}

function CarListItemSkeletonComponent({ className }: CarListItemSkeletonProps) {
  return (
    <div className={cn(
      "overflow-hidden rounded-lg flex flex-col lg:flex-row w-full",
      "bg-sidebar border border-sidebar-border",
      className
    )}>
      {/* Image Section */}
      <div className="p-3 w-full lg:w-72 flex-shrink-0">
        <Skeleton className="aspect-[4/3] w-full rounded-lg" />
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col px-3 lg:px-4 py-3 lg:py-4 min-w-0">
        {/* Top Section - Title and Price */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-1.5 lg:gap-4 mb-2">
          <div className="flex-1 min-w-0 space-y-1">
            {/* Title with year */}
            <div className="flex items-baseline gap-2">
              <Skeleton className="h-[15px] w-32" />
              <Skeleton className="h-3 w-8" />
            </div>
            {/* Trim */}
            <Skeleton className="h-3 w-24" />
          </div>
          {/* Price */}
          <Skeleton className="h-[18px] w-28 flex-shrink-0" />
        </div>

        {/* Specs Row - mileage · specs · emirate */}
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-3.5 w-14" />
          <Skeleton className="h-3.5 w-8" />
          <Skeleton className="h-3.5 w-12" />
        </div>

        {/* Bottom Section - Seller and Actions */}
        <div className="flex items-center justify-between pt-3 mt-auto">
          {/* Left - Seller */}
          <div className="flex items-center gap-2.5 min-w-0">
            <Skeleton className="w-7 h-7 rounded-full flex-shrink-0" />
            <Skeleton className="h-[13px] w-24" />
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
