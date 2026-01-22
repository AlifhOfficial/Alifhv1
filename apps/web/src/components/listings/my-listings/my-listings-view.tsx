/**
 * My Listings View Component
 * Clean, fast, zero-latency state toggling
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { AlertTriangle, Package, Search, RefreshCw, Plus, X, Clock, FileText, XCircle, Archive, CheckCircle2, Timer, Ban } from 'lucide-react';

// Empty state config - context-aware messages for each status
const EMPTY_STATE_CONFIG: Record<string, { icon: React.ElementType; color: string; message: string; subMessage: string }> = {
  all: { 
    icon: Package, 
    color: 'text-foreground', 
    message: 'No listings yet', 
    subMessage: 'Create your first listing to get started' 
  },
  active: { 
    icon: CheckCircle2, 
    color: 'text-blue-500', 
    message: 'No active listings', 
    subMessage: 'Published listings visible to buyers will appear here' 
  },
  public: { 
    icon: CheckCircle2, 
    color: 'text-emerald-500', 
    message: 'No public listings', 
    subMessage: 'Listings visible to everyone will appear here' 
  },
  draft: { 
    icon: FileText, 
    color: 'text-amber-500', 
    message: 'No drafts', 
    subMessage: 'Unfinished listings you\'re working on will appear here' 
  },
  in_review: { 
    icon: Clock, 
    color: 'text-blue-500', 
    message: 'Nothing in review', 
    subMessage: 'Listings awaiting moderation will appear here' 
  },
  rejected: { 
    icon: XCircle, 
    color: 'text-red-500', 
    message: 'No rejected listings', 
    subMessage: 'Listings that need changes will appear here' 
  },
  archived: { 
    icon: Archive, 
    color: 'text-slate-500', 
    message: 'No archived listings', 
    subMessage: 'Listings you\'ve archived will appear here' 
  },
  sold: { 
    icon: CheckCircle2, 
    color: 'text-emerald-500', 
    message: 'No sold listings', 
    subMessage: 'Vehicles you\'ve sold will appear here' 
  },
  expired: { 
    icon: Timer, 
    color: 'text-orange-500', 
    message: 'No expired listings', 
    subMessage: 'Listings past their expiration date will appear here' 
  },
  suspended: { 
    icon: Ban, 
    color: 'text-red-500', 
    message: 'No suspended listings', 
    subMessage: 'Listings flagged for policy review will appear here' 
  },
};
import { DashboardPageWrapper, DashboardPageHeader } from '@/components/shared/layout/dashboard-page-wrapper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/layout/dialog';
import type { ListingData, ListingStats, ListingsSort, ListingType } from './types';
import { ListingCard } from './listing-card';

type ConfirmAction = 'delete' | 'markSold' | 'extend' | 'archive' | 'unarchive' | 'bulkClear' | null;
type ListingStatus = 'all' | 'active' | 'public' | 'in_review' | 'draft' | 'rejected' | 'archived' | 'sold' | 'expired' | 'suspended' | 'deleted';

interface BlackQuotaData {
  partnerId: string;
  tier: string;
  blackListingQuota: number;
  activeBlackListingsCount: number;
  hasAvailableSlots: boolean;
}

interface ConfirmModalState {
  isOpen: boolean;
  action: ConfirmAction;
  listingId: string | null;
  title: string;
  description: string;
  confirmLabel: string;
  variant: 'default' | 'destructive' | 'warning' | 'success';
  extendDays?: 7 | 14;
}

interface MyListingsViewProps {
  userId: string;
  listingType?: ListingType;
}

export function MyListingsView({ userId, listingType = 'personal' }: MyListingsViewProps) {
  const [allListings, setAllListings] = useState<ListingData[]>([]);
  const [stats, setStats] = useState<ListingStats>({
    all: 0,
    active: 0,
    public: 0,
    inReview: 0,
    draft: 0,
    rejected: 0,
    archived: 0,
    suspended: 0,
    sold: 0,
    expired: 0,
    deleted: 0,
    deepInventory: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  
  // UI state - client-side filtering
  const [selectedStatus, setSelectedStatus] = useState<ListingStatus>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<ListingsSort>('newest');
  
  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    action: null,
    listingId: null,
    title: '',
    description: '',
    confirmLabel: 'Confirm',
    variant: 'default',
  });
  const [isConfirming, setIsConfirming] = useState(false);
  
  // BLK listings quota state (only for work listings)
  const [blackQuota, setBlackQuota] = useState<BlackQuotaData | null>(null);
  const [togglingBlkId, setTogglingBlkId] = useState<string | null>(null);

  // Fetch ALL listings once
  const fetchData = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('listingType', listingType);
      
      // For work listings, pass staffMemberUserId
      if (listingType === 'work' && userId) {
        params.set('staffMemberUserId', userId);
      }
      
      params.set('includeStats', '1');
      // Fetch all statuses EXCEPT deleted (we handle deleted separately)
      // The API will return all listings that are not deleted by default

      const response = await fetch(`/api/listings/my-listings?${params}`, {
        credentials: 'include',
        cache: 'no-store',
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch listings' }));
        throw new Error(errorData.error || 'Failed to fetch listings');
      }

      const data = await response.json();
      
      setAllListings(data.data || data.listings || []);
      
      // Recalculate stats from actual listings (excluding deleted)
      const visibleListings = (data.data || data.listings || []).filter((l: ListingData) => l.lifecycleStatus !== 'deleted');
      
      const recalculatedStats = {
        all: visibleListings.length,
        active: visibleListings.filter((l: ListingData) => l.lifecycleStatus === 'active' && l.isPublic).length,
        public: visibleListings.filter((l: ListingData) => l.isPublic).length,
        inReview: visibleListings.filter((l: ListingData) => l.moderationStatus === 'pending_review' || l.moderationStatus === 'submitted').length,
        draft: visibleListings.filter((l: ListingData) => l.moderationStatus === 'draft').length,
        rejected: visibleListings.filter((l: ListingData) => l.moderationStatus === 'rejected').length,
        // Exclude rejected and suspended from archived count - they should only count in their own tabs
        archived: visibleListings.filter((l: ListingData) => l.lifecycleStatus === 'archived' && l.moderationStatus !== 'rejected' && l.suspendedAt === null).length,
        suspended: visibleListings.filter((l: ListingData) => l.suspendedAt !== null).length,
        sold: visibleListings.filter((l: ListingData) => l.lifecycleStatus === 'sold').length,
        expired: visibleListings.filter((l: ListingData) => l.lifecycleStatus === 'expired').length,
        deleted: 0, // Never show deleted
        deepInventory: 0, // Will calculate below
      };
      
      recalculatedStats.deepInventory = 
        recalculatedStats.archived + 
        recalculatedStats.suspended + 
        recalculatedStats.sold + 
        recalculatedStats.expired;
      
      setStats(recalculatedStats);
      
      // Old stats logic - keep for reference but use recalculated instead
      if (data.stats) {
        // Keep this for potential future use, but we're using recalculated stats above
      }
      
      // Fetch BLK quota for work listings only
      if (listingType === 'work') {
        try {
          const quotaResponse = await fetch('/api/partner/black-quota', {
            credentials: 'include',
            signal: abortRef.current.signal,
          });
          if (quotaResponse.ok) {
            const quotaData = await quotaResponse.json();
            if (quotaData.data) {
              setBlackQuota(quotaData.data);
            }
          }
        } catch (quotaErr) {
          console.error('Failed to fetch BLK quota:', quotaErr);
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error('Error fetching listings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch listings');
      setAllListings([]);
    } finally {
      setIsLoading(false);
    }
  }, [listingType, userId]);

  useEffect(() => {
    fetchData();
    return () => { abortRef.current?.abort(); };
  }, [fetchData]);

  // Client-side filtering for zero-latency toggling
  const filteredAndSortedListings = (() => {
    // Always exclude deleted listings from view
    let filtered = allListings.filter(listing => listing.lifecycleStatus !== 'deleted');

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(listing => {
        switch (selectedStatus) {
          case 'active':
            return listing.lifecycleStatus === 'active' && listing.isPublic;
          case 'public':
            return listing.isPublic;
          case 'in_review':
            return listing.moderationStatus === 'pending_review' || listing.moderationStatus === 'submitted';
          case 'draft':
            return listing.moderationStatus === 'draft';
          case 'rejected':
            return listing.moderationStatus === 'rejected';
          case 'archived':
            // Exclude rejected and suspended listings from archived - they should only show in their own tabs
            return listing.lifecycleStatus === 'archived' && listing.moderationStatus !== 'rejected' && listing.suspendedAt === null;
          case 'sold':
            return listing.lifecycleStatus === 'sold';
          case 'expired':
            return listing.lifecycleStatus === 'expired';
          case 'suspended':
            return listing.suspendedAt !== null;
          default:
            return true;
        }
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(listing => 
        listing.make.toLowerCase().includes(query) ||
        listing.model.toLowerCase().includes(query) ||
        listing.year.toString().includes(query)
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime();
        case 'oldest':
          return new Date(a.publishedAt || a.createdAt).getTime() - new Date(b.publishedAt || b.createdAt).getTime();
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'expiring':
          if (!a.expiresAt) return 1;
          if (!b.expiresAt) return -1;
          return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
        default:
          return 0;
      }
    });

    return sorted;
  })();

  // Action handlers
  const handleBulkClear = () => {
    const count = filteredAndSortedListings.length;
    const statusLabel = statusTabs.find(t => t.key === selectedStatus)?.label.toLowerCase() || 'these';
    
    if (count === 0) return;
    
    setConfirmModal({
      isOpen: true,
      action: 'bulkClear',
      listingId: null,
      title: `Clear ${count} ${statusLabel} listing${count > 1 ? 's' : ''}?`,
      description: `This will permanently delete all ${statusLabel} listings. This action cannot be undone.`,
      confirmLabel: `Clear ${count} listing${count > 1 ? 's' : ''}`,
      variant: 'destructive',
    });
  };

  const handleArchive = (listingId: string) => {
    const listing = allListings.find((l) => l.id === listingId);
    const isArchived = listing?.lifecycleStatus === 'archived';
    
    setConfirmModal({
      isOpen: true,
      action: isArchived ? 'unarchive' : 'archive',
      listingId,
      title: isArchived ? 'Unarchive Listing' : 'Archive Listing',
      description: `${isArchived ? 'Restore' : 'Archive'} "${listing?.year} ${listing?.make} ${listing?.model}"?`,
      confirmLabel: isArchived ? 'Unarchive' : 'Archive',
      variant: 'warning',
    });
  };

  const handleDelete = (listingId: string) => {
    const listing = allListings.find((l) => l.id === listingId);
    setConfirmModal({
      isOpen: true,
      action: 'delete',
      listingId,
      title: 'Delete Listing',
      description: `Are you sure you want to delete "${listing?.year} ${listing?.make} ${listing?.model}"?`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
  };

  const handleMarkSold = (listingId: string) => {
    const listing = allListings.find((l) => l.id === listingId);
    setConfirmModal({
      isOpen: true,
      action: 'markSold',
      listingId,
      title: 'Mark as Sold',
      description: `Mark "${listing?.year} ${listing?.make} ${listing?.model}" as sold?`,
      confirmLabel: 'Mark Sold',
      variant: 'success',
    });
  };

  const handleExtend = (listingId: string, days: 7 | 14) => {
    const listing = allListings.find((l) => l.id === listingId);
    const expiresAt = listing?.expiresAt ? new Date(listing.expiresAt) : null;
    const newExpiresAt = expiresAt ? new Date(expiresAt.getTime() + days * 24 * 60 * 60 * 1000) : null;
    const formattedNewDate = newExpiresAt?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    setConfirmModal({
      isOpen: true,
      action: 'extend',
      listingId,
      title: `Extend Listing by ${days === 7 ? '1 Week' : '2 Weeks'}`,
      description: `Extend "${listing?.year} ${listing?.make} ${listing?.model}" by ${days} days?${formattedNewDate ? ` New expiration: ${formattedNewDate}` : ''}`,
      confirmLabel: 'Extend',
      variant: 'default',
      extendDays: days,
    });
  };

  const executeConfirmedAction = async () => {
    if (!confirmModal.action) return;
    
    setIsConfirming(true);
    try {
      if (confirmModal.action === 'bulkClear') {
        // Bulk delete all filtered listings
        const listingIds = filteredAndSortedListings.map(l => l.id);
        
        const response = await fetch('/api/listings/bulk-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ listingIds }),
        });
        
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || 'Failed to clear listings');
        }
      } else if (confirmModal.action === 'archive' || confirmModal.action === 'unarchive') {
        if (!confirmModal.listingId) return;
        const listing = allListings.find((l) => l.id === confirmModal.listingId);
        const nextLifecycleStatus = listing?.lifecycleStatus === 'archived' ? 'active' : 'archived';
        
        const response = await fetch(`/api/listings/${confirmModal.listingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lifecycleStatus: nextLifecycleStatus }),
          credentials: 'include',
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || 'Failed to update listing');
        }
      } else if (confirmModal.action === 'delete') {
        if (!confirmModal.listingId) return;
        const response = await fetch(`/api/listings/${confirmModal.listingId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || 'Failed to delete listing');
        }
      } else if (confirmModal.action === 'markSold') {
        const response = await fetch(`/api/listings/${confirmModal.listingId}/mark-sold`, {
          method: 'POST',
          credentials: 'include',
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || 'Failed to mark as sold');
        }
      } else if (confirmModal.action === 'extend' && confirmModal.extendDays) {
        const response = await fetch(`/api/listings/${confirmModal.listingId}/extend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ days: confirmModal.extendDays }),
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || 'Failed to extend listing');
        }
      }

      setConfirmModal({ ...confirmModal, isOpen: false });
      await fetchData();
      
      // If we just cleared all listings in the current view, switch to 'all' tab
      if (confirmModal.action === 'bulkClear') {
        setSelectedStatus('all');
      }
    } catch (err) {
      console.error('Error executing action:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete action');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleToggleBlkStatus = async (listingId: string, currentlyBlk: boolean) => {
    if (listingType !== 'work') return;
    
    setTogglingBlkId(listingId);
    try {
      const response = await fetch(`/api/listings/${listingId}/black-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isBlkListing: !currentlyBlk }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update BLK status');
      }
      
      const result = await response.json();
      
      // Update local state immediately
      setAllListings(prev => prev.map(l => 
        l.id === listingId ? { ...l, isBlkListing: !currentlyBlk } : l
      ));
      
      // Update quota
      if (result.data?.quota) {
        setBlackQuota(prev => prev ? {
          ...prev,
          activeBlackListingsCount: result.data.quota.current,
          hasAvailableSlots: result.data.quota.current < prev.blackListingQuota,
        } : null);
      }
    } catch (err) {
      console.error('Failed to toggle BLK status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update BLK status');
    } finally {
      setTogglingBlkId(null);
    }
  };

  const newListingUrl = listingType === 'work' 
    ? '/staff-dashboard/work-listings/new' 
    : '/user-dashboard/listings/new';

  // Status tabs with inline counts
  // Core tabs always shown, others only if count > 0
  const allStatusTabs: Array<{ key: ListingStatus; label: string; count: number; color?: string; alwaysShow?: boolean }> = [
    { key: 'all', label: 'All', count: stats.all, color: 'purple', alwaysShow: true },
    { key: 'active', label: 'Active', count: stats.active, color: 'blue', alwaysShow: true },
    { key: 'public', label: 'Public', count: stats.public, color: 'green', alwaysShow: true },
    { key: 'draft', label: 'Drafts', count: stats.draft, color: 'yellow', alwaysShow: true },
    { key: 'in_review', label: 'In Review', count: stats.inReview, color: 'blue' },
    { key: 'rejected', label: 'Rejected', count: stats.rejected, color: 'red' },
    { key: 'archived', label: 'Archived', count: stats.archived, color: 'yellow' },
    { key: 'sold', label: 'Sold', count: stats.sold, color: 'green' },
    { key: 'expired', label: 'Expired', count: stats.expired, color: 'orange' },
    { key: 'suspended', label: 'Suspended', count: stats.suspended, color: 'red' },
    // Note: 'deleted' is intentionally excluded from the UI
  ];

  // Filter: show always-visible tabs OR tabs with count > 0
  const statusTabs = allStatusTabs.filter(tab => tab.alwaysShow || tab.count > 0);

  return (
    <DashboardPageWrapper>
        {/* Header */}
        <DashboardPageHeader
          title={listingType === 'work' ? 'Inventory' : 'My Listings'}
          description={listingType === 'work' 
            ? 'Manage your dealership inventory' 
            : 'Manage your personal car listings'}
        >
            {listingType === 'work' && blackQuota && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/80 text-zinc-100">
                <span className="text-xs font-medium">
                  {blackQuota.activeBlackListingsCount}/{blackQuota.blackListingQuota} BLK
                </span>
              </div>
            )}
            
            <button 
              onClick={() => fetchData()} 
              disabled={isLoading}
              className="p-2 rounded-full hover:bg-secondary/50 active:bg-secondary transition-colors disabled:opacity-50"
              aria-label="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
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
          {statusTabs.map((tab) => {
            const isActive = selectedStatus === tab.key;
            const count = tab.count;
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedStatus(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all capitalize ${
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label === 'All' ? 'All' : tab.label.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}
                {count !== undefined && count > 0 && (
                  <span className="ml-1.5 text-muted-foreground">{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sort */}
        <Select value={sort} onValueChange={(v) => setSort(v as ListingsSort)}>
          <SelectTrigger className="h-10 w-32 border-0 bg-secondary/50 rounded-xl text-sm">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="updated">Updated</SelectItem>
            <SelectItem value="expiring">Expiring</SelectItem>
          </SelectContent>
        </Select>

        {/* New Listing */}
        <Link href={newListingUrl}>
          <button className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New</span>
          </button>
        </Link>
      </div>

      {/* Count & Actions */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs text-muted-foreground">
          {filteredAndSortedListings.length} listing{filteredAndSortedListings.length !== 1 ? 's' : ''}
          {searchQuery && <span> matching "{searchQuery}"</span>}
        </p>
          
        {/* Bulk Clear Button */}
        {filteredAndSortedListings.length > 0 && 
         ['sold', 'archived', 'expired', 'rejected', 'suspended'].includes(selectedStatus) && (
          <button
            onClick={handleBulkClear}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear all
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

      {/* Empty State - No Data */}
      {!isLoading && !error && allListings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <Package className="w-5 h-5 text-foreground mb-3" strokeWidth={2} />
          <h3 className="text-sm font-semibold tracking-tight">No listings yet</h3>
          <p className="text-xs text-muted-foreground mt-1">Create your first listing to get started</p>
          <Link href={newListingUrl} className="mt-4">
            <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90">
              Create Listing
            </button>
          </Link>
        </div>
      )}

      {/* Empty State - No Results */}
      {!isLoading && !error && allListings.length > 0 && filteredAndSortedListings.length === 0 && (() => {
        const config = searchQuery 
          ? { icon: Search, color: 'text-foreground', message: 'No matches found', subMessage: 'Try adjusting your search' }
          : (EMPTY_STATE_CONFIG[selectedStatus] || EMPTY_STATE_CONFIG.all);
        const Icon = config.icon;
        
        return (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Icon className={`w-5 h-5 ${config.color} mb-3`} strokeWidth={2} />
            <h3 className="text-sm font-semibold tracking-tight">{config.message}</h3>
            <p className="text-xs text-muted-foreground mt-1">{config.subMessage}</p>
          </div>
        );
      })()}

      {/* Listings */}
      {!isLoading && !error && filteredAndSortedListings.length > 0 && (
        <>
          <div className="space-y-1">
            {filteredAndSortedListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                listingType={listingType}
                deleteConfirm={null}
                onArchive={handleArchive}
                onDelete={handleDelete}
                onMarkSold={handleMarkSold}
                onExtend={handleExtend}
                onCancelDelete={() => {}}
                onToggleBlk={listingType === 'work' ? handleToggleBlkStatus : undefined}
                isTogglingBlk={togglingBlkId === listing.id}
                canPromoteToBlk={listingType === 'work' && blackQuota?.hasAvailableSlots === true}
              />
            ))}
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      <Dialog open={confirmModal.isOpen} onOpenChange={(open) => !open && !isConfirming && setConfirmModal({ ...confirmModal, isOpen: false })}>
        <DialogContent className="max-w-xs rounded-xl border border-border/40 bg-card p-6 shadow-xl">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Icon */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              confirmModal.variant === 'destructive' ? 'bg-destructive/10' :
              confirmModal.variant === 'warning' ? 'bg-amber-500/10' :
              confirmModal.variant === 'success' ? 'bg-emerald-500/10' :
              'bg-primary/10'
            }`}>
              <AlertTriangle className={`w-6 h-6 ${
                confirmModal.variant === 'destructive' ? 'text-destructive' :
                confirmModal.variant === 'warning' ? 'text-amber-500' :
                confirmModal.variant === 'success' ? 'text-emerald-500' :
                'text-primary'
              }`} />
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <DialogTitle className="text-base font-semibold text-foreground">
                {confirmModal.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {confirmModal.description}
              </DialogDescription>
            </div>

            {/* Actions */}
            <div className="flex flex-col w-full gap-2 pt-2">
              <button
                onClick={executeConfirmedAction}
                disabled={isConfirming}
                className={`w-full h-10 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                  confirmModal.variant === 'destructive' 
                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' 
                    : confirmModal.variant === 'warning'
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : confirmModal.variant === 'success'
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                {isConfirming ? 'Processing...' : confirmModal.confirmLabel}
              </button>
              <button 
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                disabled={isConfirming}
                className="w-full h-10 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardPageWrapper>
  );
}
