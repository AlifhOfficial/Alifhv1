/**
 * Partner Inventory Client Component
 * Displays partner's work listings using my-listings API
 * Partners can view and organize, but not create listings
 */

'use client';

import { CarCard } from "./car-card";
import { UserAvatar } from "@/components/ui/data-display/user-avatar";
import { Users, CheckCircle2, Clock, Archive, ShoppingCart, AlertCircle, XCircle, User, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';

// Status tab types
type StatusTab = 'active' | 'sold' | 'archived' | 'expired' | 'all';

interface PartnerInventoryClientProps {
  partnerId: string;
  partnerName: string;
  partnerVerified: boolean;
  userRole?: string; // owner | admin | staff
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
  isActive?: boolean; // true if still active, false if resigned
}

interface TeamMember {
  id: string;
  userId: string;
  status: 'active' | 'left';
  displayName: string;
  username: string;
  avatar: string | null;
}

export function PartnerInventoryClient({ 
  partnerId, 
  partnerName, 
  partnerVerified,
  userRole 
}: PartnerInventoryClientProps) {
  const [listings, setListings] = useState<ListingData[]>([]);
  const [stats, setStats] = useState<ListingStats | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [ownerUserId, setOwnerUserId] = useState<string | null>(null);
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('all');
  const [selectedStatusTab, setSelectedStatusTab] = useState<StatusTab>('active');
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

      // Fetch listings and team data in parallel
      const [listingsResponse, teamResponse] = await Promise.all([
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
        const allStaff = teamData.data || [];
        
        // Find and store owner's userId (check both isOwner flag and role)
        const owner = allStaff.find((m: any) => m.isOwner || m.role === 'owner');
        if (owner) {
          setOwnerUserId(owner.userId);
        }
        
        // Filter out owners - they shouldn't appear in staff inventory
        const members = allStaff
          .filter((m: any) => !m.isOwner && m.role !== 'owner')
          .map((m: any) => ({
            id: m.id,
            userId: m.userId, // Use actual userId, not staff record id
            status: m.status,
            displayName: m.displayName || m.userName || m.userEmail,
            username: m.userEmail?.split('@')[0] || '',
            avatar: m.userAvatar, // Use personal avatar for internal ops
          }));
        setTeamMembers(members);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch listings';
      setError(errorMessage);
      console.error('[PartnerInventoryClient] Error:', err);
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

  // Filter listings by selected staff
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
    
    return filtered;
  }, [listings, selectedStaffFilter, selectedStatusTab]);

  const publicListings = useMemo(() => filteredListings.filter((l) => l.isPublic), [filteredListings]);

  // Get status badge props based on listing status
  const getStatusBadge = (listing: ListingData) => {
    // Lifecycle status takes priority
    if (listing.lifecycleStatus === 'sold') {
      return { label: 'Sold', className: 'bg-purple-500/10 text-purple-500', icon: ShoppingCart };
    }
    if (listing.lifecycleStatus === 'expired') {
      return { label: 'Expired', className: 'bg-orange-500/10 text-orange-500', icon: Clock };
    }
    if (listing.lifecycleStatus === 'archived') {
      return { label: 'Archived', className: 'bg-gray-500/10 text-gray-500', icon: Archive };
    }
    if (listing.lifecycleStatus === 'deleted') {
      return { label: 'Deleted', className: 'bg-red-500/10 text-red-500', icon: XCircle };
    }
    
    // For active listings, check moderation status
    if (listing.moderationStatus === 'rejected') {
      return { label: 'Rejected', className: 'bg-red-500/10 text-red-500', icon: XCircle };
    }
    if (listing.moderationStatus === 'draft') {
      return { label: 'Draft', className: 'bg-yellow-500/10 text-yellow-500', icon: AlertCircle };
    }
    if (listing.moderationStatus === 'submitted' || listing.moderationStatus === 'pending_review') {
      return { label: 'In Review', className: 'bg-blue-500/10 text-blue-500', icon: Clock };
    }
    if (listing.isPublic) {
      return { label: 'Active', className: 'bg-green-500/10 text-green-500', icon: CheckCircle2 };
    }
    
    return { label: 'Not Public', className: 'bg-gray-500/10 text-gray-500', icon: AlertCircle };
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 space-y-16">
      {/* Header */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
            <p className="text-sm text-muted-foreground mt-2">
              View and organize your dealership vehicle listings
            </p>
          </div>
          <button
            onClick={() => fetchListings(true)}
            disabled={isRefreshing}
            className="p-2 rounded-full hover:bg-secondary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="space-y-6">
            {/* Primary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 border-y border-border/40 divide-x divide-border/40">
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground mb-2">Active</p>
                <p className="text-2xl font-semibold text-blue-500">{stats.active}</p>
              </div>
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground mb-2">Public</p>
                <p className="text-2xl font-semibold text-green-500">{stats.public}</p>
              </div>
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground mb-2">Draft</p>
                <p className="text-2xl font-semibold text-yellow-500">{stats.draft}</p>
              </div>
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground mb-2">Total</p>
                <p className="text-2xl font-semibold text-foreground">{stats.all}</p>
              </div>
            </div>

            {/* Secondary Stats */}
            {(stats.inReview > 0 || stats.rejected > 0 || stats.archived > 0 || stats.sold > 0 || stats.expired > 0 || stats.suspended > 0) && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {stats.inReview > 0 && (
                  <div className="p-5 rounded-xl border border-border/40 text-center">
                    <p className="text-sm text-muted-foreground mb-2">In Review</p>
                    <p className="text-xl font-semibold text-blue-500">{stats.inReview}</p>
                  </div>
                )}
                {stats.rejected > 0 && (
                  <div className="p-5 rounded-xl border border-border/40 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Rejected</p>
                    <p className="text-xl font-semibold text-red-500">{stats.rejected}</p>
                  </div>
                )}
                {stats.archived > 0 && (
                  <div className="p-5 rounded-xl border border-border/40 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Archived</p>
                    <p className="text-xl font-semibold text-muted-foreground">{stats.archived}</p>
                  </div>
                )}
                {stats.sold > 0 && (
                  <div className="p-5 rounded-xl border border-border/40 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Sold</p>
                    <p className="text-xl font-semibold text-green-500">{stats.sold}</p>
                  </div>
                )}
                {stats.expired > 0 && (
                  <div className="p-5 rounded-xl border border-border/40 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Expired</p>
                    <p className="text-xl font-semibold text-orange-500">{stats.expired}</p>
                  </div>
                )}
                {stats.suspended > 0 && (
                  <div className="p-5 rounded-xl border border-border/40 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Suspended</p>
                    <p className="text-xl font-semibold text-red-500">{stats.suspended}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Status Tabs */}
        {stats && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStatusTab('active')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedStatusTab === 'active'
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border/40 hover:bg-secondary/50'
              }`}
            >
              Active ({stats.active})
            </button>
            {stats.sold > 0 && (
              <button
                onClick={() => setSelectedStatusTab('sold')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedStatusTab === 'sold'
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border/40 hover:bg-secondary/50'
                }`}
              >
                Sold ({stats.sold})
              </button>
            )}
            {stats.archived > 0 && (
              <button
                onClick={() => setSelectedStatusTab('archived')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedStatusTab === 'archived'
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border/40 hover:bg-secondary/50'
                }`}
              >
                Archived ({stats.archived})
              </button>
            )}
            {stats.expired > 0 && (
              <button
                onClick={() => setSelectedStatusTab('expired')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedStatusTab === 'expired'
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border/40 hover:bg-secondary/50'
                }`}
              >
                Expired ({stats.expired})
              </button>
            )}
            <button
              onClick={() => setSelectedStatusTab('all')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedStatusTab === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border/40 hover:bg-secondary/50'
              }`}
            >
              All ({stats.all})
            </button>
          </div>
        )}

        {/* Staff Stats */}
        {allStaffForDisplay.length > 0 && (
          <section className="space-y-8">
            <div className="border-b border-border/40 pb-2">
              <h3 className="text-lg font-medium tracking-tight">Staff Inventory</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Listings managed by each team member
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allStaffForDisplay.map((staff) => (
                <button
                  key={staff.userId}
                  onClick={() => setSelectedStaffFilter(
                    selectedStaffFilter === staff.userId ? 'all' : staff.userId
                  )}
                  className={`p-6 rounded-xl border border-border/40 text-left transition-all ${
                    selectedStaffFilter === staff.userId
                      ? 'bg-secondary/50'
                      : staff.isActive === false
                        ? 'bg-red-500/5 hover:bg-red-500/10'
                        : 'hover:bg-muted/15'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <UserAvatar
                      size="md"
                      src={staff.avatar}
                      name={staff.displayName}
                      className={staff.isActive === false ? 'opacity-60' : ''}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium truncate ${staff.isActive === false ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {staff.displayName}
                        </p>
                        {staff.isActive === false ? (
                          <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-500 text-xs font-medium">Resigned</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-500 text-xs font-medium">Active</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">@{staff.username}</p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-2xl font-semibold ${staff.isActive === false ? 'text-red-500' : 'text-primary'}`}>{staff.listingCount}</p>
                    <p className="text-xs text-muted-foreground">{staff.listingCount === 1 ? 'listing' : 'listings'}</p>
                    {staff.isActive === false && (
                      <span className="text-xs text-red-500">needs reassignment</span>
                    )}
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
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading inventory...</p>
        </div>
      )}

      {/* Listings Section */}
      {!isLoading && !error && filteredListings.length > 0 && (
        <section className="space-y-8">
          <div className="border-b border-border/40 pb-2">
            <h3 className="text-lg font-medium tracking-tight">
              {selectedStatusTab === 'active' ? 'Active Listings' : 
               selectedStatusTab === 'sold' ? 'Sold Listings' : 
               selectedStatusTab === 'archived' ? 'Archived Listings' : 
               selectedStatusTab === 'expired' ? 'Expired Listings' : 
               'All Listings'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'}
              {selectedStaffFilter !== 'all' && ` by ${staffStats.find(s => s.userId === selectedStaffFilter)?.displayName}`}
            </p>
          </div>

          <div className="space-y-4">
            {filteredListings.map((listing) => {
              const statusBadge = getStatusBadge(listing);
              const StatusIcon = statusBadge.icon;
              
              return (
              <div key={listing.id} className="rounded-xl border border-border/40 p-6 hover:bg-secondary/50 transition-colors relative">
                {/* Status Badge - Top Right */}
                <div className="absolute top-4 right-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusBadge.className}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusBadge.label}
                  </span>
                </div>
                
                <div className="flex gap-6">
                  {/* Thumbnail */}
                  <div className="w-48 h-32 bg-muted rounded-xl overflow-hidden flex-shrink-0">
                    {listing.thumbnail ? (
                      <img
                        src={listing.thumbnail}
                        alt={`${listing.year} ${listing.make} ${listing.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <span className="text-xs">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col">
                    <div className="pr-24 flex-1">
                      <Link
                        href={`/listings/${listing.id}`}
                        className="text-lg font-medium hover:text-primary transition-colors"
                      >
                        {listing.year} {listing.make} {listing.model}
                        {listing.trim && ` ${listing.trim}`}
                      </Link>
                      
                      {/* Staff Member Info */}
                      <div className="flex items-center gap-3 mt-2">
                        {listing.postedByDisplayName && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <UserAvatar
                              size="xs"
                              src={teamMemberMap.get(listing.postedByUserId || '')?.avatar || listing.postedByAvatar}
                              name={listing.postedByDisplayName}
                            />
                            <span>Managed by <span className="font-medium text-foreground">{listing.postedByDisplayName}</span></span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions and Price Row */}
                    <div className="flex items-end justify-between mt-4">
                      <div className="flex flex-wrap gap-3">
                        <Link href={`/listings/${listing.id}`}>
                          <button className="px-5 py-2 rounded-full border border-border/40 hover:bg-secondary/50 text-sm font-medium transition-colors">
                            View
                          </button>
                        </Link>
                        {canReassign && allStaffData.activeStaff.length > 1 && (
                          <button
                            onClick={() => setReassignModal({
                              open: true,
                              listingId: listing.id,
                              listingTitle: `${listing.year} ${listing.make} ${listing.model}`,
                              currentManagerId: listing.postedByUserId || null,
                            })}
                            className="px-5 py-2 rounded-full border border-border/40 hover:bg-secondary/50 text-sm font-medium transition-colors"
                          >
                            Reassign
                          </button>
                        )}
                      </div>
                      
                      {/* Price - Bottom Right */}
                      <div className="text-right">
                        <p className="text-base font-medium text-foreground">
                          {listing.price.toLocaleString()} AED
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Updated {new Date(listing.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Empty State - No listings at all */}
      {!isLoading && !error && listings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 px-6">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-6">
            <ShoppingCart className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No listings yet</h3>
          <p className="text-sm text-muted-foreground max-w-md text-center">
            Your staff members haven't created any listings yet. Staff can create listings from the Work Listings dashboard.
          </p>
        </div>
      )}

      {/* Empty State - No listings in current filter */}
      {!isLoading && !error && listings.length > 0 && filteredListings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 px-6">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-6">
            <Archive className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No {selectedStatusTab === 'all' ? '' : selectedStatusTab} listings
          </h3>
          <p className="text-sm text-muted-foreground max-w-md text-center">
            No listings match the current filter. Try selecting a different status tab.
          </p>
        </div>
      )}

      {/* Reassign Modal */}
      {reassignModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => {
            setReassignModal({ open: false, listingId: null, listingTitle: '', currentManagerId: null });
            setReassignTargetUserId('');
            setReassignError(null);
          }} />
          
          <div className="relative z-50 bg-background border border-border rounded-xl p-6 max-w-md w-full mx-4 space-y-6">
            <div>
              <h3 className="text-lg font-medium">Reassign Listing</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Reassign <span className="font-medium text-foreground">{reassignModal.listingTitle}</span> to a different staff member.
              </p>
            </div>
            
            {/* Staff Selection */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                Select Staff Member
              </label>
              <Select value={reassignTargetUserId} onValueChange={(v) => setReassignTargetUserId(v)}>
                <SelectTrigger className="h-10 border-0 border-b border-border rounded-none bg-transparent">
                  <SelectValue placeholder="Select an active staff member..." />
                </SelectTrigger>
                <SelectContent>
                  {allStaffData.activeStaff
                    .filter(staff => staff.userId !== reassignModal.currentManagerId)
                    .map(staff => (
                      <SelectItem key={staff.userId} value={staff.userId}>
                        {staff.displayName} (@{staff.username}) - {staff.listingCount} listings
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Error */}
            {reassignError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-500">{reassignError}</p>
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
                className="px-5 py-2 rounded-full border border-border/40 hover:bg-secondary/50 text-sm font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReassign}
                disabled={!reassignTargetUserId || isReassigning}
                className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
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
