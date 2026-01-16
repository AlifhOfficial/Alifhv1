'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { CarCard } from '@/components/inventory';
import { SuperlikeQuotaBadge } from '@/components/engagement';
import { useFavoritesStatus } from '@/hooks/engagement';
import { DashboardPageWrapper, DashboardPageHeader } from '@/components/shared/layout/dashboard-page-wrapper';

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
  isBlkListing: boolean | null;
  sellerName?: string | null;
  sellerAvatarUrl?: string | null;
  sellerKycVerified?: boolean | null;
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
      cache: 'no-store', // Prevent Safari caching issues
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
  // LIFO - newest superlikes first (API returns in this order)
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
    <DashboardPageWrapper>
      {/* Header */}
      <DashboardPageHeader
        title="Superlikes"
        description={`${validSuperlikeIds.length} saved`}
      >
        <SuperlikeQuotaBadge quota={quota} />
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg hover:bg-sidebar transition-colors disabled:opacity-50"
          aria-label="Refresh superlikes"
        >
          <RefreshCw className={`h-4 w-4 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </DashboardPageHeader>

      {/* Loading State */}
      {(isLoading || isLoadingListings) && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {superlikeError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm text-red-500">
            {superlikeError?.message || 'Failed to load superlikes'}
          </p>
        </div>
      )}

      {/* Content */}
      {!isLoading && !isLoadingListings && !superlikeError && (
        <>
          {validSuperlikeIds.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-sidebar flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-muted-foreground/40" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">No superlikes yet</p>
                  <p className="text-sm text-muted-foreground/60">
                    Superlike listings to show extra interest
                  </p>
                </div>
              </div>
            </div>
          ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3 sm:gap-4 lg:gap-5">
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
                      isBlkListing={listing.isBlkListing ?? undefined}
                      partnerName={listing.partnerName ?? undefined}
                      partnerLogo={listing.partnerLogo ?? undefined}
                      partnerVerified={listing.partnerVerified ?? undefined}
                      sellerName={listing.sellerName ?? undefined}
                      sellerAvatarUrl={listing.sellerAvatarUrl ?? undefined}
                      kycVerified={listing.sellerKycVerified ?? undefined}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
    </DashboardPageWrapper>
  );
}
