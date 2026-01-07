/**
 * Navbar Favorites - Quick access to favorite listings
 * Shows recent favorites with count badge
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Heart, ChevronRight, Loader2, Moon } from 'lucide-react';
import { useFavoritesStatus } from '@/hooks/engagement';
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

export function NavbarFavorites({ userId: _userId }: NavbarFavoritesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [listings, setListings] = useState<ListingPayload[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  
  const { data: favoritesData, isLoading } = useFavoritesStatus();

  const favoriteIds = useMemo(() => favoritesData?.favorites || [], [favoritesData?.favorites]);
  
  // Count only shows valid listings (not deleted ones)
  // This prevents showing "1 saved" when the listing no longer exists
  const favoriteCount = listings.length > 0 ? listings.length : (isLoadingListings ? favoriteIds.length : 0);

  // Fetch listings function
  const fetchListings = useCallback(async (ids: string[]) => {
    if (!ids.length) {
      setListings([]);
      setIsLoadingListings(false);
      return;
    }
    setIsLoadingListings(true);
    try {
      const res = await fetch(`/api/listings/car-card?ids=${encodeURIComponent(ids.join(','))}`, {
        credentials: 'include',
      });
      const data = await res.json();
      setListings(data.data || []);
    } catch {
      setListings([]);
    } finally {
      setIsLoadingListings(false);
    }
  }, []);

  // Load listing details on mount and when favorites change
  useEffect(() => {
    if (!favoriteIds.length) {
      setListings([]);
      return;
    }
    
    // Only fetch top 3
    const topIds = favoriteIds.slice(0, 3);
    fetchListings(topIds);
  }, [favoriteIds, fetchListings]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-favorites-dropdown]')) {
        setIsOpen(false);
      }
    };
    
    setTimeout(() => document.addEventListener('click', handleClick), 0);
    return () => document.removeEventListener('click', handleClick);
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

  // Format price
  const formatPrice = (price: number | null) => {
    if (!price) return 'Price TBD';
    return `AED ${price.toLocaleString()}`;
  };

  return (
    <div className="relative" data-favorites-dropdown>
      {/* Trigger Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md"
        aria-label="Favorites"
      >
        <Heart className="size-4" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[60]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-sidebar/95 backdrop-blur-md border border-sidebar-border rounded-xl shadow-lg z-[70] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-sidebar-border">
            <h3 className="text-base font-semibold tracking-tight text-sidebar-foreground">
              Favorites
            </h3>
            {favoriteCount > 0 && (
              <span className="text-[13px] font-medium text-muted-foreground">
                {favoriteCount} saved
              </span>
            )}
          </div>

          {/* Content */}
          <div className="max-h-[360px] overflow-y-auto">
            {isLoading || isLoadingListings ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : favoriteCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Moon className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-[15px] font-medium text-muted-foreground">No favorites yet</p>
                <p className="text-[13px] text-muted-foreground/70 mt-1.5 leading-relaxed">
                  Heart some cars and they&apos;ll appear here
                </p>
              </div>
            ) : (
              <div className="py-1.5">
                {listings.map((listing) => (
                  <FavoritePreviewItem
                    key={listing.id}
                    listing={listing}
                    formatPrice={formatPrice}
                    onClose={() => setIsOpen(false)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-sidebar-border">
            <Link
              href="/user-dashboard/favorites"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-3.5 text-[14px] font-medium text-primary hover:bg-sidebar-accent transition-colors"
            >
              View all favorites
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
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
  formatPrice: (price: number | null) => string;
  onClose: () => void;
}

function FavoritePreviewItem({ listing, formatPrice, onClose }: FavoritePreviewItemProps) {
  const { id, make, model, year, price, thumbnail } = listing;
  
  const title = [year, make, model].filter(Boolean).join(' ') || 'Vehicle';

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
        <h4 className="text-[15px] font-medium text-sidebar-foreground truncate">
          {title}
        </h4>
        <p className="text-[14px] text-muted-foreground/80 mt-0.5">
          {formatPrice(price)}
        </p>
      </div>
    </Link>
  );
}
