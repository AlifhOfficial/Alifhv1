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
import { useState } from 'react';
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
  partnerName?: string;
  partnerLogo?: string | null;
  partnerVerified?: boolean;
  sellerName?: string | null;
  sellerAvatarUrl?: string | null;
  isBlackMember?: boolean;
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
  partnerName,
  partnerLogo,
  partnerVerified,
  sellerName,
  sellerAvatarUrl,
  isBlackMember = false,
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

  const displayImage = thumbnail || images?.[0] || '/assets/cars/car1.avif';
  const displaySpecs = specs || 'GCC';
  const displaySellerName = partnerName || sellerName || 'Private Seller';
  const isPartnerListing = Boolean(partnerLogo || partnerName);
  
  // Separate hooks for favorites and superlikes
  const favorite = useFavorite(id);
  const superlike = useSuperlike(id);

  const [showSuperlikeConfirm, setShowSuperlikeConfirm] = useState(false);
  const [showSuperlikeLimit, setShowSuperlikeLimit] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [heartScale, setHeartScale] = useState(false);

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
    setTimeout(() => superlike.toggle(), 100);
    setTimeout(() => setShowSparkles(false), 2000);
  };

  const handleFavoriteClick = () => {
    setHeartScale(true);
    favorite.toggle();
    setTimeout(() => setHeartScale(false), 400);
  };

  const carTitle = `${year} ${make} ${model}${trim ? ` ${trim}` : ''}`;

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-lg transition-all duration-300 flex flex-col lg:flex-row w-full",
      isBlackMember 
        ? "bg-black border border-zinc-800 hover:border-zinc-700 hover:shadow-xl" 
        : "bg-sidebar border border-sidebar-border hover:border-sidebar-border/80 hover:shadow-md",
      className
    )}>
      {/* Image Section */}
      <div className="p-3 w-full lg:w-80 flex-shrink-0">
        <Link href={`/listings/${id}`} className={cn(
          "relative aspect-[4/3] w-full overflow-hidden rounded-lg block",
          isBlackMember ? "bg-zinc-900" : "bg-muted/20"
        )}>
          <Image
            src={displayImage}
            alt={`${year} ${make} ${model}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="256px"
          />
        
          {/* Black badge - exception, can be on image */}
          {isBlackMember && (
            <div className="absolute top-2 right-2 px-2.5 py-1 bg-black/90 backdrop-blur-sm border border-zinc-700 rounded">
              <span className="text-[10px] font-bold text-white tracking-widest">BLK</span>
            </div>
          )}
        </Link>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col px-4 lg:px-6 py-4 lg:py-5 min-w-0 min-h-0">
        {/* Top Section - Title and Price */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2 lg:gap-6 mb-3">
          <Link href={`/listings/${id}`} className="group/title flex-1 min-w-0">
            <h3 className={cn(
              "text-base lg:text-lg font-medium transition-colors line-clamp-1",
              isBlackMember
                ? "text-white group-hover/title:text-zinc-200"
                : "text-sidebar-foreground group-hover/title:text-primary"
            )}>
              {year} {make} {model}{trim ? ` ${trim}` : ''}
            </h3>
          </Link>
          <p className={cn(
            "text-base lg:text-xl font-semibold whitespace-nowrap",
            isBlackMember ? "text-blue-400" : "text-blue-600"
          )}>
            {formatPrice(price)}
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-3 text-xs lg:text-sm mb-3 lg:mb-auto lg:pb-4">
          <span className={cn(
            "font-medium",
            isBlackMember ? "text-zinc-300" : "text-sidebar-foreground/80"
          )}>
            {formatMileage(mileage)} km
          </span>
          <span className={cn(
            isBlackMember ? "text-zinc-600" : "text-sidebar-foreground/30"
          )}>•</span>
          <span className={cn(
            "font-medium",
            isBlackMember ? "text-zinc-300" : "text-sidebar-foreground/80"
          )}>
            {displaySpecs}
          </span>
          <span className={cn(
            isBlackMember ? "text-zinc-600" : "text-sidebar-foreground/30"
          )}>•</span>
          <span className={cn(
            "font-medium",
            isBlackMember ? "text-zinc-300" : "text-sidebar-foreground/80"
          )}>
            {emirate}
          </span>
          {qiScore && (
            <>
              <span className={cn(
                isBlackMember ? "text-zinc-600" : "text-sidebar-foreground/30"
              )}>•</span>
              <span className={cn(
                "px-2 py-1 text-[10px] font-medium rounded",
                isBlackMember 
                  ? "bg-zinc-800 text-zinc-300 border border-zinc-700" 
                  : "bg-sidebar-accent text-sidebar-foreground/80 border border-sidebar-border"
              )}>
                QI {Math.round(qiScore)}
              </span>
            </>
          )}
        </div>

        {/* Bottom Section - Dealer and Actions */}
        <div className={cn(
          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 pt-3 lg:pt-4 border-t mt-auto",
          isBlackMember ? "border-zinc-800" : "border-sidebar-border"
        )}>
          {/* Left - Dealer */}
          <div className="flex items-center gap-2.5 lg:gap-3 min-w-0 flex-1">
            {isPartnerListing ? (
              <BrandAvatar
                logoUrl={partnerLogo}
                brandName={displaySellerName}
                size="xs"
                className={cn(
                  'w-8 h-8 lg:w-9 lg:h-9 flex-shrink-0',
                  isBlackMember ? 'bg-zinc-800 border-zinc-700' : 'bg-sidebar-accent border-sidebar-border'
                )}
              />
            ) : (
              <UserAvatar
                src={sellerAvatarUrl}
                name={displaySellerName}
                size="sm"
                className={cn(
                  'w-8 h-8 lg:w-9 lg:h-9 flex-shrink-0',
                  isBlackMember ? 'bg-zinc-800 border-zinc-700 text-zinc-400' : 'bg-sidebar-accent border-sidebar-border text-sidebar-foreground/70'
                )}
              />
            )}
            <div className="flex items-center gap-1.5 lg:gap-2 min-w-0">
              <span className={cn(
                "text-sm lg:text-base font-semibold truncate",
                isBlackMember ? "text-zinc-200" : "text-sidebar-foreground"
              )}>
                {displaySellerName}
              </span>
              {(isBlackMember || partnerVerified) && (
                <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" aria-label="Verified" />
              )}
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-1 flex-shrink-0 self-end sm:self-auto">
            <button 
              className={cn(
                "rounded-full p-2 transition-colors",
                isBlackMember
                  ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>
            
            {/* Favorite Button */}
            <button 
              className={cn(
                "relative rounded-full p-2 transition-all active:scale-95",
                favorite.isUpdating && "opacity-50 cursor-not-allowed",
                favorite.isFavorite
                  ? isBlackMember
                    ? "text-rose-400 hover:bg-zinc-800"
                    : "text-rose-500 hover:bg-sidebar-accent"
                  : isBlackMember
                    ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
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
                  "h-4 w-4 transition-transform duration-300",
                  heartScale && "scale-150"
                )}
                strokeWidth={favorite.isFavorite ? 2.5 : 2}
                fill={favorite.isFavorite ? "currentColor" : "none"}
              />
            </button>
            
            {/* Superlike Button */}
            <button
              className={cn(
                "relative rounded-full p-2 transition-all active:scale-95",
                superlike.isUpdating && "opacity-50 cursor-not-allowed",
                superlike.isSuperliked
                  ? isBlackMember
                    ? "text-yellow-400 hover:bg-zinc-800"
                    : "text-yellow-500 hover:bg-sidebar-accent"
                  : isBlackMember
                    ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
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
                className="h-4 w-4"
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
          <style jsx>{`
            @keyframes fall {
              0% {
                transform: translateY(-100px) rotate(0deg);
                opacity: 0;
              }
              10% {
                opacity: 1;
              }
              90% {
                opacity: 1;
              }
              100% {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
              }
            }
            .sparkle-fall {
              position: absolute;
              animation: fall 2s ease-in forwards;
              font-size: 24px;
            }
          `}</style>
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="sparkle-fall"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.6}s`,
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
