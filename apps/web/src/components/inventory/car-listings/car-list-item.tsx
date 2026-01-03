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
      "group relative overflow-hidden rounded-xl transition-all duration-300 flex flex-col lg:flex-row w-full",
      isBlkListing 
        ? "bg-black/80 backdrop-blur-2xl border border-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-black/50" 
        : "bg-sidebar border border-sidebar-border hover:border-sidebar-border/80 hover:shadow-md",
      className
    )}>
      {/* Subtle top accent for BLK listings */}
      {isBlkListing && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      )}

      {/* Image Section */}
      <div className="p-2 sm:p-3 w-full lg:w-80 flex-shrink-0">
        <Link href={`/listings/${id}`} className={cn(
          "relative aspect-[4/3] w-full overflow-hidden rounded-lg block",
          isBlkListing ? "bg-white/5" : "bg-muted/20"
        )}>
          <Image
            src={displayImage}
            alt={`${year} ${make} ${model}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 320px"
          />
        </Link>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 min-w-0 min-h-0">
        {/* Top Section - Title and Price */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-1 sm:gap-2 lg:gap-6 mb-2 sm:mb-3">
          <Link href={`/listings/${id}`} className="group/title flex-1 min-w-0 space-y-1">
            <h3 className={cn(
              "text-[15px] sm:text-base lg:text-lg font-medium transition-colors line-clamp-1",
              isBlkListing 
                ? "text-white group-hover/title:text-zinc-200" 
                : "text-sidebar-foreground group-hover/title:text-primary"
            )}>
              {make} {model}
            </h3>
            <p className={cn(
              "text-xs sm:text-sm font-medium line-clamp-1 min-h-[1rem]",
              isBlkListing ? "text-white/60" : "text-muted-foreground"
            )}>
              {trim || '\u00A0'}
            </p>
          </Link>
          <p className={cn(
            "text-base sm:text-lg font-semibold whitespace-nowrap",
            isBlkListing ? "text-white" : "text-blue-600"
          )}>
            {formatPrice(price)}
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 lg:gap-3 text-xs sm:text-sm lg:text-[15px] mb-1 sm:mb-1.5">
          <span className={cn(
            "font-semibold",
            isBlkListing ? "text-white/70" : "text-sidebar-foreground/80"
          )}>
            {year}
          </span>
          <span className={isBlkListing ? "text-white/20" : "text-sidebar-foreground/40"}>•</span>
          <span className={cn(
            "font-semibold",
            isBlkListing ? "text-white/70" : "text-sidebar-foreground/80"
          )}>
            {formatMileage(mileage)} km
          </span>
          <span className={isBlkListing ? "text-white/20" : "text-sidebar-foreground/40"}>•</span>
          <span className={cn(
            "font-semibold",
            isBlkListing ? "text-white/70" : "text-sidebar-foreground/80"
          )}>
            {displaySpecs}
          </span>
        </div>

        {/* Location Row */}
        <div className="mb-2 sm:mb-3 lg:mb-auto lg:pb-4">
          <span className={cn(
            "text-xs sm:text-sm font-medium",
            isBlkListing ? "text-white/50" : "text-muted-foreground"
          )}>
            {displayEmirate}
          </span>
        </div>

        {/* Bottom Section - Dealer and Actions */}
        <div className={cn(
          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 pt-2 sm:pt-3 lg:pt-4 border-t mt-auto",
          isBlkListing ? "border-white/10" : "border-sidebar-border"
        )}>
          {/* Left - Dealer */}
          <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 min-w-0 flex-1">
            {isPartnerListing ? (
              <BrandAvatar
                logoUrl={partnerLogo}
                brandName={displaySellerName}
                size="xs"
                className={cn(
                  "w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 flex-shrink-0",
                  isBlkListing ? "bg-white/10 border-white/20" : "bg-sidebar-accent border-sidebar-border"
                )}
              />
            ) : (
              <UserAvatar
                src={sellerAvatarUrl}
                name={displaySellerName}
                size="sm"
                className={cn(
                  "w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 flex-shrink-0",
                  isBlkListing ? "bg-white/10 border-white/20 text-white/60" : "bg-sidebar-accent border-sidebar-border text-sidebar-foreground/70"
                )}
              />
            )}
            <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 min-w-0">
              <span className={cn(
                "text-xs sm:text-sm truncate",
                isBlackTierPartner ? "font-semibold" : "font-medium",
                isBlkListing ? "text-white/70" : "text-sidebar-foreground/80"
              )}>
                {displaySellerName}
              </span>
              {(partnerVerified || kycVerified) && (
                <CheckCircle2 className="w-4 h-4 sm:w-[18px] sm:h-[18px] lg:w-5 lg:h-5 text-blue-500 flex-shrink-0" aria-label="Verified" />
              )}
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0 self-end sm:self-auto">
            <button 
              className={cn(
                "rounded-full p-1.5 sm:p-2 transition-colors",
                isBlkListing 
                  ? "text-white/40 hover:text-white/80 hover:bg-white/10" 
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
                    ? "text-rose-400 hover:bg-white/10" 
                    : "text-rose-500 hover:bg-sidebar-accent"
                  : isBlkListing 
                    ? "text-white/40 hover:text-white/80 hover:bg-white/10" 
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
                    ? "text-yellow-400 hover:bg-white/10" 
                    : "text-yellow-500 hover:bg-sidebar-accent"
                  : isBlkListing 
                    ? "text-white/40 hover:text-white/80 hover:bg-white/10" 
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
