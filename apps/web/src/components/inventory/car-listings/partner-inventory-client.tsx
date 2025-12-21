/**
 * Partner Inventory Client Component
 * Displays partner's listings using API
 */

'use client';

import { CarCard } from "./car-card";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";

interface PartnerInventoryClientProps {
  partnerId: string;
  partnerName: string;
  partnerVerified: boolean;
}

export function PartnerInventoryClient({ 
  partnerId, 
  partnerName, 
  partnerVerified 
}: PartnerInventoryClientProps) {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  const fetchListings = useCallback(async () => {
    if (!partnerId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/listings/car-card?partnerId=${partnerId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch partner listings: ${response.status}`);
      }

      const data = await response.json();
      setListings(data.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch listings';
      setError(errorMessage);
      console.error('[PartnerInventoryClient] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [partnerId]);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchListings();
    }
  }, [fetchListings]);

  // Group by status
  const { publishedListings, draftListings, soldListings } = useMemo(() => {
    return {
      publishedListings: listings.filter(l => l.status === 'published'),
      draftListings: listings.filter(l => l.status === 'draft'),
      soldListings: listings.filter(l => l.status === 'sold'),
    };
  }, [listings]);

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 space-y-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-xl font-medium">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Manage your vehicle listings
          </p>
        </div>
        <Link
          href="/partner-dashboard/inventory/new"
          className="h-10 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Listing
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="text-center py-12 bg-muted/20 border border-border/40 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">Loading inventory...</p>
        </div>
      )}

      {/* Stats */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border border-border/40 rounded-lg bg-card/50">
            <p className="text-xs text-muted-foreground mb-2">Active Listings</p>
            <p className="text-2xl font-medium">{publishedListings.length}</p>
          </div>
          <div className="p-6 border border-border/40 rounded-lg bg-card/50">
            <p className="text-xs text-muted-foreground mb-2">Draft Listings</p>
            <p className="text-2xl font-medium">{draftListings.length}</p>
          </div>
          <div className="p-6 border border-border/40 rounded-lg bg-card/50">
            <p className="text-xs text-muted-foreground mb-2">Sold</p>
            <p className="text-2xl font-medium">{soldListings.length}</p>
          </div>
        </div>
      )}

      {/* Published Listings */}
      {!isLoading && !error && publishedListings.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <h2 className="text-lg font-medium">Active Listings</h2>
            <span className="text-sm text-muted-foreground">
              {publishedListings.length} {publishedListings.length === 1 ? 'listing' : 'listings'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedListings.map((listing) => (
              <CarCard
                key={listing.id}
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
                images={listing.images}
                qiScore={listing.qiScore}
                partnerName={partnerName}
                partnerVerified={partnerVerified}
                isBlackMember={listing.isBlackMember || false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Draft Listings */}
      {!isLoading && !error && draftListings.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <h2 className="text-lg font-medium">Drafts</h2>
            <span className="text-sm text-muted-foreground">
              {draftListings.length} {draftListings.length === 1 ? 'draft' : 'drafts'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {draftListings.map((listing) => (
              <CarCard
                key={listing.id}
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
                images={listing.images}
                qiScore={listing.qiScore}
                partnerName={partnerName}
                partnerVerified={partnerVerified}
                isBlackMember={listing.isBlackMember || false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && listings.length === 0 && (
        <div className="text-center py-12 border border-border/40 rounded-lg bg-muted/20">
          <p className="text-sm text-muted-foreground mb-4">No listings yet</p>
          <Link
            href="/partner-dashboard/inventory/new"
            className="inline-flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Your First Listing
          </Link>
        </div>
      )}
    </div>
  );
}
