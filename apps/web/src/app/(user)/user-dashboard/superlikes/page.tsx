'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Loader2, RefreshCw } from 'lucide-react';
import { CarCard } from '@/components/inventory';
import { DashboardPageLayout } from '@/components/layout';
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

  return (
    <DashboardPageLayout
      title={
        <div className="flex items-center gap-3">
          <span>Superlikes</span>
          <SuperlikeQuotaBadge quota={quota} />
        </div>
      }
      headerActions={
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Refresh superlikes"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      }
    >

        {(isLoading || isLoadingListings) && (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <p>Loading your superlikes…</p>
          </div>
        )}
        {superlikeError && <p className="text-destructive">{superlikeError?.message || 'Failed to load superlikes'}</p>}

        {!isLoading && !isLoadingListings && !superlikeError && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <small className="text-muted-foreground/70">{validSuperlikeIds.length} item{validSuperlikeIds.length === 1 ? '' : 's'}</small>
            </div>

            {validSuperlikeIds.length === 0 ? (
              <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center space-y-3">
                  <svg className="w-16 h-16 mx-auto text-muted-foreground/40" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C10.34 2 9 3.34 9 5c0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.66-1.34-3-3-3zM9 5c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm6 0c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm-3 3c-3.87 0-7 3.13-7 7v5c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-5c0-3.87-3.13-7-7-7z"/>
                  </svg>
                  <p className="text-muted-foreground">No superlikes yet</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
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
          </section>
        )}
    </DashboardPageLayout>
  );
}
