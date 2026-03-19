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
import { getAppThumbUrl } from '@/utils/storage';
import { getNavbarFavoriteListings } from '@/actions/favorites';

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

export function NavbarFavorites({ userId }: NavbarFavoritesProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const { isSignedIn } = useUser();
  
  // Reads from server-seeded cache; refetches after invalidation (e.g. toggle favorite)
  const { data: favoritesData, isLoading: isLoadingFavorites } = useFavoritesStatus({ enabled: isSignedIn });
  const favoriteIds = useMemo(() => favoritesData?.favorites ?? [], [favoritesData?.favorites]);
  const count = favoriteIds.length;

  // Top 3 IDs to show in the dropdown preview
  const top3Ids = useMemo(() => favoriteIds.slice(0, 3), [favoriteIds]);

  const { data: orderedListings = [], isLoading: isLoadingListings } = useQuery<ListingPayload[]>({
    queryKey: ['navbar-favorites-listings', ...top3Ids],
    queryFn: () => getNavbarFavoriteListings(top3Ids),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: isSignedIn && top3Ids.length > 0,
  });

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

  if (!isSignedIn || !userId) {
    return null;
  }

  return (
    <div className="relative hidden sm:block" data-favorites-dropdown>
      {/* Trigger Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleToggle();
        }}
        className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
        aria-label="Favorites"
      >
        <Heart className="size-4" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-14 sm:top-full sm:mt-3 sm:w-96 bg-sidebar border border-sidebar-border rounded-2xl shadow-xl z-[70] overflow-hidden">
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
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : count === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Heart className="w-12 h-12 text-muted-foreground/40 mb-3" />
                <p className="text-[15px] font-semibold text-foreground/80">No favorites yet</p>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
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
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Heart className="w-12 h-12 text-muted-foreground/40 mb-3" />
                <p className="text-[15px] font-semibold text-foreground/80">No favorites yet</p>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Your dream garage awaits
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
                className="flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold text-primary hover:bg-sidebar-accent transition-colors"
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
  const thumbnailUrl = getAppThumbUrl(thumbnail);
  
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
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
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
