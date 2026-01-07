/**
 * My Listings View Component - Simplified
 * Clean, fast, zero-latency state toggling
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { AlertTriangle, Package } from 'lucide-react';
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
  DialogFooter,
  DialogHeader,
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
        archived: visibleListings.filter((l: ListingData) => l.lifecycleStatus === 'archived').length,
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
            return listing.lifecycleStatus === 'archived';
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

  const getColorClasses = (color?: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600 dark:text-blue-400';
      case 'green': return 'text-green-600 dark:text-green-400';
      case 'yellow': return 'text-yellow-600 dark:text-yellow-400';
      case 'red': return 'text-red-600 dark:text-red-400';
      case 'orange': return 'text-orange-600 dark:text-orange-400';
      case 'purple': return 'text-purple-600 dark:text-purple-400';
      case 'gray': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <section className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {listingType === 'work' ? 'Inventory' : 'My Listings'}
              </h1>
              <p className="text-[15px] font-medium text-muted-foreground/70 mt-2">
                {listingType === 'work' 
                  ? 'Manage your dealership inventory' 
                  : 'Manage your personal car listings'}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {listingType === 'work' && blackQuota && (
                <span className="text-sm font-semibold tracking-tight text-muted-foreground/70">
                  BLK {blackQuota.activeBlackListingsCount}/{blackQuota.blackListingQuota}
                </span>
              )}
              
              <button 
                onClick={() => fetchData()} 
                disabled={isLoading}
                className="p-2 hover:bg-muted/40 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Status Tabs - Clean inline design */}
          <div className="border-b border-border/40">
            <div className="flex gap-1 overflow-x-auto pb-px">
              {statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedStatus(tab.key)}
                  className={`px-5 py-3.5 border-b-2 transition-colors whitespace-nowrap text-[15px] font-semibold tracking-tight ${
                    selectedStatus === tab.key
                      ? `border-transparent ${getColorClasses(tab.color)}`
                      : 'border-transparent text-muted-foreground/70 hover:text-foreground'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 text-sm font-semibold tracking-tight ${selectedStatus === tab.key ? getColorClasses(tab.color) : 'text-muted-foreground/60'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Search & Sort */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_14rem_auto] sm:items-center">
            <div className="flex items-center gap-3">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search make, model, year..."
                className="flex-1 h-11 bg-transparent border-b border-border/40 focus:border-primary outline-none transition-colors px-0 text-[15px] font-medium"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="text-sm font-semibold tracking-tight text-muted-foreground/70 hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <Select value={sort} onValueChange={(v) => setSort(v as ListingsSort)}>
              <SelectTrigger className="h-10 border-0 border-b border-border/40 rounded-none bg-transparent">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest published</SelectItem>
                <SelectItem value="oldest">Oldest published</SelectItem>
                <SelectItem value="updated">Recently updated</SelectItem>
                <SelectItem value="expiring">Expiring soon</SelectItem>
              </SelectContent>
            </Select>

            <Link href={newListingUrl}>
              <button className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold tracking-tight transition-colors">
                New Listing
              </button>
            </Link>
          </div>

          <p className="text-[15px] font-medium text-muted-foreground/70">
            Showing {filteredAndSortedListings.length} of {stats.all} listings
          </p>
          
          {/* Bulk Clear Button - Show for clearable states with listings */}
          {filteredAndSortedListings.length > 0 && 
           ['sold', 'archived', 'expired', 'rejected', 'suspended'].includes(selectedStatus) && (
            <button
              onClick={handleBulkClear}
              className="px-4 py-2 text-sm font-semibold tracking-tight text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              Clear {filteredAndSortedListings.length} {statusTabs.find(t => t.key === selectedStatus)?.label.toLowerCase()}
            </button>
          )}
        </section>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5">
            <p className="text-sm font-medium text-red-500">{error}</p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-foreground"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredAndSortedListings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-[15px] font-medium text-muted-foreground">
              {searchQuery 
                ? 'No listings match your search' 
                : selectedStatus === 'all'
                ? 'Your garage is empty'
                : `No ${statusTabs.find(t => t.key === selectedStatus)?.label.toLowerCase()} listings yet`
              }
            </p>
          </div>
        )}

        {/* Listings */}
        {filteredAndSortedListings.length > 0 && (
          <div className="space-y-4">
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
        )}
      </div>

      {/* Confirmation Modal */}
      <Dialog open={confirmModal.isOpen} onOpenChange={(open) => !open && !isConfirming && setConfirmModal({ ...confirmModal, isOpen: false })}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              {confirmModal.variant === 'destructive' && (
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
              )}
              <DialogTitle>{confirmModal.title}</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              {confirmModal.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <button 
              onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
              disabled={isConfirming}
              className="px-5 py-2 rounded-full border border-border/40 hover:bg-muted/40 text-sm font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={executeConfirmedAction}
              disabled={isConfirming}
              className={`px-5 py-2 rounded-full text-white text-sm font-medium transition-colors disabled:opacity-50 ${
                confirmModal.variant === 'destructive' 
                  ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' 
                  : confirmModal.variant === 'warning'
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  : confirmModal.variant === 'success'
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }`}
            >
              {isConfirming ? 'Processing...' : confirmModal.confirmLabel}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
