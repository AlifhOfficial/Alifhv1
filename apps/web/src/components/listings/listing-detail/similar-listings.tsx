/**
 * Similar Price Range Section
 * 
 * Displays up to 4 vehicles in a similar price range (±15%).
 * Shows nothing if no quality matches (intentional - trust over engagement).
 * 
 * Philosophy:
 * - Title: "Similar Price Range" — helps users discover alternatives
 * - Horizontal scroll with snap points
 * - Non-blocking load with skeleton
 * - Graceful degradation (errors = invisible)
 */

'use client';

import { useRef } from 'react';
import { CarCard } from '@/components/inventory';
import { useSimilarListings } from '@/hooks/listings';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils';

interface SimilarListingsProps {
  listingId: string;
  /** Only fetch when main listing is loaded */
  enabled?: boolean;
  className?: string;
}

export function SimilarListings({ 
  listingId, 
  enabled = true,
  className 
}: SimilarListingsProps) {
  const { listings, isLoading } = useSimilarListings(listingId, { enabled });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Don't render anything if no listings and not loading
  if (!isLoading && listings.length === 0) {
    return null;
  }

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 320; // Card width + gap
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className={cn('py-8 border-t border-border', className)}>
      {/* Section Header with Nav Buttons */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Similar Price Range
        </h2>
        
        {/* Desktop Nav Arrows */}
        {!isLoading && listings.length > 2 && (
          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => scroll('left')}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => scroll('right')}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Loading State - Horizontal Skeleton */}
      {isLoading && (
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-[280px] sm:w-[300px]">
              <SimilarListingSkeleton />
            </div>
          ))}
        </div>
      )}

      {/* Horizontal Scrollable Carousel */}
      {!isLoading && listings.length > 0 && (
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {listings.map((listing) => (
            <div 
              key={listing.id} 
              className="flex-shrink-0 w-[280px] sm:w-[300px] snap-start"
            >
              <CarCard
                id={listing.id}
                make={listing.make}
                model={listing.model}
                year={listing.year}
                trim={listing.trim}
                price={listing.price}
                mileage={listing.mileage}
                emirate={listing.emirate}
                specs={listing.specs}
                thumbnail={listing.thumbnail}
                qiScore={listing.qiScore}
                isBlkListing={listing.isBlkListing}
                partnerName={listing.partnerName ?? undefined}
                partnerLogo={listing.partnerLogo}
                partnerVerified={listing.partnerVerified ?? undefined}
                sellerName={listing.sellerName}
                sellerAvatarUrl={listing.sellerAvatarUrl}
                kycVerified={listing.sellerKycVerified ?? undefined}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * Skeleton for similar listing cards
 */
function SimilarListingSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[16/10] w-full rounded-xl" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
