/**
 * Partner Inventory Client Component
 * Minimal macOS-inspired design with client-side filtering
 */

'use client';

import Image from "next/image";
import { UserAvatar } from "@/components/ui/data-display/user-avatar";
import { Combobox } from "@/components/ui/forms/combobox";
import { CheckCircle2, Clock, Archive, ShoppingCart, AlertCircle, XCircle, User, RefreshCw, Crown, Search, ChevronLeft, ChevronRight, X, Box } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/utils";
import { DashboardPageWrapper, DashboardPageHeader } from '@/components/shared/layout/dashboard-page-wrapper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';

// Status tab types
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

interface StaffMemberStats {
  userId: string;
  displayName: string;
  username: string;
  listingCount: number;
  isActive?: boolean;
}

interface TeamMember {
  id: string;
  userId: string;
  status: 'active' | 'left';
  displayName: string;
  username: string;
  avatar: string | null;
}

// Status config with colors
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: 'text-green-600', bg: 'bg-green-500/10' },
  public: { label: 'Public', color: 'text-green-600', bg: 'bg-green-500/10' },
  draft: { label: 'Draft', color: 'text-yellow-600', bg: 'bg-yellow-500/10' },
  in_review: { label: 'In Review', color: 'text-blue-600', bg: 'bg-blue-500/10' },
  pending_review: { label: 'In Review', color: 'text-blue-600', bg: 'bg-blue-500/10' },
  submitted: { label: 'In Review', color: 'text-blue-600', bg: 'bg-blue-500/10' },
  rejected: { label: 'Rejected', color: 'text-red-600', bg: 'bg-red-500/10' },
  archived: { label: 'Archived', color: 'text-muted-foreground', bg: 'bg-secondary' },
  sold: { label: 'Sold', color: 'text-purple-600', bg: 'bg-purple-500/10' },
  expired: { label: 'Expired', color: 'text-orange-600', bg: 'bg-orange-500/10' },
  suspended: { label: 'Suspended', color: 'text-red-600', bg: 'bg-red-500/10' },
  deleted: { label: 'Deleted', color: 'text-red-600', bg: 'bg-red-500/10' },
};

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
  const [ownerUserId, setOwnerUserId] = useState<string | null>(null);
  const [blackQuota, setBlackQuota] = useState<BlackQuotaData | null>(null);
  
  // Filter state
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('all');
  const [selectedStatusTab, setSelectedStatusTab] = useState<StatusTab>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
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

      // Fetch listings, team data, and black quota in parallel
      const [listingsResponse, teamResponse, blackQuotaResponse] = await Promise.all([
        fetch(
          `/api/listings/my-listings?listingType=work&partnerId=${partnerId}&includeStats=1`,
          {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
            signal: abortRef.current.signal,
          }
        ),
        fetch('/api/partner/staff', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
          signal: abortRef.current.signal,
        }),
        fetch('/api/partner/black-quota', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
          signal: abortRef.current.signal,
        }),
      ]);

      if (!listingsResponse.ok) {
        const errorData = await listingsResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch partner listings: ${listingsResponse.status}`);
      }

      const listingsData = await listingsResponse.json();
      setListings(listingsData.data || listingsData.listings || []);
      
      if (listingsData.stats) {
        setStats(listingsData.stats);
      }

      // Process team data if available
      if (teamResponse.ok) {
        const teamData = await teamResponse.json();
        const allStaff: StaffApiResponse[] = teamData.data || [];
        
        // Find and store owner's userId (check both isOwner flag and role)
        const owner = allStaff.find((m) => m.isOwner || m.role === 'owner');
        if (owner) {
          setOwnerUserId(owner.userId);
        }
        
        // Filter out owners - they shouldn't appear in staff inventory
        const members = allStaff
          .filter((m) => !m.isOwner && m.role !== 'owner')
          .map((m) => ({
            id: m.id,
            userId: m.userId, // Use actual userId, not staff record id
            status: m.status,
            displayName: m.displayName || m.userName || m.userEmail,
            username: m.userEmail?.split('@')[0] || '',
            avatar: m.userAvatar, // Use personal avatar for internal ops
          }));
        setTeamMembers(members);
      }

      // Process black quota if available
      if (blackQuotaResponse.ok) {
        const quotaData = await blackQuotaResponse.json();
        if (quotaData.success && quotaData.data) {
          setBlackQuota(quotaData.data);
        }
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
  }, [partnerId]);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchListings();
    }
    return () => { abortRef.current?.abort(); };
  }, [fetchListings]);

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

  // Calculate staff member stats with active/resigned status (excluding owner)
  // Also includes team members with 0 listings for complete staff display
  // Listing count is based on the selected status tab for consistency
  const allStaffData = useMemo(() => {
    const staffMap = new Map<string, StaffMemberStats & { avatar?: string | null }>();
    
    // Filter listings by selected status tab first
    const listingsForStats = selectedStatusTab === 'all' 
      ? listings 
      : listings.filter(l => l.lifecycleStatus === selectedStatusTab);
    
    // Build stats from filtered listings (for staff who have posted)
    listingsForStats.forEach(listing => {
      // Skip listings created by the owner
      if (listing.postedByUserId && listing.postedByDisplayName && listing.postedByUserId !== ownerUserId) {
        const existing = staffMap.get(listing.postedByUserId);
        if (existing) {
          existing.listingCount++;
        } else {
          const teamMember = teamMemberMap.get(listing.postedByUserId);
          const isActive = teamMember ? teamMember.status === 'active' : true;
          
          staffMap.set(listing.postedByUserId, {
            userId: listing.postedByUserId,
            displayName: listing.postedByDisplayName,
            username: listing.postedByUsername || '',
            listingCount: 1,
            avatar: teamMember?.avatar || listing.postedByAvatar, // Prefer personal avatar
            isActive,
          });
        }
      }
    });
    
    // Add active team members who don't have any listings yet
    teamMembers.forEach(m => {
      if (m.status === 'active' && !staffMap.has(m.userId)) {
        staffMap.set(m.userId, {
          userId: m.userId,
          displayName: m.displayName,
          username: m.displayName?.split(' ')[0]?.toLowerCase() || '',
          listingCount: 0,
          isActive: true,
          avatar: m.avatar,
        });
      }
    });
    
    // Convert to array and sort: active staff first, then resigned, each sorted by listing count
    const allStaff = Array.from(staffMap.values()).sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return b.listingCount - a.listingCount;
    });
    
    // Separate for different uses
    const activeStaff = allStaff.filter(s => s.isActive !== false);
    const staffWithListings = allStaff.filter(s => s.listingCount > 0);
    
    return { allStaff, activeStaff, staffWithListings };
  }, [listings, teamMembers, teamMemberMap, ownerUserId, selectedStatusTab]);

  // Derived values for different use cases
  const allStaffForDisplay = allStaffData.allStaff;
  const staffStats = allStaffData.staffWithListings;

  // Staff options for combobox
  const staffOptions = useMemo(() => {
    const options = [{ value: 'all', label: 'All Staff' }];
    allStaffForDisplay.forEach(staff => {
      options.push({
        value: staff.userId,
        label: `${staff.displayName} (${staff.listingCount})`,
      });
    });
    return options;
  }, [allStaffForDisplay]);

  // Multi-filter listings: staff + status + search
  const filteredListings = useMemo(() => {
    let filtered = listings;
    
    // Filter by staff
    if (selectedStaffFilter !== 'all') {
      filtered = filtered.filter(l => l.postedByUserId === selectedStaffFilter);
    }
    
    // Filter by status tab
    if (selectedStatusTab !== 'all') {
      filtered = filtered.filter(l => l.lifecycleStatus === selectedStatusTab);
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(l => 
        l.make.toLowerCase().includes(query) ||
        l.model.toLowerCase().includes(query) ||
        (l.trim && l.trim.toLowerCase().includes(query)) ||
        l.year.toString().includes(query) ||
        l.postedByDisplayName?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [listings, selectedStaffFilter, selectedStatusTab, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE);
  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredListings.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredListings, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStaffFilter, selectedStatusTab, searchQuery]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSelectedStaffFilter('all');
    setSelectedStatusTab('active');
    setSearchQuery('');
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
    <DashboardPageWrapper>
      {/* Header */}
      <DashboardPageHeader
        title="Inventory"
        description="Manage your dealership listings"
      >
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
      </DashboardPageHeader>

        {/* Stats */}
        {stats && (
          <div className="flex items-center gap-10">
            <div>
              <span className="text-xs text-muted-foreground">Active</span>
              <p className="text-xl font-semibold tracking-tight mt-1 text-blue-500">{stats.active}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Public</span>
              <p className="text-xl font-semibold tracking-tight mt-1 text-green-500">{stats.public}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Draft</span>
              <p className="text-xl font-semibold tracking-tight mt-1 text-yellow-500">{stats.draft}</p>
            </div>
            {stats.inReview > 0 && (
              <div>
                <span className="text-xs text-muted-foreground">In Review</span>
                <p className="text-xl font-semibold tracking-tight mt-1 text-blue-500">{stats.inReview}</p>
              </div>
            )}
            {stats.sold > 0 && (
              <div>
                <span className="text-xs text-muted-foreground">Sold</span>
                <p className="text-xl font-semibold tracking-tight mt-1 text-purple-500">{stats.sold}</p>
              </div>
            )}
            <div>
              <span className="text-xs text-muted-foreground">Total</span>
              <p className="text-xl font-semibold tracking-tight mt-1">{stats.all}</p>
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
            placeholder="Search..."
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

        {/* Status Pills */}
        <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-xl">
          {(['active', 'sold', 'archived', 'expired', 'all'] as StatusTab[]).map((status) => {
            const isActive = selectedStatusTab === status;
            const count = status === 'all' ? stats?.all : stats?.[status] || 0;
            // Only show tabs that have items (except active and all which always show)
            if (status !== 'active' && status !== 'all' && count === 0) return null;
            return (
              <button
                key={status}
                onClick={() => setSelectedStatusTab(status)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all capitalize ${
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {status === 'all' ? 'All' : status}
                {count !== undefined && count > 0 && (
                  <span className="ml-1.5 text-muted-foreground">{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Staff Combobox */}
        {allStaffForDisplay.length > 0 && (
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
      {!isLoading && !error && filteredListings.length > 0 && (
        <>
          {/* Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs text-muted-foreground">
              {filteredListings.length} listing{filteredListings.length !== 1 ? 's' : ''}
              {selectedStaffFilter !== 'all' && ` by ${staffStats.find(s => s.userId === selectedStaffFilter)?.displayName}`}
            </p>
            {totalPages > 1 && (
              <p className="text-xs text-muted-foreground">{currentPage} / {totalPages}</p>
            )}
          </div>

          {/* List */}
          <div className="space-y-1">
            {paginatedListings.map((listing) => {
              const statusBadge = getStatusBadge(listing);
              const teamMember = listing.postedByUserId ? teamMemberMap.get(listing.postedByUserId) : null;
              
              return (
                <div
                  key={listing.id}
                  className={cn(
                    "group flex items-center gap-5 p-4 -mx-4 rounded-xl hover:bg-secondary/30 transition-colors",
                    listing.isBlkListing && "bg-zinc-500/5"
                  )}
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-14 rounded-lg overflow-hidden bg-secondary flex-shrink-0 relative">
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
                      <p className="text-sm font-medium tracking-tight truncate">
                        {listing.year} {listing.make} {listing.model}
                        {listing.trim && ` ${listing.trim}`}
                      </p>
                    </Link>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {listing.price.toLocaleString()} AED
                      {listing.postedByDisplayName && (
                        <span className={teamMember?.status === 'left' ? 'opacity-50' : ''}>
                          {' · '}{listing.postedByDisplayName}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/listings/${listing.id}`}>
                      <button className="px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary text-xs transition-colors">
                        View
                      </button>
                    </Link>
                    {canReassign && allStaffData.activeStaff.length > 0 && (
                      <button
                        onClick={() => setReassignModal({
                          open: true,
                          listingId: listing.id,
                          listingTitle: `${listing.year} ${listing.make} ${listing.model}`,
                          currentManagerId: listing.postedByUserId || null,
                        })}
                        className="px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary text-xs transition-colors"
                      >
                        Reassign
                      </button>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusBadge.bg} ${statusBadge.color}`}>
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
        </>
      )}

      {/* Empty - No Data */}
      {!isLoading && !error && listings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <ShoppingCart className="w-10 h-10 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-medium tracking-tight">No listings yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Staff can create listings from Work Listings</p>
        </div>
      )}

      {/* Empty - No Results */}
      {!isLoading && !error && listings.length > 0 && filteredListings.length === 0 && (
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
          
          <div className="relative z-50 bg-background border border-border rounded-xl p-6 max-w-md w-full mx-4 space-y-6">
            <div>
              <h3 className="text-lg font-medium tracking-tight">Reassign Listing</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Reassign <span className="font-medium text-foreground">{reassignModal.listingTitle}</span>
              </p>
            </div>
            
            {/* Staff Selection */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="w-3.5 h-3.5" />
                Select Staff Member
              </label>
              <Select value={reassignTargetUserId} onValueChange={(v) => setReassignTargetUserId(v)}>
                <SelectTrigger className="h-10 rounded-xl bg-secondary/50 border-0">
                  <SelectValue placeholder="Select staff member..." />
                </SelectTrigger>
                <SelectContent>
                  {allStaffData.activeStaff
                    .filter(staff => staff.userId !== reassignModal.currentManagerId)
                    .map(staff => (
                      <SelectItem key={staff.userId} value={staff.userId}>
                        {staff.displayName} ({staff.listingCount} listings)
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
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setReassignModal({ open: false, listingId: null, listingTitle: '', currentManagerId: null });
                  setReassignTargetUserId('');
                  setReassignError(null);
                }}
                disabled={isReassigning}
                className="px-4 py-2 rounded-full text-sm hover:bg-secondary/50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReassign}
                disabled={!reassignTargetUserId || isReassigning}
                className="px-4 py-2 rounded-full bg-foreground text-background text-sm font-medium transition-colors hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isReassigning ? 'Reassigning...' : 'Reassign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardPageWrapper>
  );
}
