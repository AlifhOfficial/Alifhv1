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
import { useState, useEffect } from 'react';
import { SuperlikeConfirmationDialog } from '@/components/engagement/favorites/superlike-confirmation-dialog';
import { SuperlikeLimitDialog } from '@/components/engagement/favorites/superlike-limit-dialog';
import { AuthRequiredDialog } from '@/components/auth/auth-required-dialog';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { BrandAvatar } from '@/components/partner/car-dealer/ui/brand-avatar';

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
  viewCount?: number;
  qiScore?: number | null;
  // Partner/Dealer info
  partnerName?: string;
  partnerLogo?: string | null;
  partnerVerified?: boolean;
  sellerName?: string | null;
  sellerAvatarUrl?: string | null;
  isBlackMember?: boolean; // Black tier partner listing
  className?: string;
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
  qiScore,
  partnerName,
  partnerLogo,
  partnerVerified,
  sellerName,
  sellerAvatarUrl,
  isBlackMember = false,
  className
}: CarCardProps) {
  // Format functions
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
  const { user, isSignedIn } = useUser();
  
  // Separate hooks for favorites and superlikes - completely independent
  const favorite = useFavorite(id);
  const superlike = useSuperlike(id);

  const [showSuperlikeConfirm, setShowSuperlikeConfirm] = useState(false);
  const [showSuperlikeLimit, setShowSuperlikeLimit] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [heartScale, setHeartScale] = useState(false);

  // Close superlike dialogs when auth dialog appears
  // Close superlike dialogs when auth is required
  useEffect(() => {
    if (favorite.authRequired || superlike.authRequired) {
      setShowSuperlikeConfirm(false);
      setShowSuperlikeLimit(false);
    }
  }, [favorite.authRequired, superlike.authRequired]);

  const handleSuperlikeClick = () => {
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
  };

  const confirmSuperlike = async () => {
    // Show sparkles effect
    setShowSparkles(true);
    
    // Trigger the toggle after a brief delay
    setTimeout(() => {
      superlike.toggle();
    }, 100);
    
    // Hide sparkles after animation
    setTimeout(() => {
      setShowSparkles(false);
    }, 2000);
  };

  const handleFavoriteClick = () => {
    // Check if user is authenticated first
    if (!isSignedIn) {
      // Directly trigger the auth flow
      favorite.toggle();
      return;
    }

    // Trigger heart scale animation
    setHeartScale(true);
    favorite.toggle();
    
    // Reset animation after it completes
    setTimeout(() => {
      setHeartScale(false);
    }, 400);
  };

  const carTitle = `${year} ${make} ${model}${trim ? ` ${trim}` : ''}`;
  const displaySellerName = partnerName || sellerName || 'Private Seller';
  const isPartnerListing = Boolean(partnerLogo || partnerName);

  return (
    <div className={cn(
      "group relative flex flex-col overflow-hidden rounded-lg transition-all duration-300 w-full",
      isBlackMember 
        ? "bg-black border border-zinc-800 hover:border-zinc-700 hover:shadow-xl" 
        : "bg-sidebar border border-sidebar-border hover:border-sidebar-border/80 hover:shadow-md",
      className
    )}>
      {/* Image Section */}
      <Link href={`/listings/${id}`} className={cn(
        "relative aspect-[4/3] w-full overflow-hidden block",
        isBlackMember ? "bg-zinc-900" : "bg-muted/20"
      )}>
        <Image
          src={displayImage}
          alt={`${year} ${make} ${model}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Black badge - exception, can be on image */}
        {isBlackMember && (
          <div className="absolute top-2 right-2 px-2.5 py-1 bg-black/90 backdrop-blur-sm border border-zinc-700 rounded">
            <span className="text-[10px] font-bold text-white tracking-widest">BLK</span>
          </div>
        )}
      </Link>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-4 space-y-3">
        {/* Title */}
        <Link href={`/listings/${id}`} className="group/title">
          <h3 className={cn(
            "text-sm font-medium line-clamp-1 transition-colors",
            isBlackMember
              ? "text-white group-hover/title:text-zinc-200"
              : "text-sidebar-foreground group-hover/title:text-primary"
          )}>
            {year} {make} {model}{trim ? ` ${trim}` : ''}
          </h3>
        </Link>

        {/* Price */}
        <p className={cn(
          "text-xl font-bold -mt-0.5",
          isBlackMember ? "text-blue-400" : "text-blue-600"
        )}>
          {formatPrice(price)}
        </p>

        {/* Stats Row */}
        <div className="flex items-center gap-2.5 text-xs">
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
        </div>

        {/* Bottom Section */}
        <div className={cn(
          "flex items-center justify-between pt-3 mt-auto border-t",
          isBlackMember ? "border-zinc-800" : "border-sidebar-border"
        )}>
          {/* Left - Dealer */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {isPartnerListing ? (
              <BrandAvatar
                logoUrl={partnerLogo}
                brandName={displaySellerName}
                size="xs"
                className={cn(
                  'w-8 h-8 flex-shrink-0',
                  isBlackMember ? 'bg-zinc-800 border-zinc-700' : 'bg-sidebar-accent border-sidebar-border'
                )}
              />
            ) : (
              <UserAvatar
                src={sellerAvatarUrl}
                name={displaySellerName}
                size="sm"
                className={cn(
                  'w-8 h-8 flex-shrink-0',
                  isBlackMember ? 'bg-zinc-800 border-zinc-700 text-zinc-400' : 'bg-sidebar-accent border-sidebar-border text-sidebar-foreground/70'
                )}
              />
            )}
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={cn(
                "text-sm font-semibold truncate",
                isBlackMember ? "text-zinc-200" : "text-sidebar-foreground"
              )}>
                {displaySellerName}
              </span>
              {(isBlackMember || partnerVerified) && (
                <div className="relative inline-flex items-center justify-center w-4 h-4 flex-shrink-0" title="Verified">
                  <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
                    <circle cx="12" cy="12" r="10" className="fill-blue-500" />
                    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Right - QI + Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {qiScore && (
              <span className={cn(
                "px-2 py-1 text-[10px] font-medium rounded mr-0.5",
                isBlackMember 
                  ? "bg-zinc-800 text-zinc-300 border border-zinc-700" 
                  : "bg-sidebar-accent text-sidebar-foreground/80 border border-sidebar-border"
              )}>
                QI {Math.round(qiScore)}
              </span>
            )}
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
