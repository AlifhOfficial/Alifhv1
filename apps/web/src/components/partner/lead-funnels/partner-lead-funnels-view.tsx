/**
 * Partner Lead Funnels View
 * Shows all lead funnels across the partner organization
 * Manager/Owner view - can see which staff created each funnel
 */

'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Loader2,
  Inbox,
  RefreshCw,
  ChevronDown,
  ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import Image from 'next/image';
import Link from 'next/link';

// ============================================================================
// Types
// ============================================================================

interface ConsignmentFunnel {
  id: string;
  partnerId: string;
  staffId: string;
  name: string;
  description: string | null;
  filters: {
    makes?: string[];
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
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  staffName: string | null;
}

interface StaffStats {
  staffId: string;
  staffName: string;
  funnelCount: number;
}

interface FunnelPreview {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  thumbnail: string | null;
}

interface PartnerLeadFunnelsViewProps {
  partnerId: string;
  partnerName: string;
}

// ============================================================================
// Main Component
// ============================================================================

export function PartnerLeadFunnelsView({ partnerId, partnerName }: PartnerLeadFunnelsViewProps) {
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedFunnels, setExpandedFunnels] = useState<Set<string>>(new Set());

  // Fetch all funnels
  const { data, isLoading, error, refetch } = useQuery<{ funnels: ConsignmentFunnel[] }>({
    queryKey: ['partner-all-funnels', partnerId],
    queryFn: async () => {
      const res = await fetch(`/api/partner/consignment/funnels/all?partnerId=${partnerId}&_t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to fetch funnels');
      return res.json();
    },
    staleTime: 0, // Always refetch on mount/focus
    refetchOnMount: 'always',
    gcTime: 0,
  });

  const funnels = useMemo(() => data?.funnels || [], [data?.funnels]);

  // Calculate staff stats
  const staffStats: StaffStats[] = useMemo(() => {
    const staffMap = new Map<string, StaffStats>();
    
    funnels.forEach(funnel => {
      const existing = staffMap.get(funnel.staffId);
      if (existing) {
        existing.funnelCount++;
      } else {
        staffMap.set(funnel.staffId, {
          staffId: funnel.staffId,
          staffName: funnel.staffName || 'Unknown Staff',
          funnelCount: 1,
        });
      }
    });

    return Array.from(staffMap.values()).sort((a, b) => b.funnelCount - a.funnelCount);
  }, [funnels]);

  // Filter funnels by staff
  const filteredFunnels = useMemo(() => {
    if (selectedStaffFilter === 'all') return funnels;
    return funnels.filter(f => f.staffId === selectedStaffFilter);
  }, [funnels, selectedStaffFilter]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // Toggle funnel expansion
  const toggleFunnel = (funnelId: string) => {
    setExpandedFunnels(prev => {
      const next = new Set(prev);
      if (next.has(funnelId)) {
        next.delete(funnelId);
      } else {
        next.add(funnelId);
      }
      return next;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 space-y-16">
      {/* Header */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Lead Funnels</h1>
            <p className="text-sm text-muted-foreground mt-2">
              View all lead funnels across {partnerName}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="p-2 rounded-full hover:bg-secondary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          </button>
        </div>

        {/* Stats */}
        {!isLoading && funnels.length > 0 && (
          <div className="grid grid-cols-2 border-y border-border/40 divide-x divide-border/40">
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground mb-2">Total Funnels</p>
              <p className="text-2xl font-semibold text-blue-500">{funnels.length}</p>
            </div>
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground mb-2">Staff Members</p>
              <p className="text-2xl font-semibold text-foreground">{staffStats.length}</p>
            </div>
          </div>
        )}

        {/* Staff Cards */}
        {!isLoading && staffStats.length > 0 && (
          <section className="space-y-6">
            <div>
              <h3 className="text-lg font-medium tracking-tight">Staff Funnels</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Lead funnels created by each team member
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffStats.map((staff) => (
                <button
                  key={staff.staffId}
                  onClick={() => setSelectedStaffFilter(
                    selectedStaffFilter === staff.staffId ? 'all' : staff.staffId
                  )}
                  className={cn(
                    'p-6 rounded-xl border border-border/40 text-left transition-all',
                    selectedStaffFilter === staff.staffId
                      ? 'bg-secondary/50'
                      : 'hover:bg-muted/15'
                  )}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <UserAvatar
                      size="md"
                      name={staff.staffName}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">
                        {staff.staffName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-semibold text-primary">{staff.funnelCount}</p>
                    <p className="text-xs text-muted-foreground">
                      {staff.funnelCount === 1 ? 'funnel' : 'funnels'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </section>

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-500">Failed to load funnels. Please try again.</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading funnels...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && funnels.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Inbox className="w-12 h-12 text-muted-foreground/30 mb-4" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold tracking-tight mb-1">No Lead Funnels Yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Staff members haven&apos;t created any lead funnels yet
          </p>
        </div>
      )}

      {/* Funnels List */}
      {!isLoading && !error && filteredFunnels.length > 0 && (
        <section className="space-y-6">
          <div>
            <h3 className="text-lg font-medium tracking-tight">
              {selectedStaffFilter === 'all' ? 'All Funnels' : `Funnels by ${staffStats.find(s => s.staffId === selectedStaffFilter)?.staffName}`}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredFunnels.length} {filteredFunnels.length === 1 ? 'funnel' : 'funnels'}
            </p>
          </div>

          <div className="space-y-3">
            {filteredFunnels.map((funnel) => (
              <FunnelRow
                key={funnel.id}
                funnel={funnel}
                isExpanded={expandedFunnels.has(funnel.id)}
                onToggle={() => toggleFunnel(funnel.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ============================================================================
// Funnel Row Component
// ============================================================================

interface FunnelRowProps {
  funnel: ConsignmentFunnel;
  isExpanded: boolean;
  onToggle: () => void;
}

function FunnelRow({ funnel, isExpanded, onToggle }: FunnelRowProps) {
  const filterTags = getFilterTags(funnel.filters);

  // Fetch preview when expanded
  const { data: previewData, isLoading: previewLoading } = useQuery<{ listings: FunnelPreview[] }>({
    queryKey: ['funnel-preview', funnel.id],
    queryFn: async () => {
      const res = await fetch(`/api/partner/consignment/funnels/${funnel.id}/matches?limit=6`);
      if (!res.ok) throw new Error('Failed to fetch preview');
      return res.json();
    },
    enabled: isExpanded,
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div className="rounded-xl border border-border/40 hover:bg-secondary/50 transition-colors">
      {/* Funnel Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-6 text-left"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h4 className="text-base font-semibold text-foreground truncate mb-1">
              {funnel.name}
            </h4>

            {/* Staff & Date */}
            <p className="text-sm text-muted-foreground mb-3">
              Created by <span className="font-medium text-foreground">{funnel.staffName || 'Unknown'}</span>
              {' · '}
              {new Date(funnel.createdAt).toLocaleDateString()}
            </p>

            {/* Filter Tags */}
            <div className="flex flex-wrap gap-1.5">
              {filterTags.length > 0 ? (
                filterTags.slice(0, 6).map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 text-xs font-medium bg-secondary text-muted-foreground rounded-md">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground/50 italic">All vehicles</span>
              )}
              {filterTags.length > 6 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-secondary text-muted-foreground rounded-md">
                  +{filterTags.length - 6} more
                </span>
              )}
            </div>
          </div>

          {/* Expand Icon */}
          <ChevronDown className={cn(
            "w-5 h-5 text-muted-foreground/60 transition-transform flex-shrink-0 mt-1",
            isExpanded && "rotate-180"
          )} />
        </div>
      </button>

      {/* Expanded Preview */}
      {isExpanded && (
        <div className="border-t border-border/40 p-6 bg-muted/20">
          {previewLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!previewLoading && (!previewData?.listings || previewData.listings.length === 0) && (
            <div className="text-center py-8">
              <Inbox className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No matching listings found</p>
            </div>
          )}

          {!previewLoading && previewData?.listings && previewData.listings.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {previewData.listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.id}`}
                  target="_blank"
                  className="group block"
                >
                  <div className="aspect-[4/3] relative rounded-lg overflow-hidden bg-muted mb-2">
                    {listing.thumbnail ? (
                      <Image
                        src={listing.thumbnail}
                        alt={`${listing.year} ${listing.make} ${listing.model}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, 16vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {listing.year} {listing.make} {listing.model}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    AED {listing.price.toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Utilities
// ============================================================================

function getFilterTags(filters: ConsignmentFunnel['filters']): string[] {
  const tags: string[] = [];

  if (filters.makes?.length) {
    tags.push(...filters.makes.slice(0, 2));
    if (filters.makes.length > 2) tags.push(`+${filters.makes.length - 2} makes`);
  }

  if (filters.bodyTypes?.length) {
    tags.push(...filters.bodyTypes.slice(0, 2));
  }

  if (filters.minYear || filters.maxYear) {
    if (filters.minYear && filters.maxYear) {
      tags.push(`${filters.minYear}-${filters.maxYear}`);
    } else if (filters.minYear) {
      tags.push(`${filters.minYear}+`);
    } else if (filters.maxYear) {
      tags.push(`Up to ${filters.maxYear}`);
    }
  }

  if (filters.minPrice || filters.maxPrice) {
    if (filters.minPrice && filters.maxPrice) {
      tags.push(`${formatPrice(filters.minPrice)}-${formatPrice(filters.maxPrice)}`);
    } else if (filters.minPrice) {
      tags.push(`${formatPrice(filters.minPrice)}+`);
    } else if (filters.maxPrice) {
      tags.push(`Up to ${formatPrice(filters.maxPrice)}`);
    }
  }

  if (filters.maxMileage) {
    tags.push(`<${(filters.maxMileage / 1000).toFixed(0)}k km`);
  }

  if (filters.emirates?.length) {
    tags.push(...filters.emirates.slice(0, 2));
  }

  if (filters.specs?.length) {
    tags.push(...filters.specs.slice(0, 2));
  }

  return tags;
}

function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}M`;
  }
  if (price >= 1000) {
    return `${(price / 1000).toFixed(0)}K`;
  }
  return price.toString();
}
