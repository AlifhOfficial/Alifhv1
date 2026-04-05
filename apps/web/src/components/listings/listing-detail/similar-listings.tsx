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

import { useRef, useState, useEffect } from 'react';
import { CarCardMinimal } from '@/components/inventory';
import { useSimilarListings } from '@/hooks/listings';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils';
import type { SimilarListingCard } from '@/hooks/listings/use-similar-listings';

interface SimilarListingsProps {
  listingId: string;
  /** Only fetch when main listing is loaded */
  enabled?: boolean;
  className?: string;
  initialListings?: SimilarListingCard[];
}

export function SimilarListings({ 
  listingId, 
  enabled = true,
  className,
  initialListings,
}: SimilarListingsProps) {
  const { listings, isLoading } = useSimilarListings(listingId, { enabled, initialData: initialListings });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showArrows, setShowArrows] = useState(false);

  // Check if content overflows container (needs scroll arrows)
  useEffect(() => {
    const checkOverflow = () => {
      if (scrollContainerRef.current) {
        const { scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowArrows(scrollWidth > clientWidth + 10); // 10px buffer
      }
    };
    
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [listings]);

  // Don't render anything if no listings and not loading
  if (!isLoading && listings.length === 0) {
    return null;
  }

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 300; // Card width + gap
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className={cn('py-8 border-t border-border', className)}>
      {/* Section Header with Nav Buttons */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-headline font-bold tracking-tight text-foreground">
          Similar Price Range
        </h2>
        
        {/* Desktop Nav Arrows - only show when content overflows */}
        {!isLoading && showArrows && (
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
        <div className="flex gap-5 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-[260px] sm:w-[280px]">
              <CarCardMinimal.Skeleton />
            </div>
          ))}
        </div>
      )}

      {/* Horizontal Scrollable Carousel - more breathable spacing */}
      {!isLoading && listings.length > 0 && (
        <div
          ref={scrollContainerRef}
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {listings.map((listing) => (
            <div 
              key={listing.id} 
              className="flex-shrink-0 w-[260px] sm:w-[280px] snap-start"
            >
              <CarCardMinimal
                id={listing.id}
                make={listing.make}
                model={listing.model}
                thumbnail={listing.thumbnail}
                isBlkListing={listing.isBlkListing}
                partnerName={listing.partnerName ?? undefined}
                partnerLogo={listing.partnerLogo}
                partnerVerified={listing.partnerVerified ?? undefined}
                isBlackTierPartner={listing.isBlackTierPartner}
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
