'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Loader2, RefreshCw } from 'lucide-react';
import { CarCard } from '@/components/inventory/car-card';
import { DashboardPageLayout } from '@/components/layout';
import { SuperlikeQuotaBadge } from '@/components/inventory/superlike-quota-badge';
import { useSuperlikesOnly, useSuperlikeQuota } from '@/hooks/favorites/use-superlikes-simple';

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
  partnerVerified: boolean | null;
  isBlackMember: boolean | null;
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
  const { data: superlikesData, isLoading, error: superlikeError, refetch } = useSuperlikesOnly();
  const { data: quotaData } = useSuperlikeQuota();
  const [listings, setListings] = useState<ListingPayload[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const hasFetchedRef = useRef(false);

  const superlikeIds = useMemo(() => superlikesData?.superlikes || [], [superlikesData?.superlikes]);
  const quota = quotaData || null;

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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading your superlikes…
          </div>
        )}
        {superlikeError && <p className="text-sm text-destructive">{superlikeError?.message || 'Failed to load superlikes'}</p>}

        {!isLoading && !isLoadingListings && !superlikeError && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{superlikeIds.length} item{superlikeIds.length === 1 ? '' : 's'}</span>
            </div>

            {superlikeIds.length === 0 ? (
              <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center space-y-3">
                  <svg className="w-16 h-16 mx-auto text-muted-foreground/40" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C10.34 2 9 3.34 9 5c0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.66-1.34-3-3-3zM9 5c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm6 0c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm-3 3c-3.87 0-7 3.13-7 7v5c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-5c0-3.87-3.13-7-7-7z"/>
                  </svg>
                  <p className="text-sm text-muted-foreground">No superlikes yet</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {superlikeIds.map((listingId) => {
                  const listing = listingsById.get(listingId);
                  if (!listing) {
                    return (
                      <div key={listingId} className="rounded-lg border border-border bg-card p-4">
                        <p className="text-sm text-muted-foreground">Listing {listingId} unavailable.</p>
                      </div>
                    );
                  }
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
                      partnerVerified={listing.partnerVerified ?? undefined}
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
