/**
 * Funnel Matches View Component
 * Shows listings matching a funnel's criteria using simple cards
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Inbox,
} from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { getAppThumbUrl } from '@/utils/storage';
import { getFunnelMatchesAction } from '@/actions/funnels';
import {
  BODY_TYPES,
  FUEL_TYPES,
  SPECS_TYPES,
  UAE_EMIRATES,
} from '@/components/listings/listing-form/constants';

interface ConsignmentFunnel {
  id: string;
  name: string;
  description?: string | null;
  filters: {
    makes?: string[];
    models?: string[];
    bodyTypes?: string[];
    fuelTypes?: string[];
    minYear?: number;
    maxYear?: number;
    minPrice?: number;
    maxPrice?: number;
    maxMileage?: number;
    emirates?: string[];
    specs?: string[];
  };
}

interface MatchingListing {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  thumbnail: string | null;
}

interface FunnelMatchesViewProps {
  funnel: ConsignmentFunnel;
  onBack: () => void;
}

export function FunnelMatchesView({ funnel, onBack }: FunnelMatchesViewProps) {
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const { data, isLoading, error } = useQuery<{
    listings: MatchingListing[];
    total: number;
    hasMore: boolean;
  }>({
    queryKey: ['funnel-matches', funnel.id, offset],
    queryFn: () => getFunnelMatchesAction(funnel.id, { limit, offset }),
  });

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <button 
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-subhead font-semibold text-muted-foreground hover:text-foreground transition-colors mb-4 -ml-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Funnels
        </button>
        
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-title3 sm:text-title2 font-bold tracking-tight">{funnel.name}</h1>
            {funnel.description && (
              <p className="text-subhead sm:text-subhead text-muted-foreground/70 mt-1">{funnel.description}</p>
            )}
          </div>
          {data && (
            <div className="flex-shrink-0">
              <span className="text-subhead font-semibold text-primary">Count: {data.total}</span>
            </div>
          )}
        </div>

        <FunnelFilterTags filters={funnel.filters} />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-sidebar-border bg-sidebar overflow-hidden">
              <Skeleton className="aspect-[4/3]" />
              <div className="p-2.5">
                <Skeleton className="h-4 w-28 sm:w-32 mb-1.5" />
                <Skeleton className="h-4 w-20 sm:w-24" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-24 rounded-xl bg-destructive/5 border border-destructive/20">
          <p className="text-subhead text-destructive font-medium">Failed to load matches. Please try again.</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && (!data?.listings || data.listings.length === 0) && (
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <Inbox className="w-12 h-12 text-muted-foreground/30 mb-4" strokeWidth={1.5} />
          <h3 className="text-headline font-semibold tracking-tight mb-1">No Matches Yet</h3>
          <p className="text-subhead text-muted-foreground/60 text-center max-w-md">
            No listings currently match your funnel criteria.
          </p>
        </div>
      )}

      {/* Simple Listings Grid */}
      {!isLoading && data?.listings && data.listings.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {data.listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.id}`}
                className="group"
              >
                <div className="rounded-lg border border-sidebar-border bg-sidebar overflow-hidden hover:border-sidebar-border/80 hover:shadow-md transition-all">
                  {/* Image */}
                  <div className="aspect-[4/3] bg-muted/20 relative overflow-hidden">
                    {getAppThumbUrl(listing.thumbnail) ? (
                      <img
                        src={getAppThumbUrl(listing.thumbnail)!}
                        alt={`${listing.year} ${listing.make} ${listing.model}`}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-sidebar-accent">
                        <ImageIcon className="w-8 h-8 text-sidebar-foreground/20" />
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-2.5">
                    <p className="text-subhead font-semibold text-sidebar-foreground truncate">
                      {listing.year} {listing.make} {listing.model}
                    </p>
                    <p className="text-subhead font-bold text-primary">
                      AED {listing.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t border-border/30">
              <p className="text-subhead text-muted-foreground/70 font-medium">
                Page {currentPage} of {totalPages} · {data.total} vehicles
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                  className="flex items-center gap-1 px-3 py-1.5 text-subhead font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setOffset(offset + limit)}
                  disabled={!data.hasMore}
                  className="flex items-center gap-1 px-3 py-1.5 text-subhead font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================================
// FILTER TAGS
// ============================================================================

type FunnelFilters = ConsignmentFunnel['filters'];

function FunnelFilterTags({ filters }: { filters: FunnelFilters }) {
  const tags: { label: string; group: string }[] = [];

  filters.makes?.forEach(v => tags.push({ label: v, group: 'make' }));
  filters.models?.forEach(v => tags.push({ label: v, group: 'model' }));
  filters.bodyTypes?.forEach(v => {
    const found = BODY_TYPES.find(b => b.value === v);
    tags.push({ label: found?.label ?? v, group: 'body' });
  });
  filters.fuelTypes?.forEach(v => {
    const found = FUEL_TYPES.find(f => f.value === v);
    tags.push({ label: found?.label ?? v, group: 'fuel' });
  });
  filters.emirates?.forEach(v => {
    const found = UAE_EMIRATES.find(e => e.value === v);
    tags.push({ label: found?.label ?? v, group: 'emirate' });
  });
  filters.specs?.forEach(v => {
    const found = SPECS_TYPES.find(s => s.value === v);
    tags.push({ label: found?.label ?? v, group: 'spec' });
  });
  if (filters.minYear || filters.maxYear) {
    const label = filters.minYear && filters.maxYear
      ? `${filters.minYear}–${filters.maxYear}`
      : filters.minYear ? `From ${filters.minYear}` : `Up to ${filters.maxYear}`;
    tags.push({ label, group: 'year' });
  }
  if (filters.minPrice || filters.maxPrice) {
    const fmt = (n: number) => `AED ${n.toLocaleString()}`;
    const label = filters.minPrice && filters.maxPrice
      ? `${fmt(filters.minPrice)}–${fmt(filters.maxPrice)}`
      : filters.minPrice ? `From ${fmt(filters.minPrice)}` : `Up to ${fmt(filters.maxPrice!)}`;
    tags.push({ label, group: 'price' });
  }
  if (filters.maxMileage) {
    tags.push({ label: `≤${filters.maxMileage.toLocaleString()} km`, group: 'mileage' });
  }

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {tags.map((tag, i) => (
        <span
          key={i}
          className="inline-flex items-center px-2.5 py-1 rounded-full text-caption1 font-semibold bg-sidebar-accent text-sidebar-foreground border border-sidebar-border/40"
        >
          {tag.label}
        </span>
      ))}
    </div>
  );
}
