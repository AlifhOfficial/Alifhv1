/**
 * Car Card Mobile Component - Revvup Design System
 * Mobile-optimized vertical card variant
 * Compact but readable with full data points
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
// FORMAT UTILITIES
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
  'ras_al_khaimah': 'RAK',
  'fujairah': 'Fujairah',
  'umm_al_quwain': 'UAQ',
};

function formatEmirate(emirate: string): string {
  return EMIRATE_MAP[emirate.toLowerCase()] || emirate;
}

const SPECS_MAP: Record<string, string> = {
  'gcc': 'GCC',
  'us': 'US',
  'european': 'EU',
  'japanese': 'JP',
  'canadian': 'CA',
  'american': 'US',
};

function formatSpecs(specs: string): string {
  return SPECS_MAP[specs.toLowerCase()] || specs;
}

// ============================================================================
// COMPONENT
// ============================================================================

interface CarCardMobileProps {
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
  viewCount?: number;
  qiScore?: number | null;
  isBlkListing?: boolean;
  partnerName?: string;
  partnerLogo?: string | null;
  partnerVerified?: boolean;
  isBlackTierPartner?: boolean;
  sellerName?: string | null;
  sellerAvatarUrl?: string | null;
  kycVerified?: boolean;
  className?: string;
  priority?: boolean;
}

export function CarCardMobile({
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
  qiScore: _qiScore,
  isBlkListing,
  partnerName,
  partnerLogo,
  partnerVerified,
  isBlackTierPartner,
  sellerName,
  sellerAvatarUrl,
  kycVerified,
  className,
  priority = false,
}: CarCardMobileProps) {
  const displayImage = thumbnail || images?.[0] || '/assets/cars/car1.avif';
  const displaySpecs = formatSpecs(specs || 'GCC');
  const displayEmirate = formatEmirate(emirate);
  const displaySellerName = partnerName || sellerName || 'Private Seller';
  const isPartnerListing = Boolean(partnerLogo || partnerName);
  const carTitle = `${year} ${make} ${model}${trim ? ` ${trim}` : ''}`;
  
  // Hydration-safe: track if client has mounted
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  
  const { isSignedIn } = useUser();
  
  const favorite = useFavorite(id);
  const superlike = useSuperlike(id);

  const [showSuperlikeConfirmRaw, setShowSuperlikeConfirm] = useState(false);
  const [showSuperlikeLimitRaw, setShowSuperlikeLimit] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showHearts, setShowHearts] = useState(false);
  const [heartScale, setHeartScale] = useState(false);

  const timersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/listings/${id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: carTitle, url });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  }, [id, carTitle]);

  const authDialogOpen = favorite.authRequired || superlike.authRequired;
  const showSuperlikeConfirm = showSuperlikeConfirmRaw && !authDialogOpen;
  const showSuperlikeLimit = showSuperlikeLimitRaw && !authDialogOpen;

  const handleSuperlikeClick = useCallback(() => {
    if (!isSignedIn) {
      superlike.requireAuth();
      return;
    }

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
  }, [isSignedIn, superlike]);

  const confirmSuperlike = useCallback(() => {
    setShowSparkles(true);
    
    const timer1 = setTimeout(() => {
      superlike.toggle();
    }, 100);
    timersRef.current.push(timer1);
    
    const timer2 = setTimeout(() => {
      setShowSparkles(false);
    }, 400);
    timersRef.current.push(timer2);
  }, [superlike]);

  const handleFavoriteClick = useCallback(() => {
    if (!isSignedIn) {
      favorite.requireAuth();
      return;
    }

    if (!favorite.isFavorite) {
      setShowHearts(true);
      const timer1 = setTimeout(() => {
        setShowHearts(false);
      }, 400);
      timersRef.current.push(timer1);
    }

    setHeartScale(true);
    favorite.toggle();
    
    const timer2 = setTimeout(() => {
      setHeartScale(false);
    }, 400);
    timersRef.current.push(timer2);
  }, [isSignedIn, favorite]);

  return (
    <div className={cn(
      "group relative flex flex-col overflow-hidden rounded-xl transition-all duration-200 w-full",
      isBlkListing 
        ? "bg-black border border-zinc-800 active:border-zinc-700" 
        : "bg-sidebar border border-sidebar-border active:border-sidebar-border/80",
      className
    )}>
      {/* BLK accent */}
      {isBlkListing && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent z-10" />
      )}

      {/* Image Section with overlays */}
      <Link 
        href={`/listings/${id}`} 
        className={cn(
          "relative aspect-[16/10] w-full overflow-hidden",
          isBlkListing ? "bg-zinc-900" : "bg-muted/20"
        )}
      >
        <Image
          src={displayImage}
          alt={carTitle}
          fill
          priority={priority}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 50vw"
        />
        
        {/* Top Left - Avatar only */}
        <div className="absolute top-2 left-2">
          {isBlackTierPartner ? (
            <div className="rounded-full ring-2 ring-white/40 bg-black/50 backdrop-blur-sm p-0.5">
              {isPartnerListing ? (
                <BrandAvatar
                  logoUrl={partnerLogo}
                  brandName={displaySellerName}
                  size="xs"
                  className="w-7 h-7 bg-zinc-800 border-zinc-700"
                />
              ) : (
                <UserAvatar
                  src={sellerAvatarUrl}
                  name={displaySellerName}
                  size="sm"
                  className="w-7 h-7 bg-zinc-800 border-zinc-700 text-zinc-400"
                />
              )}
            </div>
          ) : isPartnerListing ? (
            <div className="rounded-full bg-black/50 backdrop-blur-sm p-0.5">
              <BrandAvatar
                logoUrl={partnerLogo}
                brandName={displaySellerName}
                size="xs"
                className="w-7 h-7 bg-white/20 border-white/20"
              />
            </div>
          ) : (
            <div className="rounded-full bg-black/50 backdrop-blur-sm p-0.5">
              <UserAvatar
                src={sellerAvatarUrl}
                name={displaySellerName}
                size="sm"
                className="w-7 h-7 bg-white/20 border-white/20 text-white/80"
              />
            </div>
          )}
        </div>

        {/* Top Right - Name + Verified/BLK */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/50 backdrop-blur-sm">
          <span className="text-xs font-medium text-white truncate max-w-[100px]">
            {displaySellerName}
          </span>
          {!isBlackTierPartner && (partnerVerified || kycVerified) && (
            <CheckCircle2 
              className="w-3.5 h-3.5 flex-shrink-0 text-blue-400" 
              aria-label="Verified" 
            />
          )}
          {isBlackTierPartner && (
            <span className="flex-shrink-0 px-1.5 h-4 inline-flex items-center text-[8px] font-black tracking-widest uppercase bg-black text-white">
              BLK
            </span>
          )}
        </div>
      </Link>

      {/* Content Section */}
      <div className="flex flex-col px-2.5 py-2 gap-0.5">
        {/* Row 1: Title + Year */}
        <Link href={`/listings/${id}`} className="block">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className={cn(
              "text-[15px] font-bold tracking-tight line-clamp-1 flex-1",
              isBlkListing ? "text-white" : "text-foreground"
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

        {/* Row 2: Price */}
        <p className={cn(
          "text-base font-bold tracking-tight",
          isBlkListing ? "text-white" : "text-blue-600"
        )}>
          {formatPrice(price)}
        </p>

        {/* Row 3: Specs + Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className={cn(
            "flex items-center gap-1.5 text-xs min-w-0",
            isBlkListing ? "text-zinc-400" : "text-muted-foreground"
          )}>
            <span className="font-medium truncate">{formatMileage(mileage)} km</span>
            <span className={isBlkListing ? "text-zinc-600" : "text-muted-foreground/40"}>•</span>
            <span className="font-medium truncate">{displaySpecs}</span>
            <span className={isBlkListing ? "text-zinc-600" : "text-muted-foreground/40"}>•</span>
            <span className="font-medium truncate">{displayEmirate}</span>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button 
              className={cn(
                "rounded-full p-2 transition-colors touch-manipulation",
                isBlkListing 
                  ? "text-zinc-400 active:bg-zinc-800 active:text-zinc-200" 
                  : "text-muted-foreground active:bg-muted active:text-foreground"
              )}
              aria-label="Share"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleShare();
              }}
            >
              <Share2 className="h-5 w-5" />
            </button>
            
            <button 
              className={cn(
                "relative rounded-full p-2 transition-all active:scale-95 touch-manipulation",
                favorite.isUpdating && "opacity-50",
                mounted && favorite.isFavorite
                  ? "text-rose-500 active:bg-rose-500/10"
                  : isBlkListing 
                    ? "text-zinc-400 active:bg-zinc-800 active:text-zinc-200" 
                    : "text-muted-foreground active:bg-muted active:text-foreground"
              )}
              aria-label={(mounted && favorite.isFavorite) ? "Remove favorite" : "Add to favorites"}
              disabled={favorite.isUpdating}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleFavoriteClick();
              }}
            >
              {showHearts && (
                <span className="absolute inset-0 rounded-full bg-rose-500/20 animate-ripple" />
              )}
              <Heart
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  heartScale && "scale-125"
                )}
                strokeWidth={(mounted && favorite.isFavorite) ? 2.5 : 1.5}
                fill={(mounted && favorite.isFavorite) ? "currentColor" : "none"}
              />
            </button>
            
            <button
              className={cn(
                "relative rounded-full p-2 transition-all active:scale-95 touch-manipulation",
                superlike.isUpdating && "opacity-50",
                mounted && superlike.isSuperliked
                  ? "text-yellow-500 active:bg-yellow-500/10"
                  : isBlkListing 
                    ? "text-zinc-400 active:bg-zinc-800 active:text-zinc-200" 
                    : "text-muted-foreground active:bg-muted active:text-foreground"
              )}
              aria-label={(mounted && superlike.isSuperliked) ? "Remove superlike" : "Superlike"}
              disabled={superlike.isUpdating}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSuperlikeClick();
              }}
            >
              {showSparkles && (
                <span className="absolute inset-0 rounded-full bg-yellow-500/20 animate-ripple" />
              )}
              <Sparkles
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  showSparkles && "scale-125"
                )}
                strokeWidth={(mounted && superlike.isSuperliked) ? 2.5 : 1.5}
                fill={(mounted && superlike.isSuperliked) ? "currentColor" : "none"}
              />
            </button>
          </div>
        </div>
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

interface CarCardMobileSkeletonProps {
  className?: string;
}

function CarCardMobileSkeletonComponent({ className }: CarCardMobileSkeletonProps) {
  return (
    <div className={cn(
      "flex flex-col overflow-hidden rounded-xl w-full",
      "bg-sidebar border border-sidebar-border",
      className
    )}>
      {/* Image with overlay placeholders */}
      <div className="relative aspect-[16/10] w-full">
        <Skeleton className="absolute inset-0" />
        {/* Avatar - top left */}
        <div className="absolute top-2 left-2">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        {/* Name pill - top right */}
        <div className="absolute top-2 right-2">
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
      </div>
      
      {/* Content */}
      <div className="flex flex-col px-2.5 py-2 gap-0.5">
        {/* Row 1: Title + Year */}
        <div className="flex items-baseline justify-between gap-2">
          <Skeleton className="h-[15px] w-24" />
          <Skeleton className="h-3 w-10" />
        </div>

        {/* Row 2: Price */}
        <Skeleton className="h-4 w-20" />

        {/* Row 3: Specs + Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

CarCardMobile.Skeleton = CarCardMobileSkeletonComponent;
