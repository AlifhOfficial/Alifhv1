/**
 * Navbar Favorites - Quick access to favorite listings
 * Shows recent favorites
 */

'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Heart, ChevronRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useFavoritesStatus } from '@/hooks/engagement';
import { useUser } from '@/hooks/auth/use-auth';
import Link from 'next/link';
import Image from 'next/image';

interface NavbarFavoritesProps {
  userId?: string;
}

type ListingPayload = {
  id: string;
  make: string | null;
  model: string | null;
  year: number | null;
  price: number | null;
  thumbnail: string | null;
};

async function fetchNavbarListings(ids: string[]): Promise<ListingPayload[]> {
  if (!ids.length) return [];
  // Take the 3 most recent favorites
  const topIds = ids.slice(0, 3);
  const res = await fetch(`/api/listings/car-card?ids=${encodeURIComponent(topIds.join(','))}`, {
    credentials: 'include',
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

export function NavbarFavorites({ userId: _userId }: NavbarFavoritesProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const { isSignedIn } = useUser();
  
  // Only fetch when dropdown is open AND signed in (lazy load)
  const { data: favoritesData, isLoading: isLoadingFavorites } = useFavoritesStatus({ enabled: isSignedIn && isOpen });
  const favoriteIds = favoritesData?.favorites ?? [];
  const count = favoriteIds.length;

  // Fetch listings for navbar - only when dropdown is open
  const { data: listings = [], isLoading: isLoadingListings } = useQuery({
    queryKey: ['navbar-favorites-listings'],
    queryFn: () => fetchNavbarListings(favoriteIds),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Only fetch when dropdown is open and we have favorites
    enabled: isOpen && favoriteIds.length > 0,
  });

  // Create a map for quick lookup, then order by favoriteIds (preserves order)
  const listingsById = useMemo(() => {
    const map = new Map<string, ListingPayload>();
    listings.forEach((l) => {
      if (l?.id) map.set(l.id, l);
    });
    return map;
  }, [listings]);

  // Get top 3 favorites in correct order
  const orderedListings = useMemo(() => {
    return favoriteIds
      .slice(0, 3)
      .map(id => listingsById.get(id))
      .filter((l): l is ListingPayload => l !== undefined);
  }, [favoriteIds, listingsById]);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-favorites-dropdown]')) {
        setIsOpen(false);
      }
    };
    
    // setTimeout is critical for Safari - allows the click event that opened
    // the dropdown to complete before we start listening for outside clicks
    const timeoutId = setTimeout(() => document.addEventListener('click', handleClick), 0);
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClick);
    };
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const isLoading = isLoadingFavorites || isLoadingListings;

  return (
    <div className="relative" data-favorites-dropdown>
      {/* Trigger Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleToggle();
        }}
        className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md"
        aria-label="Favorites"
      >
        <Heart className="size-4" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-14 sm:top-full sm:mt-2 sm:w-96 bg-sidebar border border-sidebar-border rounded-xl shadow-xl z-[70] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-sidebar-border">
            <h3 className="text-[15px] font-semibold tracking-tight text-sidebar-foreground">
              Favorites
            </h3>
          </div>

          {/* Content */}
          <div className="max-h-[360px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : count === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                <Heart className="w-8 h-8 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Your dream garage awaits
                </p>
              </div>
            ) : orderedListings.length > 0 ? (
              <div className="py-1.5">
                {orderedListings.map((listing) => (
                  <FavoritePreviewItem
                    key={listing.id}
                    listing={listing}
                    onClose={() => setIsOpen(false)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                <Heart className="w-8 h-8 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Unable to load favorites
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {count > 0 && (
            <div className="border-t border-sidebar-border">
              <Link
                href="/user-dashboard/favorites"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-primary hover:bg-sidebar-accent transition-colors"
              >
                View all favorites
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Favorite Preview Item
// ============================================================================

interface FavoritePreviewItemProps {
  listing: ListingPayload;
  onClose: () => void;
}

function FavoritePreviewItem({ listing, onClose }: FavoritePreviewItemProps) {
  const { id, make, model, year, price, thumbnail } = listing;
  
  const title = [year, make, model].filter(Boolean).join(' ') || 'Vehicle';
  const priceText = price ? `AED ${price.toLocaleString()}` : 'Price TBD';

  return (
    <Link
      href={`/listings/${id}`}
      onClick={onClose}
      className="flex items-center gap-3 px-4 py-3 hover:bg-sidebar-accent transition-colors"
    >
      {/* Thumbnail */}
      <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Heart className="w-4 h-4 text-muted-foreground/40" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-sidebar-foreground truncate">
          {title}
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          {priceText}
        </p>
      </div>
    </Link>
  );
}
