/**
 * Car Card Minimal - Simple Thumbnail View
 * Just image, make/model, and seller info - no stats, price, or actions
 */

'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils';
import { getAppThumbUrl } from '@/utils/storage';
import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { BrandAvatar } from '@/components/partner/car-dealer/ui/brand-avatar';

interface CarCardMinimalProps {
  id: string;
  make: string;
  model: string;
  thumbnail?: string | null;
  images?: string[];
  isBlkListing?: boolean;
  // Seller info
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

export function CarCardMinimal({
  id,
  make,
  model,
  thumbnail,
  images,
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
}: CarCardMinimalProps) {
  // Use thumb URL for grid cards (480w, ~30-90KB) - bandwidth optimization
  const displayImage = getAppThumbUrl(thumbnail || images?.[0]);
  const displaySellerName = partnerName || sellerName || 'Private Seller';
  const isVerified = partnerVerified || kycVerified;
  const isPartnerListing = Boolean(partnerLogo || partnerName);

  return (
    <Link
      href={`/listings/${id}`}
      prefetch={false}
      className={cn(
        'group flex flex-col overflow-hidden rounded-[20px] transition-all',
        isBlkListing 
          ? 'bg-background border border-border/40 hover:border-border/60 hover:shadow-lg hover:shadow-black/20' 
          : 'bg-card border border-border/30 hover:border-border/50 hover:shadow-sm',
        className
      )}
    >
      {/* Image - Compact */}
      <div className="mx-1 mt-1">
        <div className={cn(
          "relative w-full aspect-[16/9] overflow-hidden rounded-[20px]",
          isBlkListing ? "bg-black" : "bg-surface-secondary"
        )}>
          {displayImage ? (
            <img
              src={displayImage}
              alt={`${make} ${model}`}
              className="absolute inset-0 h-full w-full object-cover"
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'auto'}
              decoding="auto"
            />
          ) : (
            <div className="absolute inset-0 bg-muted/30" />
          )}
        </div>
      </div>

      {/* Content - Clean & Minimal */}
      <div className="flex items-center justify-between gap-3 p-3">
        {/* Left - Text */}
        <div className="min-w-0 flex-1 space-y-1">
          {/* Make/Model */}
          <p className={cn(
            "text-subhead font-bold truncate",
            isBlkListing ? "text-black dark:text-white" : "text-foreground"
          )}>
            {make} {model}
          </p>
          
          {/* Seller row */}
          <div className="flex items-center gap-1.5">
            <p className={cn(
              "text-caption1 font-semibold truncate",
              isBlkListing ? "text-black/60 dark:text-white/60" : "text-muted-foreground"
            )}>
              {displaySellerName}
            </p>
            {isBlackTierPartner ? (
              <span className="flex-shrink-0 px-1 h-3.5 inline-flex items-center text-[7px] font-black tracking-widest uppercase bg-black text-white border border-white/10">
                BLK
              </span>
            ) : isVerified && (
              <CheckCircle2 className="w-3 h-3 flex-shrink-0 text-primary" />
            )}
          </div>
        </div>

        {/* Right - Avatar */}
        {isBlackTierPartner ? (
          <div className="flex-shrink-0 rounded-full ring-2 ring-black ring-offset-1 ring-offset-background">
            {isPartnerListing ? (
              <BrandAvatar
                logoUrl={partnerLogo}
                brandName={displaySellerName}
                size="xs"
                className={cn(
                  "w-8 h-8",
                  isBlkListing ? "bg-black/10 dark:bg-white/10 border-black/10 dark:border-white/10" : "bg-muted/40 border-border/40"
                )}
              />
            ) : (
              <UserAvatar
                src={sellerAvatarUrl}
                name={displaySellerName}
                size="sm"
                className={cn(
                  "w-8 h-8",
                  isBlkListing ? "bg-black/10 dark:bg-white/10 border-black/10 dark:border-white/10 text-black/50 dark:text-white/50" : "bg-muted/40 border-border/40 text-muted-foreground/70"
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
              "w-8 h-8 flex-shrink-0",
              isBlkListing ? "bg-black/10 dark:bg-white/10 border-black/10 dark:border-white/10" : "bg-muted/40 border-border/40"
            )}
          />
        ) : (
          <UserAvatar
            src={sellerAvatarUrl}
            name={displaySellerName}
            size="sm"
            className={cn(
              "w-8 h-8 flex-shrink-0",
              isBlkListing ? "bg-black/10 dark:bg-white/10 border-black/10 dark:border-white/10 text-black/50 dark:text-white/50" : "bg-muted/40 border-border/40 text-muted-foreground/70"
            )}
          />
        )}
      </div>
    </Link>
  );
}

// ============================================================================
// SKELETON
// ============================================================================

interface CarCardMinimalSkeletonProps {
  className?: string;
}

function CarCardMinimalSkeletonComponent({ className }: CarCardMinimalSkeletonProps) {
  return (
    <div className={cn(
      "flex flex-col overflow-hidden rounded-[20px] w-full",
      "bg-sidebar border border-sidebar-border",
      className
    )}>
      {/* Image */}
      <div className="mx-1 mt-1">
        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-[20px]">
          <Skeleton className="absolute inset-0" />
        </div>
      </div>

      {/* Content - Clean & Minimal */}
      <div className="flex items-center justify-between gap-3 p-3">
        {/* Left - Text */}
        <div className="min-w-0 flex-1 space-y-1">
          {/* Make/Model */}
          <Skeleton className="h-3.5 w-24" />
          {/* Seller name */}
          <Skeleton className="h-3 w-20" />
        </div>

        {/* Right - Avatar */}
        <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
      </div>
    </div>
  );
}

CarCardMinimal.Skeleton = CarCardMinimalSkeletonComponent;
