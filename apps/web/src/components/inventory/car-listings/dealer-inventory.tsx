/**
 * Partner Inventory Client Component
 * Minimal macOS-inspired design with server-side filtering
 */

'use client';

import Image from "next/image";
import { Combobox } from "@/components/ui/forms/combobox";
import { ShoppingCart, User, RefreshCw, Crown, Search, ChevronLeft, ChevronRight, X, Box } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import { useDebouncedCallback } from 'use-debounce';

// Status tab types - maps to lifecycleStatus API param
type StatusTab = 'active' | 'sold' | 'archived' | 'expired' | 'all';

interface DealerInventoryProps {
  partnerId: string;
  partnerName?: string;
  partnerVerified?: boolean;
  userRole?: string;
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
}

interface BlackQuotaData {
  partnerId: string;
  tier: string;
  blackListingQuota: number;
  activeBlackListingsCount: number;
  hasAvailableSlots: boolean;
}

interface StaffApiResponse {
  id: string;
  userId: string;
  status: 'active' | 'left';
  role?: string;
  isOwner?: boolean;
  displayName?: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string | null;
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
  partnerId, 
  partnerName: _partnerName, 
  partnerVerified: _partnerVerified,
  userRole 
}: DealerInventoryProps) {
  // Data state
  const [listings, setListings] = useState<ListingData[]>([]);
  const [stats, setStats] = useState<ListingStats | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [blackQuota, setBlackQuota] = useState<BlackQuotaData | null>(null);
  
  // Server-side filter state (these trigger API calls)
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('all');
  const [selectedStatusTab, setSelectedStatusTab] = useState<StatusTab>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedInitialRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  
  // Reassign modal state
  const [reassignModal, setReassignModal] = useState<{
    open: boolean;
    listingId: string | null;
    listingTitle: string;
    currentManagerId: string | null;
  }>({ open: false, listingId: null, listingTitle: '', currentManagerId: null });
  const [reassignTargetUserId, setReassignTargetUserId] = useState<string>('');
  const [isReassigning, setIsReassigning] = useState(false);
  const [reassignError, setReassignError] = useState<string | null>(null);

  // Check if user can reassign (owner or admin)
  const canReassign = userRole === 'owner' || userRole === 'admin';

  // Debounce search input to avoid too many API calls
  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setDebouncedSearch(value);
    setCurrentPage(1); // Reset to first page on new search
  }, 400);

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    debouncedSetSearch(value);
  }, [debouncedSetSearch]);

  // Fetch team members once on mount
  const fetchTeamData = useCallback(async (signal: AbortSignal) => {
    try {
      const [teamResponse, blackQuotaResponse] = await Promise.all([
        fetch('/api/partner/staff', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
          signal,
        }),
        fetch('/api/partner/black-quota', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
          signal,
        }),
      ]);

      // Process team data
      if (teamResponse.ok) {
        const teamData = await teamResponse.json();
        const allStaff: StaffApiResponse[] = teamData.data || [];
        
        const members = allStaff
          .filter((m) => !m.isOwner && m.role !== 'owner')
          .map((m) => ({
            id: m.id,
            userId: m.userId,
            status: m.status,
            displayName: m.displayName || m.userName || m.userEmail,
            username: m.userEmail?.split('@')[0] || '',
            avatar: m.userAvatar,
          }));
        setTeamMembers(members);
      }

      // Process black quota
      if (blackQuotaResponse.ok) {
        const quotaData = await blackQuotaResponse.json();
        if (quotaData.success && quotaData.data) {
          setBlackQuota(quotaData.data);
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error('[DealerInventory] Error fetching team data:', err);
    }
  }, []);

  // Fetch listings with server-side filters
  const fetchListings = useCallback(async (isRefresh = false) => {
    if (!partnerId) return;
    
    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // Build query params for server-side filtering
      const params = new URLSearchParams({
        listingType: 'work',
        partnerId,
        includeStats: '1',
        limit: String(ITEMS_PER_PAGE),
        offset: String((currentPage - 1) * ITEMS_PER_PAGE),
      });

      // Add lifecycle status filter (maps to our status tabs)
      if (selectedStatusTab !== 'all') {
        params.set('lifecycleStatus', selectedStatusTab);
      }

      // Add staff filter
      if (selectedStaffFilter !== 'all') {
        params.set('staffMemberUserId', selectedStaffFilter);
      }

      // Add search query
      if (debouncedSearch.trim()) {
        params.set('q', debouncedSearch.trim());
      }

      const response = await fetch(`/api/listings/my-listings?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch listings: ${response.status}`);
      }

      const data = await response.json();
      setListings(data.data || data.listings || []);
      
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch listings';
      setError(errorMessage);
      console.error('[DealerInventory] Error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [partnerId, currentPage, selectedStatusTab, selectedStaffFilter, debouncedSearch]);

  // Initial fetch - team data once, listings will be fetched by effect below
  useEffect(() => {
    if (!hasFetchedInitialRef.current) {
      hasFetchedInitialRef.current = true;
      const controller = new AbortController();
      fetchTeamData(controller.signal);
      return () => controller.abort();
    }
  }, [fetchTeamData]);

  // Fetch listings whenever filters change
  useEffect(() => {
    fetchListings();
    return () => { abortRef.current?.abort(); };
  }, [fetchListings]);

  // Reset page when filters change (except for page itself)
  const handleStatusTabChange = useCallback((tab: StatusTab) => {
    setSelectedStatusTab(tab);
    setCurrentPage(1);
  }, []);

  const handleStaffFilterChange = useCallback((value: string) => {
    setSelectedStaffFilter(value);
    setCurrentPage(1);
  }, []);

  // Handle reassigning a listing to a different staff member
  const handleReassign = async () => {
    if (!reassignModal.listingId || !reassignTargetUserId) return;
    
    setIsReassigning(true);
    setReassignError(null);
    
    try {
      const response = await fetch(`/api/listings/${reassignModal.listingId}/reassign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newUserId: reassignTargetUserId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to reassign listing');
      }
      
      // Refresh listings
      await fetchListings(true);
      
      // Close modal
      setReassignModal({ open: false, listingId: null, listingTitle: '', currentManagerId: null });
      setReassignTargetUserId('');
    } catch (err) {
      setReassignError(err instanceof Error ? err.message : 'Failed to reassign listing');
    } finally {
      setIsReassigning(false);
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

  // Calculate total pages from stats based on current filter
  const getTotalForCurrentFilter = useCallback(() => {
    if (!stats) return 0;
    switch (selectedStatusTab) {
      case 'active': return stats.active;
      case 'sold': return stats.sold;
      case 'archived': return stats.archived;
      case 'expired': return stats.expired;
      case 'all': return stats.all;
      default: return stats.all;
    }
  }, [stats, selectedStatusTab]);

  const totalItems = getTotalForCurrentFilter();
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSelectedStaffFilter('all');
    setSelectedStatusTab('active');
    setSearchQuery('');
    setDebouncedSearch('');
    setCurrentPage(1);
  }, []);

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
      return { label: 'Deleted', color: 'text-red-600', bg: 'bg-red-500/10' };
    }
    
    // For active listings, check moderation status
    if (listing.moderationStatus === 'rejected') {
      return { label: 'Rejected', color: 'text-red-600', bg: 'bg-red-500/10' };
    }
    if (listing.moderationStatus === 'draft') {
      return { label: 'Draft', color: 'text-yellow-600', bg: 'bg-yellow-500/10' };
    }
    if (listing.moderationStatus === 'submitted' || listing.moderationStatus === 'pending_review') {
      return { label: 'In Review', color: 'text-blue-600', bg: 'bg-blue-500/10' };
    }
    if (listing.isPublic) {
      return { label: 'Active', color: 'text-green-600', bg: 'bg-green-500/10' };
    }
    
    return { label: 'Not Public', color: 'text-muted-foreground', bg: 'bg-secondary' };
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-foreground">Inventory</h1>
          <p className="text-[11px] sm:text-xs text-muted-foreground/60 mt-0.5">Manage your dealership listings</p>
        </div>
        <div className="flex items-center gap-2">
          {/* BLK Quota Badge */}
          {blackQuota && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/80 text-zinc-100">
              <Crown className="w-3 h-3" />
              <span className="text-xs font-medium">
                {blackQuota.activeBlackListingsCount}/{blackQuota.blackListingQuota} BLK
              </span>
            </div>
          )}
          <button
            onClick={() => fetchListings(true)}
            disabled={isRefreshing}
            className="p-2 rounded-full hover:bg-secondary/50 active:bg-secondary transition-colors disabled:opacity-50"
            aria-label="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4 text-muted-foreground", isRefreshing && "animate-spin")} />
          </button>
        </div>
      </div>

        {/* Stats */}
        {stats && (
          <div className="flex flex-wrap items-center gap-6 sm:gap-10">
            <div>
              <span className="text-xs text-muted-foreground">Active</span>
              <p className="text-lg sm:text-xl font-semibold tracking-tight mt-1 text-blue-500">{stats.active}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Public</span>
              <p className="text-lg sm:text-xl font-semibold tracking-tight mt-1 text-green-500">{stats.public}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Draft</span>
              <p className="text-lg sm:text-xl font-semibold tracking-tight mt-1 text-yellow-500">{stats.draft}</p>
            </div>
            {stats.inReview > 0 && (
              <div>
                <span className="text-xs text-muted-foreground">In Review</span>
                <p className="text-lg sm:text-xl font-semibold tracking-tight mt-1 text-blue-500">{stats.inReview}</p>
              </div>
            )}
            {stats.sold > 0 && (
              <div>
                <span className="text-xs text-muted-foreground">Sold</span>
                <p className="text-lg sm:text-xl font-semibold tracking-tight mt-1 text-purple-500">{stats.sold}</p>
              </div>
            )}
            <div>
              <span className="text-xs text-muted-foreground">Total</span>
              <p className="text-lg sm:text-xl font-semibold tracking-tight mt-1">{stats.all}</p>
            </div>
          </div>
        )}

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* Row 1: Search + Staff Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
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
        {activeStaff.length > 0 && (
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
        </div>

        {/* Row 2: Status Pills - Horizontal scroll on mobile */}
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-hide">
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
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs transition-all capitalize whitespace-nowrap ${
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {status === 'all' ? 'All' : status}
                {count !== undefined && count > 0 && (
                  <span className="ml-1 sm:ml-1.5 text-muted-foreground">{count}</span>
                )}
              </button>
            );
          })}
        </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors self-end sm:self-auto"
          >
            Reset
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-8 p-4 rounded-xl bg-secondary/50 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-5 h-5 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground mt-4">Loading...</p>
        </div>
      )}

      {/* Listings */}
      {!isLoading && !error && listings.length > 0 && (
        <div className={cn("transition-opacity duration-200", isRefreshing && "opacity-50 pointer-events-none")}>
          {/* Count */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                {totalItems} listing{totalItems !== 1 ? 's' : ''}
                {selectedStaffFilter !== 'all' && ` by ${activeStaff.find(s => s.userId === selectedStaffFilter)?.displayName}`}
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
          <div className="space-y-2">
            {listings.map((listing) => {
              const statusBadge = getStatusBadge(listing);
              const teamMember = listing.postedByUserId ? teamMemberMap.get(listing.postedByUserId) : null;
              
              return (
                <div
                  key={listing.id}
                  className={cn(
                    "group flex items-center gap-3 sm:gap-4 p-3 rounded-xl hover:bg-secondary/40 transition-colors border border-transparent hover:border-border/40",
                    listing.isBlkListing && "bg-zinc-500/5"
                  )}
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden bg-secondary flex-shrink-0 relative">
                    {listing.thumbnail ? (
                      <Image
                        src={listing.thumbnail}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Box className="w-4 h-4 text-muted-foreground/30" />
                      </div>
                    )}
                    {listing.isBlkListing && (
                      <div className="absolute top-1 left-1 w-4 h-4 rounded bg-zinc-800 flex items-center justify-center">
                        <Crown className="w-2.5 h-2.5 text-zinc-100" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/listings/${listing.id}`} className="hover:underline">
                      <p className="text-sm font-semibold tracking-tight truncate">
                        {listing.year} {listing.make} {listing.model}
                        {listing.trim && ` ${listing.trim}`}
                      </p>
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">
                        {listing.price.toLocaleString()} AED
                      </p>
                      {listing.postedByDisplayName && (
                        <>
                          <span className="text-xs text-muted-foreground/40">·</span>
                          <p className={cn("text-xs text-muted-foreground/70", teamMember?.status === 'left' && 'opacity-50')}>
                            {listing.postedByDisplayName}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions - Show on hover for desktop, always visible on mobile */}
                  <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Link href={`/listings/${listing.id}`}>
                      <button className="px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary text-xs font-medium transition-colors">
                        View
                      </button>
                    </Link>
                    {canReassign && activeStaff.length > 0 && (
                      <button
                        onClick={() => setReassignModal({
                          open: true,
                          listingId: listing.id,
                          listingTitle: `${listing.year} ${listing.make} ${listing.model}`,
                          currentManagerId: listing.postedByUserId || null,
                        })}
                        className="px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary text-xs font-medium transition-colors"
                      >
                        Reassign
                      </button>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    <span className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${statusBadge.bg} ${statusBadge.color}`}>
                      {statusBadge.label}
                    </span>
                  </div>
                </div>
              );
            })}
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

      {/* Empty - No Data (no filters, just empty inventory) */}
      {!isLoading && !error && listings.length === 0 && !hasActiveFilters && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <ShoppingCart className="w-10 h-10 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-medium tracking-tight">No listings yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Staff can create listings from Work Listings</p>
        </div>
      )}

      {/* Empty - No Results (filters applied but no results) */}
      {!isLoading && !error && listings.length === 0 && hasActiveFilters && (
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

      {/* Reassign Modal */}
      {reassignModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-background/40 backdrop-blur-2xl" onClick={() => {
            setReassignModal({ open: false, listingId: null, listingTitle: '', currentManagerId: null });
            setReassignTargetUserId('');
            setReassignError(null);
          }} />
          
          <div className="relative z-50 bg-background border border-border rounded-xl p-5 sm:p-6 max-w-md w-full mx-4 space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-medium tracking-tight">Reassign Listing</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Reassign <span className="font-medium text-foreground">{reassignModal.listingTitle}</span>
              </p>
            </div>
            
            {/* Staff Selection */}
            <div className="space-y-2 sm:space-y-3">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="w-3.5 h-3.5" />
                Select Staff Member
              </label>
              <Select value={reassignTargetUserId} onValueChange={(v) => setReassignTargetUserId(v)}>
                <SelectTrigger className="h-9 sm:h-10 rounded-lg sm:rounded-xl bg-secondary/50 border-0">
                  <SelectValue placeholder="Select staff member..." />
                </SelectTrigger>
                <SelectContent>
                  {activeStaff
                    .filter(staff => staff.userId !== reassignModal.currentManagerId)
                    .map(staff => (
                      <SelectItem key={staff.userId} value={staff.userId}>
                        {staff.displayName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Error */}
            {reassignError && (
              <div className="p-3 rounded-xl bg-red-500/10">
                <p className="text-sm text-red-600">{reassignError}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
              <button
                onClick={() => {
                  setReassignModal({ open: false, listingId: null, listingTitle: '', currentManagerId: null });
                  setReassignTargetUserId('');
                  setReassignError(null);
                }}
                disabled={isReassigning}
                className="px-4 py-2 rounded-lg sm:rounded-full text-sm hover:bg-secondary/50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReassign}
                disabled={!reassignTargetUserId || isReassigning}
                className="px-4 py-2 rounded-lg sm:rounded-full bg-foreground text-background text-sm font-medium transition-colors hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isReassigning ? 'Reassigning...' : 'Reassign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
