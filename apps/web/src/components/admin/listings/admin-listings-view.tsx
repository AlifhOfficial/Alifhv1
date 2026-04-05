/**
 * Admin Listings View Component
 * Manage all listings with filtering, search, and actions
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Search, Archive } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/layout/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import { AdminListingCard } from './admin-listing-card';
import { ApproveListingModal } from './approve-listing-modal';
import { RejectListingModal } from './reject-listing-modal';
import { SuspendListingModal } from './suspend-listing-modal';

interface Listing {
  id: string;
  make: string;
  model: string;
  year: number;
  trim?: string | null;
  price: number;
  postedByRole: 'user' | 'staff';
  moderationStatus: 'draft' | 'submitted' | 'pending_review' | 'approved' | 'rejected';
  lifecycleStatus: 'active' | 'archived' | 'sold' | 'expired' | 'deleted';
  isPublic: boolean;
  userId: string;
  userName?: string;
  userEmail?: string;
  partnerId?: string | null;
  partnerName?: string | null;
  thumbnail?: string | null;
  viewCount: number;
  favouriteCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  expiresAt?: string | null;
  suspensionReason?: string | null;
  rejectionReason?: string | null;
  emirate: string;
  mileage: number;
  // AI moderation data
  specialNotes?: {
    aiModeration?: {
      decision: 'approve' | 'flag' | 'reject';
      confidence: number;
      flags: Array<{ code: string; severity: string; message: string }>;
      reasoning: string;
      autoApproved?: boolean;
      autoRejected?: boolean;
      processedAt?: string;
      model?: string;
    };
  };
}

interface AdminListingStats {
  all: number;
  pending: number;
  public: number;
  draft: number;
  rejected: number;
  archived: number;
  suspended: number;
  sold: number;
  expired: number;
  deleted: number;
  userListings: number;
  partnerListings: number;
  deepInventory: number;
}

type AdminTab = 'pending' | 'public' | 'draft' | 'rejected' | 'deep_inventory';
type DeepInventoryFilter = 'all' | 'archived' | 'suspended' | 'sold' | 'expired' | 'deleted';
type TypeFilter = 'all' | 'user' | 'partner';
type SortOption = 'newest' | 'oldest' | 'updated';

export function AdminListingsView() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [stats, setStats] = useState<AdminListingStats>({
    all: 0,
    pending: 0,
    public: 0,
    draft: 0,
    rejected: 0,
    archived: 0,
    suspended: 0,
    sold: 0,
    expired: 0,
    deleted: 0,
    userListings: 0,
    partnerListings: 0,
    deepInventory: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const limit = 20;
  
  // Filters
  const [activeTab, setActiveTab] = useState<AdminTab>('pending');
  const [deepInventoryFilter, setDeepInventoryFilter] = useState<DeepInventoryFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSetSearchTerm = useDebouncedCallback((v: string) => setSearchTerm(v), 300);
  
  // Modal states
  const [approveModal, setApproveModal] = useState<{ open: boolean; listing: Listing | null }>({ open: false, listing: null });
  const [rejectModal, setRejectModal] = useState<{ open: boolean; listing: Listing | null }>({ open: false, listing: null });
  const [suspendModal, setSuspendModal] = useState<{ open: boolean; listing: Listing | null }>({ open: false, listing: null });
  
  // Delete confirmation modal
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; listing: Listing | null }>({ open: false, listing: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async (isRefresh = false, loadMore = false) => {
    try {
      if (loadMore) {
        setIsLoadingMore(true);
      } else if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const params = new URLSearchParams();
      
      // Map tabs to API status
      if (activeTab === 'deep_inventory') {
        if (deepInventoryFilter !== 'all') {
          params.set('status', deepInventoryFilter);
        } else {
          params.set('status', 'deep_inventory');
        }
      } else {
        params.set('status', activeTab);
      }
      
      if (typeFilter !== 'all') {
        params.set('type', typeFilter);
      }
      params.set('sort', sortOption);
      params.set('includeStats', '1');
      params.set('limit', String(limit));
      params.set('offset', String(loadMore ? offset : 0));

      const response = await fetch(`/api/admin/listings?${params}`, {
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }

      const data = await response.json();
      
      if (loadMore) {
        setListings(prev => [...prev, ...(data.data || [])]);
      } else {
        setListings(data.data || []);
        setOffset(0);
      }
      
      setHasMore(data.meta?.hasMore || false);
      if (loadMore) {
        setOffset(prev => prev + limit);
      }
      
      // Parse stats as numbers (PostgreSQL bigint issue)
      if (data.stats) {
        const parsedStats = {
          all: Number(data.stats.all) || 0,
          pending: Number(data.stats.pending) || 0,
          public: Number(data.stats.public) || 0,
          draft: Number(data.stats.draft) || 0,
          rejected: Number(data.stats.rejected) || 0,
          archived: Number(data.stats.archived) || 0,
          suspended: Number(data.stats.suspended) || 0,
          sold: Number(data.stats.sold) || 0,
          expired: Number(data.stats.expired) || 0,
          deleted: Number(data.stats.deleted) || 0,
          userListings: Number(data.stats.userListings) || 0,
          partnerListings: Number(data.stats.partnerListings) || 0,
        };
        const deepInventoryTotal = 
          parsedStats.archived + 
          parsedStats.suspended + 
          parsedStats.sold + 
          parsedStats.expired + 
          parsedStats.deleted;
        setStats({ ...parsedStats, deepInventory: deepInventoryTotal });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [activeTab, deepInventoryFilter, typeFilter, sortOption, limit, offset]);

  useEffect(() => {
    setOffset(0);
    fetchData(false, false);
  }, [fetchData]);

  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchData(false, true);
    }
  };

  // Filter listings by search term (client-side)
  const filteredListings = useMemo(() => {
    if (!searchTerm) return listings;
    
    const term = searchTerm.toLowerCase();
    return listings.filter(listing => 
      listing.make.toLowerCase().includes(term) ||
      listing.model.toLowerCase().includes(term) ||
      listing.userName?.toLowerCase().includes(term) ||
      listing.userEmail?.toLowerCase().includes(term) ||
      listing.partnerName?.toLowerCase().includes(term) ||
      listing.id.toLowerCase().includes(term)
    );
  }, [listings, searchTerm]);

  const handleApprove = (listing: Listing) => {
    setApproveModal({ open: true, listing });
  };

  const handleReject = (listing: Listing) => {
    setRejectModal({ open: true, listing });
  };

  const handleSuspend = (listing: Listing) => {
    setSuspendModal({ open: true, listing });
  };

  const handleDeleteClick = (listing: Listing) => {
    setDeleteModal({ open: true, listing });
  };

  const executeDelete = async () => {
    if (!deleteModal.listing) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/listings/${deleteModal.listing.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete listing');
      }

      setDeleteModal({ open: false, listing: null });
      await fetchData(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete listing');
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    if (!isDeleting) {
      setDeleteModal({ open: false, listing: null });
    }
  };

  // Tab definitions
  const mainTabs: Array<{ key: AdminTab; label: string; count: number; badgeClass?: string }> = [
    { key: 'pending', label: 'Pending Review', count: stats.pending, badgeClass: 'bg-blue-500/10 text-blue-600' },
    { key: 'public', label: 'Public', count: stats.public, badgeClass: 'bg-green-500/10 text-green-600' },
    { key: 'draft', label: 'Drafts', count: stats.draft, badgeClass: 'bg-yellow-500/10 text-yellow-600' },
    { key: 'rejected', label: 'Rejected', count: stats.rejected, badgeClass: 'bg-red-500/10 text-red-600' },
  ];

  const deepFilters: Array<{ key: DeepInventoryFilter; label: string; count: number }> = [
    { key: 'all', label: 'All', count: stats.deepInventory },
    { key: 'archived', label: 'Archived', count: stats.archived },
    { key: 'sold', label: 'Sold', count: stats.sold },
    { key: 'expired', label: 'Expired', count: stats.expired },
    { key: 'suspended', label: 'Suspended', count: stats.suspended },
    { key: 'deleted', label: 'Deleted', count: stats.deleted },
  ];

  const isDeepInventoryActive = activeTab === 'deep_inventory';

  return (
    <div className="max-w-6xl mx-auto space-y-16">
      {/* Header */}
     

      {/* Stats Overview */}
      <section className="space-y-8">
        <div className="border-b border-border/40 pb-2">
          <h3 className="text-headline font-medium tracking-tight">Overview</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border-y border-border divide-x divide-border">
          <div 
            className="p-8 text-center"
          >
            <p className="text-caption1 text-muted-foreground mb-1">Total</p>
            <p className="text-title3 font-semibold">{stats.all}</p>
          </div>
          <button 
            onClick={() => setActiveTab('pending')}
            className="p-8 text-center cursor-pointer hover:bg-secondary/10 transition-colors"
          >
            <p className="text-caption1 text-muted-foreground mb-1">Pending</p>
            <p className="text-title3 font-semibold text-blue-500">{stats.pending}</p>
          </button>
          <button 
            onClick={() => setActiveTab('public')}
            className="p-8 text-center cursor-pointer hover:bg-secondary/10 transition-colors"
          >
            <p className="text-caption1 text-muted-foreground mb-1">Public</p>
            <p className="text-title3 font-semibold text-green-500">{stats.public}</p>
          </button>
          <button 
            onClick={() => setTypeFilter(typeFilter === 'user' ? 'all' : 'user')}
            className={`p-8 text-center cursor-pointer hover:bg-secondary/10 transition-colors ${typeFilter === 'user' ? 'bg-secondary/20' : ''}`}
          >
            <p className="text-caption1 text-muted-foreground mb-1">User</p>
            <p className="text-title3 font-semibold">{stats.userListings}</p>
          </button>
          <button 
            onClick={() => setTypeFilter(typeFilter === 'partner' ? 'all' : 'partner')}
            className={`p-8 text-center cursor-pointer hover:bg-secondary/10 transition-colors ${typeFilter === 'partner' ? 'bg-secondary/20' : ''}`}
          >
            <p className="text-caption1 text-muted-foreground mb-1">Partner</p>
            <p className="text-title3 font-semibold text-blue-500">{stats.partnerListings}</p>
          </button>
          <button 
            onClick={() => setActiveTab('deep_inventory')}
            className="p-8 text-center cursor-pointer hover:bg-secondary/10 transition-colors"
          >
            <p className="text-caption1 text-muted-foreground mb-1">Deep Inventory</p>
            <p className="text-title3 font-semibold">{stats.deepInventory}</p>
          </button>
        </div>
      </section>

      {/* Tabs & Content */}
      <section className="space-y-8">
        <div className="border-b border-border/40 pb-2">
          <h3 className="text-headline font-medium tracking-tight">Listings</h3>
        </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex items-center justify-between overflow-x-auto">
          {/* Main Tabs */}
          <div className="flex gap-1">
            {mainTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  if (tab.key !== 'deep_inventory') {
                    setDeepInventoryFilter('all');
                  }
                }}
                className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-foreground text-foreground font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`ml-2 px-2 py-0.5 rounded-md text-caption1 ${tab.badgeClass || 'bg-secondary/50 text-muted-foreground'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Deep Inventory Tab */}
          <button
            onClick={() => setActiveTab('deep_inventory')}
            className={`px-4 py-3 border-b-2 transition-colors flex items-center gap-2 ${
              isDeepInventoryActive
                ? 'border-foreground text-foreground font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>Deep Inventory</span>
            <span className="px-2 py-0.5 rounded-md text-caption1 bg-secondary/50 text-muted-foreground">
              {stats.deepInventory}
            </span>
          </button>
        </div>

        {/* Deep Inventory Sub-filters */}
        {isDeepInventoryActive && (
          <div className="flex gap-2 py-4">
            {deepFilters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setDeepInventoryFilter(filter.key)}
                className={`px-4 py-2 rounded-full text-subhead transition-colors ${
                  deepInventoryFilter === filter.key
                    ? 'bg-blue-500 text-white'
                    : 'border border-border hover:bg-secondary/10'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by make, model, user, email, ID..."
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); debouncedSetSearchTerm(e.target.value); }}
            className="w-full h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors pl-6 pr-0 text-subhead"
          />
        </div>

        {/* Type Filter */}
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
          <SelectTrigger className="h-10 w-[140px] border-0 border-b border-border rounded-none bg-transparent">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="user">User Listings</SelectItem>
            <SelectItem value="partner">Partner Listings</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
          <SelectTrigger className="h-10 w-[160px] border-0 border-b border-border rounded-none bg-transparent">
            <SelectValue placeholder="Newest Published" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest Published</SelectItem>
            <SelectItem value="oldest">Oldest Published</SelectItem>
            <SelectItem value="updated">Recently Updated</SelectItem>
          </SelectContent>
        </Select>

        {/* Refresh */}
        <button 
          onClick={() => fetchData(true)} 
          disabled={isRefreshing}
          className="px-5 py-2 rounded-full border border-border hover:bg-secondary/10 text-subhead transition-colors disabled:opacity-50"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-caption1 text-muted-foreground">
        <p>
          Showing {filteredListings.length} of {stats.all} listings
          {searchInput && ` • Search: "${searchInput}"`}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-red-500/20 p-4">
          <p className="text-subhead text-red-500">{error}</p>
        </div>
      )}

      {/* Refreshing Indicator */}
      {isRefreshing && (
        <div className="flex items-center justify-center gap-2 text-subhead text-muted-foreground">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground"></div>
          Refreshing...
        </div>
      )}

      {/* Listings List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-foreground" />
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-subhead text-muted-foreground">No listings found</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredListings.map((listing) => (
            <AdminListingCard
              key={listing.id}
              listing={listing}
              onApprove={() => handleApprove(listing)}
              onReject={() => handleReject(listing)}
              onSuspend={() => handleSuspend(listing)}
              onDelete={() => handleDeleteClick(listing)}
            />
          ))}
          
          {/* Load More Button */}
          {hasMore && !searchTerm && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="px-6 py-3 rounded-full border border-border hover:bg-secondary/10 text-subhead font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingMore ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground" />
                    Loading...
                  </span>
                ) : (
                  `Load More (${limit} per page)`
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Approve Modal */}
      {approveModal.listing && (
        <ApproveListingModal
          open={approveModal.open}
          listing={approveModal.listing}
          onClose={() => setApproveModal({ open: false, listing: null })}
          onSuccess={() => fetchData(true)}
        />
      )}

      {/* Reject Modal */}
      {rejectModal.listing && (
        <RejectListingModal
          open={rejectModal.open}
          listing={rejectModal.listing}
          onClose={() => setRejectModal({ open: false, listing: null })}
          onSuccess={() => fetchData(true)}
        />
      )}

      {/* Suspend Modal */}
      {suspendModal.listing && (
        <SuspendListingModal
          open={suspendModal.open}
          listing={suspendModal.listing}
          onClose={() => setSuspendModal({ open: false, listing: null })}
          onSuccess={() => fetchData(true)}
        />
      )}

      </section>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModal.open} onOpenChange={(open) => !open && closeDeleteModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Listing</DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete "{deleteModal.listing?.year} {deleteModal.listing?.make} {deleteModal.listing?.model}"? 
              This will move it to the deleted state and remove it from public views.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <button 
              onClick={closeDeleteModal}
              disabled={isDeleting}
              className="px-5 py-2 rounded-full border border-border hover:bg-secondary/10 text-subhead transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={executeDelete}
              disabled={isDeleting}
              className="px-5 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-subhead transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
