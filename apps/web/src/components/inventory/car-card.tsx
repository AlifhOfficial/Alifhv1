/**
 * Car Card Component - Alifh Design System
 * Following "Less is More" principle with minimalist aesthetic
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Share2, Heart, CheckCircle2, Sparkles } from 'lucide-react';
import { useFavorite } from '@/hooks/favorites/use-favorites-simple';
import { useSuperlike } from '@/hooks/favorites/use-superlikes-simple';
import { useUser } from '@/hooks/auth/use-auth';
import { cn } from '@/utils';
import { useState, useEffect } from 'react';
import { SuperlikeConfirmationDialog } from './superlike-confirmation-dialog';
import { SuperlikeLimitDialog } from './superlike-limit-dialog';
import { AuthRequiredDialog } from '@/components/auth/auth-required-dialog';

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
  partnerVerified?: boolean;
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
  partnerVerified,
  isBlackMember = false,
  className
}: CarCardProps) {
  // Format functions
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
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
  
  // Separate hooks for favorites and superlikes
  const favorite = useFavorite(id);
  const superlike = useSuperlike(id);
  
  const isFavorite = favorite.isFavorite;
  const isSuperliked = superlike.isSuperliked;
  const isUpdating = favorite.isUpdating || superlike.isUpdating;
  const toggleFavorite = favorite.toggle;
  const toggleSuperlike = superlike.toggle;
  const quota = superlike.quota;
  
  // Handle auth dialogs from either feature
  const authRequired = favorite.authRequired || superlike.authRequired;
  const authMessage = favorite.authMessage || superlike.authMessage;
  const authFeature = favorite.authRequired ? 'favorites' : 'superlikes';
  const closeAuthDialog = () => {
    favorite.closeAuthDialog();
    superlike.closeAuthDialog();
  };

  const [showSuperlikeConfirm, setShowSuperlikeConfirm] = useState(false);
  const [showSuperlikeLimit, setShowSuperlikeLimit] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [heartScale, setHeartScale] = useState(false);

  // Close superlike dialogs when auth dialog appears
  useEffect(() => {
    if (authRequired) {
      setShowSuperlikeConfirm(false);
      setShowSuperlikeLimit(false);
    }
  }, [authRequired]);

  const handleSuperlikeClick = () => {
    // Check if user is authenticated first
    if (!isSignedIn) {
      // Directly trigger the auth flow by calling toggleSuperlike
      // which will set authRequired state
      toggleSuperlike();
      return;
    }

    // If already superliked, remove it without confirmation
    if (isSuperliked) {
      toggleSuperlike();
      return;
    }

    // If quota isn't loaded yet, try anyway (API will validate)
    if (!quota) {
      setShowSuperlikeConfirm(true);
      return;
    }

    // Check if user has superlikes remaining
    if (quota.remaining <= 0) {
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
      toggleSuperlike();
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
      toggleFavorite();
      return;
    }

    // Trigger heart scale animation
    setHeartScale(true);
    toggleFavorite();
    
    // Reset animation after it completes
    setTimeout(() => {
      setHeartScale(false);
    }, 400);
  };

  const carTitle = `${year} ${make} ${model}${trim ? ` ${trim}` : ''}`;

  return (
    <div className={cn(
      "group relative flex flex-col overflow-hidden rounded-xl transition-all duration-300 min-w-[280px]",
      isBlackMember 
        ? "bg-black border border-zinc-800 hover:border-zinc-700 hover:shadow-2xl" 
        : "bg-card dark:bg-muted/20 border border-border/40 hover:border-border/60 hover:shadow-lg",
      className
    )}>
      {/* Subtle top accent line for Black Members */}
      {isBlackMember && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
      )}
      
      {/* Image Section */}
      <div className="p-2">
        <Link href={`/listings/${id}`} className={cn(
          "relative aspect-[16/10] w-full overflow-hidden rounded-lg block",
          isBlackMember ? "bg-zinc-900" : "bg-muted/20"
        )}>
          <Image
            src={displayImage}
            alt={`${year} ${make} ${model}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        
        {/* Overlay Gradient - Subtle for Black Members */}
        <div className={cn(
          "absolute inset-0 transition-opacity duration-300",
          isBlackMember 
            ? "bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40 group-hover:opacity-60" 
            : "bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100"
        )} />
        
        {/* Badge - Top Right */}
        {isBlackMember ? (
          <div className="absolute top-3 right-3 flex items-center px-3 py-1.5 bg-black border border-black">
            <span className="text-xs font-bold text-white tracking-widest">BLK</span>
          </div>
        ) : qiScore ? (
          <div className="absolute top-3 right-3 flex items-center justify-center px-2 py-1 rounded bg-black/60 backdrop-blur-sm">
            <span className="text-[10px] font-medium text-white/90">QI {Math.round(qiScore)}</span>
          </div>
        ) : null}
        </Link>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        {/* Title and Price */}
        <div className="mb-4">
          <div className="flex items-start justify-between gap-3">
            <Link href={`/listings/${id}`} className="group/title min-w-0 flex-1">
              <h3 className={cn(
                "text-sm font-semibold transition-colors line-clamp-1 tracking-tight",
                isBlackMember
                  ? "text-white group-hover/title:text-zinc-200"
                  : "text-foreground group-hover/title:text-primary"
              )}>
                <span className={cn(
                  "font-normal mr-1.5",
                  isBlackMember ? "text-zinc-400" : "text-muted-foreground/80"
                )}>{year}</span>
                {make} {model}
              </h3>
              {trim && (
                <p className={cn(
                  "text-xs line-clamp-1 mt-0.5",
                  isBlackMember ? "text-zinc-500" : "text-muted-foreground/70"
                )}>
                  {trim}
                </p>
              )}
            </Link>
            <p className={cn(
              "text-sm font-semibold whitespace-nowrap tracking-tight",
              isBlackMember ? "text-white" : "text-foreground"
            )}>
              {formatPrice(price)}
            </p>
          </div>
        </div>

        {/* Key Details Grid */}
        <div className={cn(
          "grid grid-cols-3 gap-4 py-4 border-t",
          isBlackMember ? "border-zinc-800" : "border-border/40"
        )}>
          <div className="space-y-1.5">
            <p className={cn(
              "text-[10px] uppercase tracking-wider font-medium",
              isBlackMember ? "text-zinc-500" : "text-muted-foreground/70"
            )}>Mileage</p>
            <p className={cn(
              "text-sm font-bold tabular-nums",
              isBlackMember ? "text-zinc-100" : "text-foreground"
            )}>{formatMileage(mileage)} km</p>
          </div>
          
          <div className="space-y-1.5">
            <p className={cn(
              "text-[10px] uppercase tracking-wider font-medium",
              isBlackMember ? "text-zinc-500" : "text-muted-foreground/70"
            )}>Specs</p>
            <p className={cn(
              "text-sm font-bold capitalize",
              isBlackMember ? "text-zinc-100" : "text-foreground"
            )}>{displaySpecs}</p>
          </div>
          
          <div className="space-y-1.5">
            <p className={cn(
              "text-[10px] uppercase tracking-wider font-medium",
              isBlackMember ? "text-zinc-500" : "text-muted-foreground/70"
            )}>Location</p>
            <p className={cn(
              "text-sm font-bold truncate",
              isBlackMember ? "text-zinc-100" : "text-foreground"
            )}>{emirate}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={cn(
          "mt-auto flex items-center justify-between pt-4 border-t",
          isBlackMember ? "border-zinc-800" : "border-border/40"
        )}>
          {/* Dealer Info */}
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn(
              "relative w-7 h-7 rounded-full overflow-hidden flex-shrink-0",
              isBlackMember ? "bg-zinc-800 ring-1 ring-zinc-700" : "bg-muted ring-1 ring-border/20"
            )}>
              <div className={cn(
                "w-full h-full flex items-center justify-center text-[10px] font-semibold",
                isBlackMember ? "text-zinc-400" : "text-muted-foreground"
              )}>
                {(partnerName || 'PS').substring(0, 2).toUpperCase()}
              </div>
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={cn(
                "text-xs font-medium truncate",
                isBlackMember ? "text-zinc-300" : "text-foreground"
              )}>
                {partnerName || 'Private Seller'}
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

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button 
              className={cn(
                "rounded-full p-2 transition-colors",
                isBlackMember
                  ? "text-zinc-400 hover:text-zinc-200"
                  : "text-muted-foreground/70 hover:text-foreground"
              )}
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>
            
            {/* Favorite Button */}
            <button 
              className={cn(
                "relative rounded-full p-2 transition-all active:scale-95",
                isUpdating && "opacity-50 cursor-not-allowed",
                isFavorite
                  ? isBlackMember
                    ? "text-rose-400"
                    : "text-rose-500"
                  : isBlackMember
                    ? "text-zinc-400 hover:text-zinc-200"
                    : "text-muted-foreground/70 hover:text-foreground"
              )}
              aria-label={isFavorite ? "Remove favorite" : "Add to favorites"}
              aria-pressed={isFavorite}
              disabled={isUpdating}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleFavoriteClick();
              }}
              style={{ transition: 'color 150ms ease, transform 150ms ease, opacity 150ms ease' }}
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-transform duration-300",
                  heartScale && "scale-150"
                )}
                strokeWidth={isFavorite ? 2.5 : 2}
                fill={isFavorite ? "currentColor" : "none"}
              />
            </button>
            
            {/* Superlike Button */}
            <button
              className={cn(
                "relative rounded-full p-2 transition-all active:scale-95",
                isUpdating && "opacity-50 cursor-not-allowed",
                isSuperliked
                  ? "text-yellow-500"
                  : isBlackMember
                    ? "text-zinc-400 hover:text-zinc-200"
                    : "text-muted-foreground/70 hover:text-foreground"
              )}
              aria-label={isSuperliked ? "Remove superlike" : "Superlike"}
              aria-pressed={isSuperliked}
              disabled={isUpdating}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleSuperlikeClick();
              }}
              style={{ transition: 'color 150ms ease, transform 150ms ease, opacity 150ms ease' }}
            >
              <Sparkles
                className="h-4 w-4"
                strokeWidth={isSuperliked ? 2.5 : 2}
                fill={isSuperliked ? "currentColor" : "none"}
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
        quota={quota}
        listingTitle={carTitle}
      />

      {/* Superlike Limit Dialog */}
      <SuperlikeLimitDialog
        isOpen={showSuperlikeLimit}
        onClose={() => setShowSuperlikeLimit(false)}
        resetDate={quota?.periodEndDate}
      />

      {/* Auth Required Dialog */}
      <AuthRequiredDialog
        isOpen={authRequired}
        onClose={closeAuthDialog}
        message={authMessage}
        feature={authFeature}
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
