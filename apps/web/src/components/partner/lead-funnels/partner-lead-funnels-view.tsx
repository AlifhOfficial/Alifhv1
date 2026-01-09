/**
 * Partner Lead Funnels View
 * Shows all lead funnels across the partner organization
 * Manager/Owner view - can see which staff created each funnel
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Loader2,
  Inbox,
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
import Image from 'next/image';
import Link from 'next/link';
import { DashboardPageWrapper, DashboardPageHeader } from '@/components/shared/layout/dashboard-page-wrapper';

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
  // UI State
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
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
    staleTime: 0,
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

  // Staff options for combobox
  const staffOptions = useMemo(() => {
    const options = [{ value: 'all', label: 'All Staff' }];
    staffStats.forEach(staff => {
      options.push({
        value: staff.staffId,
        label: `${staff.staffName} (${staff.funnelCount})`,
      });
    });
    return options;
  }, [staffStats]);

  // Filter funnels by staff and search
  const filteredFunnels = useMemo(() => {
    let result = funnels;
    
    // Staff filter
    if (selectedStaffFilter !== 'all') {
      result = result.filter(f => f.staffId === selectedStaffFilter);
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(f => 
        f.name.toLowerCase().includes(query) ||
        (f.staffName?.toLowerCase().includes(query)) ||
        (f.description?.toLowerCase().includes(query))
      );
    }
    
    return result;
  }, [funnels, selectedStaffFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredFunnels.length / ITEMS_PER_PAGE);
  const paginatedFunnels = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredFunnels.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredFunnels, currentPage]);

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [selectedStaffFilter, searchQuery]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSelectedStaffFilter('all');
    setSearchQuery('');
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = selectedStaffFilter !== 'all' || searchQuery.trim() !== '';

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
    <DashboardPageWrapper>
      {/* Header */}
      <DashboardPageHeader
        title="Lead Funnels"
        description={`View all lead funnels across ${partnerName}`}
      >
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
          className="p-2 rounded-full hover:bg-secondary/50 active:bg-secondary transition-colors disabled:opacity-50"
          aria-label="Refresh"
        >
          <RefreshCw className={cn("w-4 h-4 text-muted-foreground", isRefreshing && "animate-spin")} />
        </button>
      </DashboardPageHeader>

        {/* Stats */}
        {!isLoading && funnels.length > 0 && (
          <div className="flex items-center gap-10">
            <div>
              <span className="text-xs text-muted-foreground">Total Funnels</span>
              <p className="text-xl font-semibold tracking-tight mt-1 text-blue-500">{funnels.length}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Active</span>
              <p className="text-xl font-semibold tracking-tight mt-1 text-green-500">
                {funnels.filter(f => f.isActive).length}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Staff Members</span>
              <p className="text-xl font-semibold tracking-tight mt-1">{staffStats.length}</p>
            </div>
          </div>
        )}

      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search funnels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-8 rounded-xl bg-secondary/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-secondary"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Staff Combobox */}
        {staffStats.length > 0 && (
          <div className="w-48">
            <Combobox
              options={staffOptions}
              value={selectedStaffFilter}
              onValueChange={setSelectedStaffFilter}
              placeholder="All Staff"
              searchPlaceholder="Search staff..."
              className="h-10 rounded-xl bg-secondary/50 border-0"
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
        <div className="mb-8 p-4 rounded-xl bg-secondary/50 text-sm">
          Failed to load funnels. Please try again.
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-5 h-5 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground mt-4">Loading...</p>
        </div>
      )}

      {/* Funnels List */}
      {!isLoading && !error && filteredFunnels.length > 0 && (
        <>
          {/* Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs text-muted-foreground">
              {filteredFunnels.length} funnel{filteredFunnels.length !== 1 ? 's' : ''}
              {selectedStaffFilter !== 'all' && ` by ${staffStats.find(s => s.staffId === selectedStaffFilter)?.staffName}`}
            </p>
            {totalPages > 1 && (
              <p className="text-xs text-muted-foreground">{currentPage} / {totalPages}</p>
            )}
          </div>

          {/* List */}
          <div className="space-y-2">
            {paginatedFunnels.map((funnel) => (
              <FunnelRow
                key={funnel.id}
                funnel={funnel}
                isExpanded={expandedFunnels.has(funnel.id)}
                onToggle={() => toggleFunnel(funnel.id)}
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
        </>
      )}

      {/* Empty - No Data */}
      {!isLoading && !error && funnels.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <Filter className="w-10 h-10 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-medium tracking-tight">No lead funnels yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Staff members haven't created any lead funnels</p>
        </div>
      )}

      {/* Empty - No Results */}
      {!isLoading && !error && funnels.length > 0 && filteredFunnels.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <Search className="w-10 h-10 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-medium tracking-tight">No results</h3>
          <p className="text-sm text-muted-foreground mt-1">Try a different search or filter</p>
          <button
            onClick={clearFilters}
            className="mt-4 text-sm text-foreground hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </DashboardPageWrapper>
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
    <div className="rounded-xl hover:bg-secondary/30 transition-colors">
      {/* Funnel Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 -mx-4 text-left flex items-center gap-4"
      >
        {/* Expand Icon */}
        <ChevronDown className={cn(
          "w-4 h-4 text-muted-foreground/50 transition-transform flex-shrink-0",
          isExpanded && "rotate-180"
        )} />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h4 className="text-sm font-medium tracking-tight text-foreground truncate">
              {funnel.name}
            </h4>
            {/* Status Badge */}
            <span className={cn(
              "px-2 py-0.5 rounded-md text-xs font-medium flex-shrink-0",
              funnel.isActive 
                ? "bg-green-500/10 text-green-600" 
                : "bg-secondary text-muted-foreground"
            )}>
              {funnel.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {funnel.staffName || 'Unknown'} · {new Date(funnel.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Filter Tags (collapsed view) */}
        <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0 max-w-[300px]">
          {filterTags.length > 0 ? (
            <>
              {filterTags.slice(0, 3).map((tag, i) => (
                <span key={i} className="px-2 py-0.5 text-xs bg-secondary/80 text-muted-foreground rounded-md truncate max-w-[100px]">
                  {tag}
                </span>
              ))}
              {filterTags.length > 3 && (
                <span className="text-xs text-muted-foreground">+{filterTags.length - 3}</span>
              )}
            </>
          ) : (
            <span className="text-xs text-muted-foreground/50">All vehicles</span>
          )}
        </div>
      </button>

      {/* Expanded Preview */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 ml-8">
          {/* All Filter Tags */}
          {filterTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {filterTags.map((tag, i) => (
                <span key={i} className="px-2 py-0.5 text-xs bg-secondary text-muted-foreground rounded-md">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {funnel.description && (
            <p className="text-sm text-muted-foreground mb-4">{funnel.description}</p>
          )}

          {/* Preview Loading */}
          {previewLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-4 h-4 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
            </div>
          )}

          {/* Preview Empty */}
          {!previewLoading && (!previewData?.listings || previewData.listings.length === 0) && (
            <div className="text-center py-8">
              <Inbox className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No matching listings</p>
            </div>
          )}

          {/* Preview Grid */}
          {!previewLoading && previewData?.listings && previewData.listings.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {previewData.listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.id}`}
                  target="_blank"
                  className="group block"
                >
                  <div className="aspect-[4/3] relative rounded-lg overflow-hidden bg-secondary mb-2">
                    {listing.thumbnail ? (
                      <Image
                        src={listing.thumbnail}
                        alt=""
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 33vw, 16vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-muted-foreground/20" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium text-foreground truncate group-hover:text-blue-500 transition-colors">
                    {listing.year} {listing.make}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {listing.price.toLocaleString()} AED
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
