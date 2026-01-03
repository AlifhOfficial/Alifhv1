/**
 * Car Card Component - Alifh Design System
 * Following "Less is More" principle with minimalist aesthetic
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Share2, Heart, CheckCircle2, Sparkles } from 'lucide-react';
import { useFavorite, useSuperlike } from '@/hooks/engagement';
import { useUser } from '@/hooks/auth/use-auth';
import { cn } from '@/utils';
import { useState, useCallback, useEffect, useRef } from 'react';
import { SuperlikeConfirmationDialog } from '@/components/engagement/favorites/superlike-confirmation-dialog';
import { SuperlikeLimitDialog } from '@/components/engagement/favorites/superlike-limit-dialog';
import { AuthRequiredDialog } from '@/components/auth/auth-required-dialog';
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
    // Check if user is authenticated first
    if (!isSignedIn) {
      // Directly trigger the auth flow by calling toggle
      // which will set authRequired state in the superlike hook
      superlike.toggle();
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
    // Show sparkles effect
    setShowSparkles(true);
    
    // Trigger the toggle after a brief delay
    const timer1 = setTimeout(() => {
      superlike.toggle();
    }, 100);
    timersRef.current.push(timer1);
    
    // Hide sparkles after animation
    const timer2 = setTimeout(() => {
      setShowSparkles(false);
    }, 2000);
    timersRef.current.push(timer2);
  }, [superlike]);

  const handleFavoriteClick = useCallback(() => {
    // Check if user is authenticated first
    if (!isSignedIn) {
      // Directly trigger the auth flow
      favorite.toggle();
      return;
    }

    // Show hearts effect if adding to favorites (not removing)
    if (!favorite.isFavorite) {
      setShowHearts(true);
      const timer1 = setTimeout(() => {
        setShowHearts(false);
      }, 2000);
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
        "relative aspect-[4/3] sm:aspect-[3/2] lg:aspect-[16/10] w-full overflow-hidden block",
        isBlkListing ? "bg-zinc-900" : "bg-muted/20"
      )}>
        <Image
          src={displayImage}
          alt={`${year} ${make} ${model}`}
          fill
          priority={priority}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </Link>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-3 sm:p-4 space-y-2 sm:space-y-3">
        {/* Title with Year */}
        <Link href={`/listings/${id}`} className="group/title space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className={cn(
              "text-sm sm:text-[15px] font-semibold line-clamp-1 transition-colors flex-1",
              isBlkListing 
                ? "text-white group-hover/title:text-zinc-200" 
                : "text-sidebar-foreground group-hover/title:text-primary"
            )}>
              {make} {model}
            </h3>
            <span className={cn(
              "text-xs font-medium flex-shrink-0",
              isBlkListing ? "text-zinc-400" : "text-muted-foreground"
            )}>
              {year}
            </span>
          </div>
          <p className={cn(
            "text-xs font-medium line-clamp-1 min-h-[1rem]",
            isBlkListing ? "text-zinc-400" : "text-muted-foreground"
          )}>
            {trim || '\u00A0'}
          </p>
        </Link>

        {/* Price */}
        <p className={cn(
          "text-base sm:text-lg font-semibold -mt-0.5",
          isBlkListing ? "text-white" : "text-blue-600"
        )}>
          {formatPrice(price)}
        </p>

        {/* Stats Row */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 text-xs sm:text-sm">
          <span className={cn(
            "font-semibold",
            isBlkListing ? "text-zinc-300" : "text-sidebar-foreground/80"
          )}>
            {formatMileage(mileage)} km
          </span>
          <span className={isBlkListing ? "text-zinc-600" : "text-sidebar-foreground/40"}>•</span>
          <span className={cn(
            "font-semibold",
            isBlkListing ? "text-zinc-300" : "text-sidebar-foreground/80"
          )}>
            {displaySpecs}
          </span>
          <span className={isBlkListing ? "text-zinc-600" : "text-sidebar-foreground/40"}>•</span>
          <span className={cn(
            "font-semibold truncate",
            isBlkListing ? "text-zinc-300" : "text-sidebar-foreground/80"
          )}>
            {displayEmirate}
          </span>
        </div>

        {/* Bottom Section */}
        <div className={cn(
          "flex items-center justify-between pt-2 sm:pt-3 mt-auto border-t",
          isBlkListing ? "border-zinc-800" : "border-sidebar-border"
        )}>
          {/* Left - Dealer */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
            {isPartnerListing ? (
              <BrandAvatar
                logoUrl={partnerLogo}
                brandName={displaySellerName}
                size="xs"
                className={cn(
                  "w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0",
                  isBlkListing ? "bg-zinc-800 border-zinc-700" : "bg-sidebar-accent border-sidebar-border"
                )}
              />
            ) : (
              <UserAvatar
                src={sellerAvatarUrl}
                name={displaySellerName}
                size="sm"
                className={cn(
                  "w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0",
                  isBlkListing ? "bg-zinc-800 border-zinc-700 text-zinc-400" : "bg-sidebar-accent border-sidebar-border text-sidebar-foreground/70"
                )}
              />
            )}
            <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
              <span className={cn(
                "text-xs sm:text-sm truncate",
                isBlackTierPartner ? "font-semibold" : "font-medium",
                isBlkListing ? "text-zinc-300" : "text-sidebar-foreground/80"
              )}>
                {displaySellerName}
              </span>
              {(partnerVerified || kycVerified) && (
                <CheckCircle2 className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-blue-500 flex-shrink-0" aria-label="Verified" />
              )}
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <button 
              className={cn(
                "rounded-full p-1.5 sm:p-2 transition-colors",
                isBlkListing 
                  ? "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800" 
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}
              aria-label="Share"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleShare();
              }}
            >
              <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            
            {/* Favorite Button */}
            <button 
              className={cn(
                "relative rounded-full p-1.5 sm:p-2 transition-all active:scale-95",
                favorite.isUpdating && "opacity-50 cursor-not-allowed",
                favorite.isFavorite
                  ? isBlkListing 
                    ? "text-rose-400 hover:bg-zinc-800" 
                    : "text-rose-500 hover:bg-sidebar-accent"
                  : isBlkListing 
                    ? "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800" 
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
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
                  "h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300",
                  heartScale && "scale-150"
                )}
                strokeWidth={favorite.isFavorite ? 2.5 : 2}
                fill={favorite.isFavorite ? "currentColor" : "none"}
              />
            </button>
            
            {/* Superlike Button */}
            <button
              className={cn(
                "relative rounded-full p-1.5 sm:p-2 transition-all active:scale-95",
                superlike.isUpdating && "opacity-50 cursor-not-allowed",
                superlike.isSuperliked
                  ? isBlkListing 
                    ? "text-yellow-400 hover:bg-zinc-800" 
                    : "text-yellow-500 hover:bg-sidebar-accent"
                  : isBlkListing 
                    ? "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800" 
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
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
                className="h-4 w-4 sm:h-5 sm:w-5"
                strokeWidth={superlike.isSuperliked ? 2.5 : 2}
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

      {/* Auth Required Dialogs - Separate for each feature */}
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

      {/* Falling Hearts Effect */}
      {showHearts && (
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
                {i % 3 === 0 ? '❤️' : i % 3 === 1 ? '💕' : '💖'}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
