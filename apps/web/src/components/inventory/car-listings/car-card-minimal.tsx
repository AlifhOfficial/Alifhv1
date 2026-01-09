/**
 * Car Card Minimal - Simple Thumbnail View
 * Just image, make/model, and seller info - no stats, price, or actions
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/utils';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { BrandAvatar } from '@/components/partner/car-dealer/ui/brand-avatar';

interface CarCardMinimalProps {
  id: string;
  make: string;
  model: string;
  thumbnail?: string | null;
  images?: string[];
  // Seller info
  partnerName?: string;
  partnerLogo?: string | null;
  sellerName?: string | null;
  sellerAvatarUrl?: string | null;
  className?: string;
  priority?: boolean;
}

export function CarCardMinimal({
  id,
  make,
  model,
  thumbnail,
  images,
  partnerName,
  partnerLogo,
  sellerName,
  sellerAvatarUrl,
  className,
  priority = false,
}: CarCardMinimalProps) {
  const displayImage = thumbnail || images?.[0] || '/assets/cars/car1.avif';
  const displaySellerName = partnerName || sellerName || 'Private Seller';
  const isPartnerListing = Boolean(partnerLogo || partnerName);

  return (
    <Link
      href={`/listings/${id}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg bg-sidebar border border-sidebar-border hover:border-sidebar-border/80 hover:shadow-sm transition-all',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-muted/20">
        <Image
          src={displayImage}
          alt={`${make} ${model}`}
          fill
          priority={priority}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
      </div>

      {/* Content */}
      <div className="flex items-center gap-2 p-2.5">
        {isPartnerListing ? (
          <BrandAvatar
            logoUrl={partnerLogo}
            brandName={displaySellerName}
            size="xs"
            className="w-6 h-6 flex-shrink-0 bg-sidebar-accent border-sidebar-border"
          />
        ) : (
          <UserAvatar
            src={sellerAvatarUrl}
            name={displaySellerName}
            size="sm"
            className="w-6 h-6 flex-shrink-0 bg-sidebar-accent border-sidebar-border text-sidebar-foreground/70"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">
            {make} {model}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {displaySellerName}
          </p>
        </div>
      </div>
    </Link>
  );
}
