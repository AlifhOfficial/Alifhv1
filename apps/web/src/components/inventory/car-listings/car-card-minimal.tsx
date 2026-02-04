/**
 * Car Card Minimal - Simple Thumbnail View
 * Just image, make/model, and seller info - no stats, price, or actions
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils';
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
  const displayImage = thumbnail || images?.[0] || '/assets/cars/car1.avif';
  const displaySellerName = partnerName || sellerName || 'Private Seller';
  const isVerified = partnerVerified || kycVerified;
  const isPartnerListing = Boolean(partnerLogo || partnerName);

  return (
    <Link
      href={`/listings/${id}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg transition-all',
        isBlkListing 
          ? 'bg-black border border-zinc-800 hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-900/50' 
          : 'bg-sidebar border border-sidebar-border hover:border-sidebar-border/80 hover:shadow-sm',
        className
      )}
    >      {/* Image - Compact */}
      <div className={cn(
        "relative aspect-[16/9] sm:aspect-[16/10] w-full overflow-hidden",
        isBlkListing ? "bg-zinc-900" : "bg-muted/20"
      )}>
        <Image
          src={displayImage}
          alt={`${make} ${model}`}
          fill
          priority={priority}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
      </div>

      {/* Content - Clean & Minimal */}
      <div className="flex items-center justify-between gap-3 p-3">
        {/* Left - Text */}
        <div className="min-w-0 flex-1 space-y-1">
          {/* Make/Model */}
          <p className={cn(
            "text-sm font-bold truncate",
            isBlkListing ? "text-white" : "text-foreground"
          )}>
            {make} {model}
          </p>
          
          {/* Seller row */}
          <div className="flex items-center gap-1.5">
            <p className={cn(
              "text-xs font-semibold truncate",
              isBlkListing ? "text-zinc-500" : "text-muted-foreground"
            )}>
              {displaySellerName}
            </p>
            {isBlackTierPartner ? (
              <span className="flex-shrink-0 px-1 h-3.5 inline-flex items-center text-[7px] font-black tracking-widest uppercase bg-black text-white border border-zinc-700">
                BLK
              </span>
            ) : isVerified && (
              <CheckCircle2 className="w-3 h-3 flex-shrink-0 text-blue-500" />
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
                  isBlkListing ? "bg-zinc-800 border-zinc-700" : "bg-muted/40 border-border/40"
                )}
              />
            ) : (
              <UserAvatar
                src={sellerAvatarUrl}
                name={displaySellerName}
                size="sm"
                className={cn(
                  "w-8 h-8",
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
              "w-8 h-8 flex-shrink-0",
              isBlkListing ? "bg-zinc-800 border-zinc-700" : "bg-muted/40 border-border/40"
            )}
          />
        ) : (
          <UserAvatar
            src={sellerAvatarUrl}
            name={displaySellerName}
            size="sm"
            className={cn(
              "w-8 h-8 flex-shrink-0",
              isBlkListing ? "bg-zinc-800 border-zinc-700 text-zinc-500" : "bg-muted/40 border-border/40 text-muted-foreground/70"
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
      "flex flex-col overflow-hidden rounded-lg w-full",
      "bg-sidebar border border-sidebar-border",
      className
    )}>
      {/* Image */}
      <Skeleton className="aspect-[16/9] sm:aspect-[16/10] w-full" />

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
