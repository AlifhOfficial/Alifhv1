/**
 * Car List Item Component - Alifh Design System
 * List view variant following "Less is More" principle
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Share2, Heart, Sparkles } from 'lucide-react';
import { useFavorites } from '@/hooks/favorites';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { SuperlikeConfirmationDialog } from './superlike-confirmation-dialog';
import { SuperlikeLimitDialog } from './superlike-limit-dialog';

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
  partnerVerified?: boolean;
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
  partnerVerified,
  isBlackMember = false,
  className
}: CarListItemProps) {
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
  const {
    isFavorite,
    isSuperliked,
    isUpdating,
    toggleFavorite,
    toggleSuperlike,
    quota,
  } = useFavorites(id);

  const [showSuperlikeConfirm, setShowSuperlikeConfirm] = useState(false);
  const [showSuperlikeLimit, setShowSuperlikeLimit] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [heartScale, setHeartScale] = useState(false);

  const handleSuperlikeClick = () => {
    if (isSuperliked) {
      toggleSuperlike();
      return;
    }

    if (!quota) {
      setShowSuperlikeConfirm(true);
      return;
    }

    if (quota.remaining <= 0) {
      setShowSuperlikeLimit(true);
      return;
    }

    setShowSuperlikeConfirm(true);
  };

  const confirmSuperlike = async () => {
    setShowSparkles(true);
    setTimeout(() => toggleSuperlike(), 100);
    setTimeout(() => setShowSparkles(false), 2000);
  };

  const handleFavoriteClick = () => {
    setHeartScale(true);
    toggleFavorite();
    setTimeout(() => setHeartScale(false), 400);
  };

  const carTitle = `${year} ${make} ${model}${trim ? ` ${trim}` : ''}`;

  return (
    <div className={cn(
      "group relative flex overflow-hidden rounded-xl transition-all duration-300",
      isBlackMember 
        ? "bg-black border border-zinc-800 hover:border-zinc-700 hover:shadow-2xl" 
        : "bg-card dark:bg-zinc-950 border border-border/40 hover:border-border/60 hover:shadow-lg",
      className
    )}>
      {/* Subtle top accent line for Black Members */}
      {isBlackMember && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
      )}
      
      {/* Image Section */}
      <div className="p-3 w-80 flex-shrink-0">
        <Link href={`/listings/${id}`} className={cn(
          "relative aspect-[4/3] w-full overflow-hidden rounded-lg block",
          isBlackMember ? "bg-zinc-900" : "bg-muted/20"
        )}>
          <Image
            src={displayImage}
            alt={`${year} ${make} ${model}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="256px"
          />
        
          {/* Overlay Gradient */}
          <div className={cn(
            "absolute inset-0 transition-opacity duration-300",
            isBlackMember 
              ? "bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40 group-hover:opacity-60" 
              : "bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100"
          )} />
        
          {/* Badge */}
          {isBlackMember ? (
            <div className="absolute top-3 right-3 flex items-center px-3 py-1.5 bg-black border border-black">
              <span className="text-xs font-bold text-white tracking-widest">BLK</span>
            </div>
          ) : qiScore ? (
            <div className="absolute top-3 right-3 flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs backdrop-blur-md bg-background/90 border border-border/20">
              <span className="text-primary">QI</span>
              <span className="font-medium text-foreground">{Math.round(qiScore)}</span>
            </div>
          ) : null}
        </Link>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col px-6 py-5">
        <div className="flex items-start justify-between gap-6 flex-1">
          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <Link href={`/listings/${id}`} className="group/title block mb-4">
              <h3 className={cn(
                "text-lg font-semibold transition-colors line-clamp-1 tracking-tight",
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
                  "text-base line-clamp-1 mt-1.5",
                  isBlackMember ? "text-zinc-500" : "text-muted-foreground/70"
                )}>
                  {trim}
                </p>
              )}
            </Link>

            {/* Specs Grid */}
            <div className="flex items-center gap-8 mb-5">
              <div className="flex items-center gap-2.5">
                <p className={cn(
                  "text-xs uppercase tracking-wide",
                  isBlackMember ? "text-zinc-600" : "text-muted-foreground/60"
                )}>Mileage</p>
                <p className={cn(
                  "text-base font-semibold tabular-nums",
                  isBlackMember ? "text-zinc-200" : "text-foreground"
                )}>{formatMileage(mileage)} km</p>
              </div>
              
              <div className="flex items-center gap-2.5">
                <p className={cn(
                  "text-xs uppercase tracking-wide",
                  isBlackMember ? "text-zinc-600" : "text-muted-foreground/60"
                )}>Specs</p>
                <p className={cn(
                  "text-base font-semibold capitalize",
                  isBlackMember ? "text-zinc-200" : "text-foreground"
                )}>{displaySpecs}</p>
              </div>
              
              <div className="flex items-center gap-2.5">
                <p className={cn(
                  "text-xs uppercase tracking-wide",
                  isBlackMember ? "text-zinc-600" : "text-muted-foreground/60"
                )}>Location</p>
                <p className={cn(
                  "text-base font-semibold",
                  isBlackMember ? "text-zinc-200" : "text-foreground"
                )}>{emirate}</p>
              </div>
            </div>

          </div>

          {/* Price & Actions */}
          <div className="flex flex-col items-end justify-between gap-6">
            <p className={cn(
              "text-xl font-semibold whitespace-nowrap tracking-tight",
              isBlackMember ? "text-white" : "text-foreground"
            )}>
              {formatPrice(price)}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button 
                className={cn(
                  "rounded-full p-2 transition-colors",
                  isBlackMember
                    ? "text-zinc-500 hover:text-zinc-300"
                    : "text-muted-foreground/60 hover:text-foreground"
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
                      ? "text-zinc-500 hover:text-zinc-300"
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
              >
                <Heart
                  className={cn(
                    "h-4 w-4 transition-transform duration-300",
                    heartScale && "scale-150"
                  )}
                  strokeWidth={isFavorite ? 2.5 : 1.8}
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
                      ? "text-zinc-500 hover:text-zinc-300"
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
              >
                <Sparkles
                  className="h-4 w-4"
                  strokeWidth={isSuperliked ? 2.5 : 1.8}
                  fill={isSuperliked ? "currentColor" : "none"}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Dealer Info - Bottom */}
        <div className="flex items-center gap-2.5 pt-4 border-t border-border/20">
          <div className={cn(
            "relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0",
            isBlackMember ? "bg-zinc-800 ring-1 ring-zinc-700" : "bg-muted ring-1 ring-border/20"
          )}>
            <div className={cn(
              "w-full h-full flex items-center justify-center text-[10px] font-semibold",
              isBlackMember ? "text-zinc-400" : "text-muted-foreground"
            )}>
              {(partnerName || 'PS').substring(0, 2).toUpperCase()}
            </div>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className={cn(
              "text-sm font-medium truncate",
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
