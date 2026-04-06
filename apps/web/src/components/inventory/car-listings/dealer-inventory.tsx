/**
 * Partner Inventory Client Component
 * Minimal macOS-inspired design with server-side filtering
 */

'use client';

import { Combobox } from "@/components/ui/forms/combobox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShoppingCart, RefreshCw, Crown, Search, ChevronLeft, ChevronRight, X, Box, ChevronDown, Clock } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useEffect, useCallback, useTransition } from "react";
import { cn } from "@/utils";
import { getAppThumbUrl } from "@/utils/storage";
import { useDebouncedCallback } from 'use-debounce';
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Status tab types - maps to lifecycleStatus API param
type StatusTab = 'active' | 'sold' | 'archived' | 'expired' | 'all';

interface DealerInventoryProps {
  partnerId: string;
  partnerName?: string;
  partnerVerified?: boolean;
  userRole?: string;
  initialTeamMembers: TeamMember[];
  initialBlackQuota: BlackQuotaData | null;
  initialData: {
    listings: ListingData[];
    total: number;
    stats: ListingStats;
  };
  filters: {
    status: StatusTab;
    page: number;
    q: string;
    staffUserId: string;
  };
}

interface ListingData {
  id: string;
  make: string;
  model: string;
  year: number;
  trim: string | null;
  price: number;
  mileage?: number;
  emirate?: string;
  specs?: string;
  thumbnail: string | null;
  images?: string[];
  qiScore?: number;
  isPublic: boolean;
  isBlkListing: boolean;
  moderationStatus: string;
  lifecycleStatus: string;
  postedByUserId?: string;
  postedByUsername?: string;
  postedByDisplayName?: string;
  postedByAvatar?: string | null;
  staffMember?: {
    id: string;
    displayName: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
  expiresAt?: string | null;
}

interface BlackQuotaData {
  partnerId: string;
  tier: string;
  blackListingQuota: number;
  activeBlackListingsCount: number;
  hasAvailableSlots: boolean;
}

interface ListingStats {
  all: number;
  active: number;
  public: number;
  inReview: number;
  draft: number;
  rejected: number;
  archived: number;
  suspended: number;
  sold: number;
  expired: number;
  deleted: number;
}

interface TeamMember {
  id: string;
  userId: string;
  status: 'active' | 'left';
  displayName: string;
  username: string;
  avatar: string | null;
}

const ITEMS_PER_PAGE = 15;

export function DealerInventory({ 
  partnerId: _partnerId, 
  partnerName: _partnerName, 
  partnerVerified: _partnerVerified,
  userRole,
  initialTeamMembers,
  initialBlackQuota,
  initialData,
  filters,
}: DealerInventoryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState(filters.q);
  
  // UI state
  const [error, setError] = useState<string | null>(null);
  
  // Reassign state
  const [reassigningListingId, setReassigningListingId] = useState<string | null>(null);

  const listings = initialData.listings;
  const totalItems = initialData.total;
  const stats = initialData.stats;
  const teamMembers = initialTeamMembers;
  const blackQuota = initialBlackQuota;
  const selectedStaffFilter = filters.staffUserId;
  const selectedStatusTab = filters.status;
  const currentPage = filters.page;
  const debouncedSearch = filters.q;
  const isLoading = isPending;
  const isRefreshing = isPending;

  // Check if user can reassign (owner or admin)
  const canReassign = userRole === 'owner' || userRole === 'admin';

  useEffect(() => {
    setSearchQuery(filters.q);
  }, [filters.q]);

  const updateRoute = useCallback((updates: Partial<DealerInventoryProps['filters']>) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    const nextStatus = updates.status ?? selectedStatusTab;
    const nextPage = updates.page ?? currentPage;
    const nextQuery = updates.q ?? debouncedSearch;
    const nextStaffUserId = updates.staffUserId ?? selectedStaffFilter;

    if (nextStatus === 'active') params.delete('status');
    else params.set('status', nextStatus);

    if (nextPage <= 1) params.delete('page');
    else params.set('page', String(nextPage));

    if (!nextQuery.trim()) params.delete('q');
    else params.set('q', nextQuery.trim());

    if (!nextStaffUserId || nextStaffUserId === 'all') params.delete('staffUserId');
    else params.set('staffUserId', nextStaffUserId);

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
  }, [searchParams, selectedStatusTab, currentPage, debouncedSearch, selectedStaffFilter, pathname, router]);

  // Debounce search input to avoid too many API calls
  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    updateRoute({ q: value, page: 1 });
  }, 400);

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    debouncedSetSearch(value);
  }, [debouncedSetSearch]);

  // Reset page when filters change (except for page itself)
  const handleStatusTabChange = useCallback((tab: StatusTab) => {
    setError(null);
    updateRoute({ status: tab, page: 1 });
  }, [updateRoute]);

  const handleStaffFilterChange = useCallback((value: string) => {
    setError(null);
    updateRoute({ staffUserId: value, page: 1 });
  }, [updateRoute]);

  // Handle reassigning a listing to a different staff member
  const handleReassign = async (listingId: string, newUserId: string) => {
    setReassigningListingId(listingId);
    
    try {
      const response = await fetch(`/api/listings/${listingId}/reassign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newUserId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to reassign listing');
      }
      
      router.refresh();
    } catch (err) {
      console.error('Reassign failed:', err);
    } finally {
      setReassigningListingId(null);
    }
  };

  // Create a Map for O(1) team member lookups
  const teamMemberMap = useMemo(() => {
    const map = new Map<string, TeamMember>();
    teamMembers.forEach(m => map.set(m.userId, m));
    return map;
  }, [teamMembers]);

  // Active staff for reassignment and filtering
  const activeStaff = useMemo(() => {
    return teamMembers.filter(m => m.status === 'active');
  }, [teamMembers]);

  // Staff options for combobox - simple list from team members
  // (listing counts removed since with server-side filtering we only see current page)
  const staffOptions = useMemo(() => {
    const options = [{ value: 'all', label: 'All Staff' }];
    activeStaff.forEach(staff => {
      options.push({
        value: staff.userId,
        label: staff.displayName,
      });
    });
    return options;
  }, [activeStaff]);

  // With server-side filtering, listings are already filtered - no client-side filtering needed
  // The listings we receive are already the result for current page

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Clear filters
  const clearFilters = useCallback(() => {
    setError(null);
    setSearchQuery('');
    updateRoute({
      staffUserId: 'all',
      status: 'active',
      q: '',
      page: 1,
    });
  }, [updateRoute]);

  const hasActiveFilters = selectedStaffFilter !== 'all' || selectedStatusTab !== 'active' || searchQuery.trim() !== '';

  // Get status badge props based on listing status
  const getStatusBadge = (listing: ListingData) => {
    // Lifecycle status takes priority
    if (listing.lifecycleStatus === 'sold') {
      return { label: 'Sold', color: 'text-purple-600', bg: 'bg-purple-500/10' };
    }
    if (listing.lifecycleStatus === 'expired') {
      return { label: 'Expired', color: 'text-orange-600', bg: 'bg-orange-500/10' };
    }
    if (listing.lifecycleStatus === 'archived') {
      return { label: 'Archived', color: 'text-muted-foreground', bg: 'bg-secondary' };
    }
    if (listing.lifecycleStatus === 'deleted') {
      return { label: 'Deleted', color: 'text-destructive', bg: 'bg-destructive-muted' };
    }
    
    // For active listings, check moderation status
    if (listing.moderationStatus === 'rejected') {
      return { label: 'Rejected', color: 'text-destructive', bg: 'bg-destructive-muted' };
    }
    if (listing.moderationStatus === 'draft') {
      return { label: 'Draft', color: 'text-warning', bg: 'bg-warning-muted' };
    }
    if (listing.moderationStatus === 'submitted' || listing.moderationStatus === 'pending_review') {
      return { label: 'In Review', color: 'text-primary', bg: 'bg-primary-muted' };
    }
    if (listing.isPublic) {
      return { label: 'Active', color: 'text-success', bg: 'bg-success-muted' };
    }
    
    return { label: 'Not Public', color: 'text-muted-foreground', bg: 'bg-secondary' };
  };

  return (
    <div className="space-y-4 compact:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-callout compact:text-headline font-semibold text-foreground">Inventory</h1>
          <p className="text-caption2 compact:text-caption1 text-muted-foreground/60 mt-0.5">Manage your dealership listings</p>
        </div>
        <div className="flex items-center gap-2">
          {/* BLK Quota Badge */}
          {blackQuota && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 text-white/90">
              <Crown className="w-3 h-3" />
              <span className="text-caption1">
                {blackQuota.blackListingQuota - blackQuota.activeBlackListingsCount} of {blackQuota.blackListingQuota} BLK
              </span>
            </div>
          )}
          <button
            onClick={() => router.refresh()}
            disabled={isRefreshing}
            className="p-2 rounded-full hover:bg-secondary/50 active:bg-secondary transition-colors disabled:opacity-50"
            aria-label="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4 text-muted-foreground", isRefreshing && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 compact:gap-4 mb-6 compact:mb-8">
        {/* Row 1: Search + Staff Filter */}
        <div className="flex flex-col compact:flex-row items-stretch compact:items-center gap-3 compact:gap-4">
        {/* Search */}
        <div className="relative flex-1 compact:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full h-9 compact:h-10 pl-10 pr-8 rounded-lg compact:rounded-xl bg-secondary/50 text-caption1 compact:text-subhead placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all"
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
        {activeStaff.length > 0 && (
          <div className="w-full compact:w-48">
            <Combobox
              options={staffOptions}
              value={selectedStaffFilter}
              onValueChange={handleStaffFilterChange}
              placeholder="All Staff"
              searchPlaceholder="Search staff..."
              className="h-9 compact:h-10 rounded-lg compact:rounded-xl bg-secondary/50 border-0"
            />
          </div>
        )}
        </div>

        {/* Row 2: Status Pills - Horizontal scroll on mobile */}
        <div className="-mx-4 px-4 compact:mx-0 compact:px-0 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-xl w-fit">
          {(['active', 'sold', 'archived', 'expired', 'all'] as StatusTab[]).map((status) => {
            const isActive = selectedStatusTab === status;
            const count = status === 'all' ? stats?.all : stats?.[status] || 0;
            // Only show tabs that have items (except active and all which always show)
            if (status !== 'active' && status !== 'all' && count === 0) return null;
            return (
              <button
                key={status}
                onClick={() => handleStatusTabChange(status)}
                className={`px-2.5 compact:px-3 py-1 compact:py-1.5 rounded-lg text-caption2 compact:text-caption1 transition-all capitalize whitespace-nowrap ${
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {status === 'all' ? 'All' : status}
                {count !== undefined && count > 0 && (
                  <span className="ml-1 compact:ml-1.5 text-muted-foreground">{count}</span>
                )}
              </button>
            );
          })}
        </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-8 p-4 rounded-xl bg-secondary/50 text-subhead">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 compact:p-5 rounded-[20px]">
              <div className="flex items-start gap-4 compact:gap-5">
                <Skeleton className="w-24 h-16 compact:w-32 compact:h-20 rounded-[20px] shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-6 w-16 rounded-lg" />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3">
                    <div className="space-y-1">
                      <Skeleton className="h-2 w-8" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-2 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Listings */}
      {!isLoading && !error && listings.length > 0 && (
        <div className={cn("transition-opacity duration-200", isRefreshing && "opacity-50 pointer-events-none")}>
          {/* Count */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <p className="text-caption1 text-muted-foreground">
                {totalItems} listing{totalItems !== 1 ? 's' : ''}
                {selectedStaffFilter !== 'all' && ` by ${activeStaff.find(s => s.userId === selectedStaffFilter)?.displayName}`}
              </p>
              {isRefreshing && (
                <div className="w-3 h-3 border border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
              )}
            </div>
            {totalPages > 1 && (
              <p className="text-caption1 text-muted-foreground">{currentPage} / {totalPages}</p>
            )}
          </div>

          {/* List */}
          <div className="space-y-3">
            {listings.map((listing) => {
              const statusBadge = getStatusBadge(listing);
              const teamMember = listing.postedByUserId ? teamMemberMap.get(listing.postedByUserId) : null;
              
              return (
                <div
                  key={listing.id}
                  className={cn(
                    "group p-4 compact:p-5 rounded-[20px] hover:bg-secondary/40 transition-colors border border-transparent hover:border-border/40",
                    listing.isBlkListing && "bg-black/5"
                  )}
                >
                  <div className="flex items-start gap-4 compact:gap-5">
                    {/* Thumbnail */}
                    <div className="w-24 h-16 compact:w-32 compact:h-20 rounded-[20px] overflow-hidden bg-secondary flex-shrink-0 relative">
                      {getAppThumbUrl(listing.thumbnail) ? (
                        <img
                          src={getAppThumbUrl(listing.thumbnail)!}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Box className="w-6 h-6 text-muted-foreground/30" />
                        </div>
                      )}
                      {listing.isBlkListing && (
                        <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded bg-black flex items-center justify-center">
                          <Crown className="w-3 h-3 text-white/90" />
                        </div>
                      )}
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      {/* Title + Status Row */}
                      <div className="flex items-start justify-between gap-3">
                        <Link href={`/listings/${listing.id}`} className="hover:underline min-w-0">
                          <p className="text-subhead compact:text-callout font-semibold tracking-tight truncate">
                            {listing.year} {listing.make} {listing.model}
                            {listing.trim && ` ${listing.trim}`}
                          </p>
                        </Link>
                        <span className={`px-2.5 py-1 rounded-lg text-caption1 font-semibold whitespace-nowrap flex-shrink-0 ${statusBadge.bg} ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </div>

                      {/* Details Grid */}
                      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2">
                        {/* Price */}
                        <div>
                          <p className="text-caption2 uppercase tracking-wider text-muted-foreground/60 mb-0.5">Price</p>
                          <p className="text-subhead text-foreground">{listing.price.toLocaleString()} AED</p>
                        </div>

                        {/* Assigned To */}
                        <div>
                          <p className="text-caption2 uppercase tracking-wider text-muted-foreground/60 mb-0.5">Assigned To</p>
                          <p className={cn("text-subhead", (listing.staffMember?.displayName || listing.postedByDisplayName) ? 'text-foreground' : 'text-muted-foreground/60', teamMember?.status === 'left' && 'opacity-50')}>
                            {listing.staffMember?.displayName || listing.postedByDisplayName || 'Unassigned'}
                          </p>
                        </div>
                      </div>

                      {/* Expiry + Actions Row */}
                      <div className="flex items-center justify-between mt-3">
                      {/* Expiry countdown */}
                      {(() => {
                        const expiresAt = listing.expiresAt ? new Date(listing.expiresAt as any) : null;
                        const msRemaining = expiresAt ? expiresAt.getTime() - Date.now() : null;
                        const daysRemaining = msRemaining ? Math.ceil(msRemaining / (24 * 60 * 60 * 1000)) : null;
                        const isExpiringSoon = listing.lifecycleStatus === 'active' && msRemaining !== null && msRemaining > 0 && msRemaining <= 2 * 24 * 60 * 60 * 1000;
                        if (listing.lifecycleStatus !== 'active' || daysRemaining === null || msRemaining === null || msRemaining <= 0) return null;
                        return (
                          <span className={cn(
                            "flex items-center gap-1 text-caption1",
                            isExpiringSoon ? "text-warning" : "text-muted-foreground"
                          )}>
                            <Clock className="w-3 h-3" />
                            {daysRemaining}d left
                          </span>
                        );
                      })()}
                      <div className="flex items-center gap-2 compact:opacity-0 compact:group-hover:opacity-100 transition-opacity">
                        <Link href={`/listings/${listing.id}`}>
                          <button className="px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary text-caption1 transition-colors">
                            View
                          </button>
                        </Link>
                        {canReassign && activeStaff.length > 0 && listing.lifecycleStatus === 'active' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button 
                                disabled={reassigningListingId === listing.id}
                                className="px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary text-caption1 transition-colors flex items-center gap-1 disabled:opacity-50"
                              >
                                {reassigningListingId === listing.id ? 'Reassigning...' : 'Reassign'}
                                <ChevronDown className="w-3 h-3" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                              {activeStaff.filter(staff => staff.userId !== listing.postedByUserId).length > 0 ? (
                                activeStaff
                                  .filter(staff => staff.userId !== listing.postedByUserId)
                                  .map(staff => (
                                    <DropdownMenuItem 
                                      key={staff.userId} 
                                      onClick={() => handleReassign(listing.id, staff.userId)}
                                    >
                                      {staff.displayName}
                                    </DropdownMenuItem>
                                  ))
                              ) : (
                                <DropdownMenuItem disabled className="text-muted-foreground">
                                  No other staff available
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-12">
              <button
                onClick={() => updateRoute({ page: Math.max(1, currentPage - 1) })}
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
                    onClick={() => updateRoute({ page: pageNum })}
                    className={`w-8 h-8 rounded-lg text-subhead transition-colors ${
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
                onClick={() => updateRoute({ page: Math.min(totalPages, currentPage + 1) })}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-secondary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty - No Data (no filters, just empty inventory) */}
      {!isLoading && !error && listings.length === 0 && !hasActiveFilters && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <ShoppingCart className="w-10 h-10 text-muted-foreground/20 mb-4" />
          <h3 className="text-headline tracking-tight">No listings yet</h3>
          <p className="text-subhead text-muted-foreground mt-1">Staff can create listings from Work Listings</p>
        </div>
      )}

      {/* Empty - No Results (filters applied but no results) */}
      {!isLoading && !error && listings.length === 0 && hasActiveFilters && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <Search className="w-10 h-10 text-muted-foreground/20 mb-4" />
          <h3 className="text-headline tracking-tight">No results</h3>
          <p className="text-subhead text-muted-foreground mt-1">Try a different search or filter</p>
          <button
            onClick={clearFilters}
            className="mt-4 text-subhead text-foreground hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
