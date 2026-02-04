/**
 * Car Card Black Component - Revvup Design System
 * Minimal showcase card for BLK listings
 * 
 * Design: "Less is More" - Only shows:
 * - Car thumbnail (clean, no badges)
 * - Dealer avatar + name on hover overlay
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { BrandAvatar } from '@/components/partner/car-dealer/ui/brand-avatar';

interface CarCardBlackProps {
  id: string;
  make: string;
  model: string;
  year: number;
  thumbnail?: string | null;
  images?: string[];
  // Partner/Dealer info
  partnerName?: string;
  partnerLogo?: string | null;
  sellerName?: string | null;
  sellerAvatarUrl?: string | null;
  className?: string;
  priority?: boolean;
}

/**
 * Minimal BLK showcase card
 * Clean design: thumbnail + dealer info on hover
 */
export function CarCardBlack({
  id,
  make,
  model,
  year,
  thumbnail,
  images,
  partnerName,
  partnerLogo,
  sellerName,
  sellerAvatarUrl,
  className,
  priority = false,
}: CarCardBlackProps) {
  const displayImage = thumbnail || images?.[0] || '/assets/cars/car1.avif';
  const displaySellerName = partnerName || sellerName || 'Private Seller';
  const isPartnerListing = Boolean(partnerLogo || partnerName);

  return (
    <Link 
      href={`/listings/${id}`}
      className={cn(
        "group relative block overflow-hidden rounded-lg",
        "aspect-[4/3] w-full",
        "bg-muted/20",
        className
      )}
    >
      {/* Image */}
      <Image
        src={displayImage}
        alt={`${year} ${make} ${model}`}
        fill
        priority={priority}
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      
      {/* Hover Overlay - Dealer Info */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-3">
            {isPartnerListing ? (
              <BrandAvatar
                logoUrl={partnerLogo}
                brandName={displaySellerName}
                size="xs"
                className="w-10 h-10 flex-shrink-0 ring-2 ring-white/20"
              />
            ) : (
              <UserAvatar
                src={sellerAvatarUrl}
                name={displaySellerName}
                size="sm"
                className="w-10 h-10 flex-shrink-0 ring-2 ring-white/20"
              />
            )}
            <span className="text-sm font-medium text-white truncate">
              {displaySellerName}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
