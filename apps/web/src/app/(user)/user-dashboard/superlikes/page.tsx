'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Loader2, RefreshCw, Star, Moon } from 'lucide-react';
import { CarCard } from '@/components/inventory';
import { SuperlikeQuotaBadge } from '@/components/engagement';
import { useFavoritesStatus } from '@/hooks/engagement';

type SuperlikeQuota = {
  currentMonthSuperlikesUsed: number;
  maxSuperlikesPerMonth: number;
  premiumSuperlikesBonus: number;
  totalSuperlikesUsed: number;
  periodEndDate?: string | Date | null;
  periodStartDate?: string | Date | null;
  remaining: number;
};

type ListingPayload = {
  id: string;
  make: string | null;
  model: string | null;
  year: number | null;
  trim: string | null;
  price: number | null;
  mileage: number | null;
  emirate: string | null;
  specs: string | null;
  thumbnail: string | null;
  images?: string[] | null; // Optional: Not returned in car-card API, lazy-loaded separately
  qiScore: number | null;
  partnerName: string | null;
  partnerLogo?: string | null;
  partnerVerified: boolean | null;
  isBlackMember: boolean | null;
  sellerName?: string | null;
  sellerAvatarUrl?: string | null;
};

type SuperlikesResponse = {
  favorites?: string[];
  superlikes?: string[];
  quota?: Omit<SuperlikeQuota, 'remaining'>;
  error?: string;
};

type CarCardResponse = {
  data: ListingPayload[];
  error?: string;
};

export default function SuperlikesPage() {
  const { data: statusData, isLoading, error: superlikeError, refetch } = useFavoritesStatus();
  const [listings, setListings] = useState<ListingPayload[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasFetchedRef = useRef(false);

  const superlikeIds = useMemo(() => statusData?.superlikes || [], [statusData?.superlikes]);
  const quota = statusData?.quota || null;

  // Load listing details when superlike IDs change
  useEffect(() => {
    if (!superlikeIds.length) {
      setListings([]);
      hasFetchedRef.current = false;
      return;
    }

    if (hasFetchedRef.current) return;

    hasFetchedRef.current = true;
    setIsLoadingListings(true);

    fetch(`/api/listings/car-card?ids=${encodeURIComponent(superlikeIds.join(','))}`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then((data: CarCardResponse) => setListings(data.data || []))
      .catch(() => setListings([]))
      .finally(() => setIsLoadingListings(false));
  }, [superlikeIds]);

  const listingsById = useMemo(() => {
    const map = new Map<string, ListingPayload>();
    listings.forEach((l) => {
      if (l?.id) map.set(l.id, l);
    });
    return map;
  }, [listings]);

  // Filter to only IDs that have valid listing data (excludes deleted listings)
  const validSuperlikeIds = useMemo(() => 
    superlikeIds.filter(id => listingsById.has(id)), 
    [superlikeIds, listingsById]
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    hasFetchedRef.current = false;
    await refetch();
    setTimeout(() => setIsRefreshing(false), 300);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Superlikes</h1>
            <p className="text-sm text-muted-foreground/70">
              {validSuperlikeIds.length} item{validSuperlikeIds.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <SuperlikeQuotaBadge quota={quota} />
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-full hover:bg-secondary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Refresh superlikes"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {(isLoading || isLoadingListings) && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin border-foreground" />
          </div>
        )}

        {/* Error State */}
        {superlikeError && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
            <p className="text-sm text-red-500">
              {superlikeError?.message || 'Failed to load superlikes'}
            </p>
          </div>
        )}

        {/* Content */}
        {!isLoading && !isLoadingListings && !superlikeError && (
          <>
            {validSuperlikeIds.length === 0 ? (
              <div className="flex items-center justify-center py-24">
                <div className="flex flex-col items-center text-center space-y-4 max-w-sm">
                  <Moon className="w-16 h-16 text-muted-foreground/20" />
                  <div className="space-y-2">
                    <h2 className="text-lg font-medium text-muted-foreground">Such empty here</h2>
                    <p className="text-sm text-muted-foreground/60">
                      Superlike some cars and they'll appear here
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                {validSuperlikeIds.map((listingId) => {
                  const listing = listingsById.get(listingId)!;
                  
                  return (
                    <CarCard
                      key={listingId}
                      id={listing.id}
                      make={listing.make ?? ''}
                      model={listing.model ?? ''}
                      year={listing.year ?? undefined}
                      trim={listing.trim ?? undefined}
                      price={listing.price ?? undefined}
                      mileage={listing.mileage ?? undefined}
                      emirate={listing.emirate ?? undefined}
                      specs={listing.specs ?? undefined}
                      thumbnail={listing.thumbnail ?? undefined}
                      images={listing.images ?? undefined}
                      qiScore={listing.qiScore ?? undefined}
                      partnerName={listing.partnerName ?? undefined}
                      partnerLogo={listing.partnerLogo ?? undefined}
                      partnerVerified={listing.partnerVerified ?? undefined}
                      sellerName={listing.sellerName ?? undefined}
                      sellerAvatarUrl={listing.sellerAvatarUrl ?? undefined}
                      isBlackMember={listing.isBlackMember ?? undefined}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
  );
}
