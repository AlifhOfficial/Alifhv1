/**
 * Partner Lead Funnels View
 * Shows all lead funnels across the partner organization
 * Manager/Owner view - can see which staff created each funnel
 * Uses server-side filtering for proper pagination
 */

'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { 
  RefreshCw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Search,
  X,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Combobox } from '@/components/ui/forms/combobox';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import Link from 'next/link';
import { useDebouncedCallback } from 'use-debounce';
import { getThumbUrl } from '@/utils/storage';
import { FunnelMatchesView } from '@/components/staff/consignment/funnel-matches-view';

// ============================================================================
// Constants
// ============================================================================

const ITEMS_PER_PAGE = 12;

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

interface FunnelStats {
  total: number;
  active: number;
  staffCount: number;
}

interface StaffMember {
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
  // Data state
  const [funnels, setFunnels] = useState<ConsignmentFunnel[]>([]);
  const [stats, setStats] = useState<FunnelStats | null>(null);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  
  // Server-side filter state
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedFunnels, setExpandedFunnels] = useState<Set<string>>(new Set());
  const [viewingFunnel, setViewingFunnel] = useState<ConsignmentFunnel | null>(null);
  const hasFetchedInitialRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  // Debounce search input
  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setDebouncedSearch(value);
    setCurrentPage(1);
  }, 400);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    debouncedSetSearch(value);
  }, [debouncedSetSearch]);

  // Fetch funnels with server-side filters
  const fetchFunnels = useCallback(async (isRefresh = false) => {
    if (!partnerId) return;
    
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // Build query params
      const params = new URLSearchParams({
        partnerId,
        includeStats: '1',
        limit: String(ITEMS_PER_PAGE),
        offset: String((currentPage - 1) * ITEMS_PER_PAGE),
      });

      if (selectedStaffFilter !== 'all') {
        params.set('staffId', selectedStaffFilter);
      }

      if (debouncedSearch.trim()) {
        params.set('q', debouncedSearch.trim());
      }

      const response = await fetch(`/api/partner/consignment/funnels/all?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch funnels');
      }

      const data = await response.json();
      setFunnels(data.funnels || []);
      
      if (data.stats) {
        setStats(data.stats);
      }
      
      if (data.staffList) {
        setStaffList(data.staffList);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Failed to fetch funnels');
      console.error('[PartnerLeadFunnelsView] Error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [partnerId, currentPage, selectedStaffFilter, debouncedSearch]);

  // Initial fetch
  useEffect(() => {
    if (!hasFetchedInitialRef.current) {
      hasFetchedInitialRef.current = true;
    }
    fetchFunnels();
    return () => { abortRef.current?.abort(); };
  }, [fetchFunnels]);

  // Filter change handlers
  const handleStaffFilterChange = useCallback((value: string) => {
    setSelectedStaffFilter(value);
    setCurrentPage(1);
  }, []);

  // Staff options for combobox
  const staffOptions = useMemo(() => {
    const options = [{ value: 'all', label: 'All Staff' }];
    staffList.forEach(staff => {
      options.push({
        value: staff.staffId,
        label: `${staff.staffName} (${staff.funnelCount})`,
      });
    });
    return options;
  }, [staffList]);

  // Calculate total pages from stats
  const totalItems = stats?.total ?? 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSelectedStaffFilter('all');
    setSearchQuery('');
    setDebouncedSearch('');
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = selectedStaffFilter !== 'all' || searchQuery.trim() !== '';

  // Handle refresh
  const handleRefresh = async () => {
    await fetchFunnels(true);
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

  // If viewing all matches for a specific funnel
  if (viewingFunnel) {
    return (
      <FunnelMatchesView 
        funnel={viewingFunnel} 
        onBack={() => setViewingFunnel(null)} 
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-foreground">Lead Funnels</h1>
          <p className="text-[11px] sm:text-xs text-muted-foreground/60 mt-0.5">View all lead funnels across {partnerName}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="p-2 rounded-full hover:bg-secondary/50 active:bg-secondary transition-colors disabled:opacity-50"
            aria-label="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4 text-muted-foreground", isRefreshing && "animate-spin")} />
          </button>
        </div>
      </div>

        {/* Stats */}
        {!isLoading && stats && (
          <div className="flex flex-wrap items-center gap-6 sm:gap-10">
            <div>
              <span className="text-xs text-muted-foreground">Total Funnels</span>
              <p className="text-lg sm:text-xl font-semibold tracking-tight mt-1 text-blue-500">{stats.total}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Active</span>
              <p className="text-lg sm:text-xl font-semibold tracking-tight mt-1 text-green-500">{stats.active}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Staff Members</span>
              <p className="text-lg sm:text-xl font-semibold tracking-tight mt-1">{stats.staffCount}</p>
            </div>
          </div>
        )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search funnels..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full h-9 sm:h-10 pl-10 pr-8 rounded-lg sm:rounded-xl bg-secondary/50 text-xs sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-secondary"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Staff Combobox */}
        {staffList.length > 0 && (
          <div className="w-full sm:w-48">
            <Combobox
              options={staffOptions}
              value={selectedStaffFilter}
              onValueChange={handleStaffFilterChange}
              placeholder="All Staff"
              searchPlaceholder="Search staff..."
              className="h-9 sm:h-10 rounded-lg sm:rounded-xl bg-secondary/50 border-0"
            />
          </div>
        )}

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20">
          <p className="text-xs sm:text-sm text-destructive font-medium">Failed to load funnels</p>
          <button
            onClick={handleRefresh}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/40 bg-card p-3 sm:p-4 md:p-5">
              <div className="flex items-start justify-between gap-2 sm:gap-4">
                <div className="flex-1 min-w-0">
                  {/* Chevron + Title */}
                  <div className="flex items-center gap-2 sm:gap-3 mb-1">
                    <Skeleton className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded flex-shrink-0" />
                    <Skeleton className="h-4 sm:h-5 w-32 sm:w-48" />
                  </div>
                  {/* Description */}
                  <Skeleton className="h-3 sm:h-4 w-56 sm:w-64 mb-1.5 sm:mb-2 ml-5 sm:ml-7" />
                  {/* Staff + Date */}
                  <Skeleton className="h-3 w-28 sm:w-36 mb-1.5 sm:mb-2 ml-5 sm:ml-7" />
                  {/* Filter Tags */}
                  <div className="flex gap-1 sm:gap-1.5 ml-5 sm:ml-7">
                    <Skeleton className="h-5 w-14 sm:w-16 rounded-md" />
                    <Skeleton className="h-5 w-16 sm:w-20 rounded-md" />
                    <Skeleton className="h-5 w-12 sm:w-14 rounded-md" />
                  </div>
                </div>
                {/* Active Badge */}
                <Skeleton className="h-5 sm:h-6 w-14 sm:w-16 rounded-full flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Funnels List */}
      {!isLoading && !error && funnels.length > 0 && (
        <div className={cn("transition-opacity duration-200", isRefreshing && "opacity-50 pointer-events-none")}>
          {/* Count */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                {totalItems} funnel{totalItems !== 1 ? 's' : ''}
                {selectedStaffFilter !== 'all' && ` by ${staffList.find(s => s.staffId === selectedStaffFilter)?.staffName}`}
              </p>
              {isRefreshing && (
                <div className="w-3 h-3 border border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
              )}
            </div>
            {totalPages > 1 && (
              <p className="text-xs text-muted-foreground">{currentPage} / {totalPages}</p>
            )}
          </div>

          {/* List */}
          <div className="space-y-4">
            {funnels.map((funnel) => (
              <FunnelRow
                key={funnel.id}
                funnel={funnel}
                isExpanded={expandedFunnels.has(funnel.id)}
                onToggle={() => toggleFunnel(funnel.id)}
                onViewAll={() => setViewingFunnel(funnel)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-12">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-secondary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                      currentPage === pageNum
                        ? 'bg-secondary text-foreground font-medium'
                        : 'text-muted-foreground hover:bg-secondary/50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-secondary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty - No Data (no filters, just empty) */}
      {!isLoading && !error && funnels.length === 0 && !hasActiveFilters && (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
          <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mb-3">
            <Filter className="w-4 h-4 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-foreground">No lead funnels yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Staff members haven't created any funnels</p>
        </div>
      )}

      {/* Empty - No Results (filters applied but no results) */}
      {!isLoading && !error && funnels.length === 0 && hasActiveFilters && (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
          <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mb-3">
            <Search className="w-4 h-4 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-foreground">No results found</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Try a different search or filter</p>
          <button
            onClick={clearFilters}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear filters
          </button>
        </div>
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
  onViewAll: () => void;
}

function FunnelRow({ funnel, isExpanded, onToggle, onViewAll }: FunnelRowProps) {
  const filterTags = getFilterTags(funnel.filters);
  
  // Preview state
  const [previewData, setPreviewData] = useState<FunnelPreview[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewFetched, setPreviewFetched] = useState(false);

  // Fetch preview when expanded (only once)
  useEffect(() => {
    if (isExpanded && !previewFetched) {
      setPreviewLoading(true);
      fetch(`/api/partner/consignment/funnels/${funnel.id}/matches?limit=6`)
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
          setPreviewData(data.listings || []);
          setPreviewFetched(true);
        })
        .catch(() => {
          setPreviewData([]);
          setPreviewFetched(true);
        })
        .finally(() => setPreviewLoading(false));
    }
  }, [isExpanded, previewFetched, funnel.id]);

  return (
    <div className="rounded-xl border border-border/40 bg-card hover:border-border/60 hover:shadow-sm transition-all overflow-hidden">
      {/* Funnel Header */}
      <div className="w-full p-3 sm:p-4 md:p-5 border-b border-border/30">
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          {/* Left: Toggle + Title, Description, Tags - Clickable for collapse */}
          <button
            type="button"
            onClick={onToggle}
            className="min-w-0 flex-1 text-left"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-1">
              <ChevronDown className={cn(
                "w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground/50 transition-transform flex-shrink-0",
                !isExpanded && "-rotate-90"
              )} />
              <h3 className="text-sm sm:text-base md:text-lg font-bold tracking-tight truncate">{funnel.name}</h3>
            </div>
            
            {funnel.description && (
              <p className="text-xs sm:text-sm text-muted-foreground/60 line-clamp-1 mb-1.5 sm:mb-2 ml-5 sm:ml-7">
                {funnel.description}
              </p>
            )}

            <p className="text-[11px] sm:text-xs text-muted-foreground ml-5 sm:ml-7 mb-1.5 sm:mb-2">
              {funnel.staffName || 'Staff member'} · {new Date(funnel.createdAt).toLocaleDateString()}
            </p>

            {/* Filter Tags */}
            <div className="flex flex-wrap gap-1 sm:gap-1.5 ml-5 sm:ml-7">
              {filterTags.length > 0 ? (
                filterTags.slice(0, 5).map((tag, i) => (
                  <span key={i} className="px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs font-medium bg-secondary text-muted-foreground rounded-md">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-[11px] sm:text-xs text-muted-foreground/40 italic">All vehicles</span>
              )}
              {filterTags.length > 5 && (
                <span className="px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs font-medium bg-secondary text-muted-foreground rounded-md">
                  +{filterTags.length - 5} more
                </span>
              )}
            </div>
          </button>

          {/* Right: Active Badge */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={cn(
              'shrink-0 px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs font-semibold rounded-full',
              funnel.isActive 
                ? 'bg-green-500/10 text-green-600' 
                : 'bg-muted/50 text-muted-foreground'
            )}>
              {funnel.isActive ? 'Active' : 'Paused'}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Preview */}
      {isExpanded && (
        <div className="p-3 sm:p-4 md:p-5">

          {/* Preview Loading */}
          {previewLoading && (
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 sm:overflow-visible scrollbar-hide">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[160px] sm:w-auto">
                  <div className="rounded-lg border border-border/40 bg-card overflow-hidden">
                    <Skeleton className="aspect-[4/3]" />
                    <div className="p-2">
                      <Skeleton className="h-3 sm:h-4 w-20 sm:w-28 mb-1.5" />
                      <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Preview Empty */}
          {!previewLoading && previewFetched && previewData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                <ImageIcon className="w-3.5 h-3.5 text-muted-foreground/40" />
              </div>
              <p className="text-xs text-muted-foreground/50">No matching listings</p>
            </div>
          )}

          {/* Preview Grid */}
          {!previewLoading && previewData.length > 0 && (
            <>
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 sm:overflow-visible scrollbar-hide">
              {previewData.slice(0, 4).map((listing) => (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.id}`}
                  target="_blank"
                  className="flex-shrink-0 w-[160px] sm:w-auto group"
                >
                  <div className="rounded-lg border border-border/40 bg-card overflow-hidden hover:border-border/60 hover:shadow-md transition-all">
                    {/* Image */}
                    <div className="aspect-[4/3] bg-muted/20 relative overflow-hidden">
                      {listing.thumbnail ? (
                        <Image
                          src={getThumbUrl(listing.thumbnail) || listing.thumbnail}
                          alt=""
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 33vw, 16vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary">
                          <ImageIcon className="w-4 h-4 text-muted-foreground/20" />
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="p-2">
                      <p className="text-xs sm:text-sm font-semibold truncate">
                        {listing.year} {listing.make}
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-blue-600">
                        AED {listing.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* View All Button */}
            <div className="mt-3 sm:mt-4 flex justify-end">
              <button
                type="button"
                onClick={onViewAll}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold text-primary hover:bg-primary/5 rounded-lg transition-colors"
              >
                View All →
              </button>
            </div>
            </>
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
