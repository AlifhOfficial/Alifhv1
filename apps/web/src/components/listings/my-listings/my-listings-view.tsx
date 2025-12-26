/**
 * My Listings View Component
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
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
import type { ListingData, ListingStats, ListingsSort, ListingsTab, ListingType, DeepInventoryFilter } from './types';
import { ListingsTabs } from './listings-tabs';
import { ListingCard } from './listing-card';

// Confirmation modal types
type ConfirmAction = 'delete' | 'markSold' | 'archive' | 'unarchive' | 'extend' | null;

interface ConfirmModalState {
  isOpen: boolean;
  action: ConfirmAction;
  listingId: string | null;
  title: string;
  description: string;
  confirmLabel: string;
  variant: 'default' | 'destructive';
  extendDays?: 7 | 14;
}

interface MyListingsViewProps {
  userId: string;
  listingType?: ListingType;
}

export function MyListingsView({ userId, listingType = 'personal' }: MyListingsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<ListingData[]>([]);
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
  const [meta, setMeta] = useState<{ count: number; limit: number; offset: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  
  // Initialize from URL params immediately - don't rely on useEffect
  const allowedTabs: ListingsTab[] = [
    'active',
    'public',
    'in_review',
    'draft',
    'rejected',
    'deep_inventory',
  ];
  const allowedDeepFilters: DeepInventoryFilter[] = ['all', 'archived', 'suspended', 'sold', 'expired', 'deleted'];
  const allowedSorts: ListingsSort[] = ['newest', 'oldest', 'updated', 'expiring'];
  
  const rawTab = searchParams.get('tab');
  const rawQuery = searchParams.get('q') || '';
  const rawSort = (searchParams.get('sort') || 'newest') as ListingsSort;
  const rawDeepFilter = searchParams.get('deepFilter') || 'all';
  
  const [activeTab, setActiveTab] = useState<ListingsTab>(
    allowedTabs.includes(rawTab as ListingsTab) ? (rawTab as ListingsTab) : 'active'
  );
  const [deepInventoryFilter, setDeepInventoryFilter] = useState<DeepInventoryFilter>(
    allowedDeepFilters.includes(rawDeepFilter as DeepInventoryFilter) ? (rawDeepFilter as DeepInventoryFilter) : 'all'
  );
  const [draftQuery, setDraftQuery] = useState<string>(rawQuery);
  const [appliedQuery, setAppliedQuery] = useState<string>(rawQuery.trim());
  const [sort, setSort] = useState<ListingsSort>(
    allowedSorts.includes(rawSort) ? rawSort : 'newest'
  );
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
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

  // Sync with URL params when they change
  useEffect(() => {
    const rawTab = searchParams.get('tab');
    const rawQuery = searchParams.get('q') || '';
    const rawSort = (searchParams.get('sort') || 'newest') as ListingsSort;
    const rawDeepFilter = searchParams.get('deepFilter') || 'all';

    setActiveTab(allowedTabs.includes(rawTab as ListingsTab) ? (rawTab as ListingsTab) : 'active');
    setDeepInventoryFilter(allowedDeepFilters.includes(rawDeepFilter as DeepInventoryFilter) ? (rawDeepFilter as DeepInventoryFilter) : 'all');
    setDraftQuery(rawQuery);
    setAppliedQuery(rawQuery.trim());
    setSort(allowedSorts.includes(rawSort) ? rawSort : 'newest');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const setUrlParams = useCallback(
    (next: { tab?: ListingsTab; q?: string; sort?: ListingsSort; deepFilter?: DeepInventoryFilter }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (next.tab) params.set('tab', next.tab);
      else params.delete('tab');

      if (next.deepFilter && next.deepFilter !== 'all') params.set('deepFilter', next.deepFilter);
      else params.delete('deepFilter');

      if (next.q && next.q.trim()) params.set('q', next.q.trim());
      else params.delete('q');

      if (next.sort) params.set('sort', next.sort);
      else params.delete('sort');

      const qs = params.toString();
      router.replace(qs ? `?${qs}` : '?');
    },
    [router, searchParams]
  );

  const fetchData = useCallback(async (isRefresh = false) => {
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

      // Fetch both listings and stats in a single request for consistency
      const params = new URLSearchParams();
      
      // Map tabs to API status params
      if (activeTab === 'deep_inventory') {
        // Deep inventory - filter by the selected sub-filter
        if (deepInventoryFilter !== 'all') {
          params.set('status', deepInventoryFilter);
        } else {
          // Fetch all deep inventory items (archived, suspended, sold, expired, deleted)
          params.set('status', 'deep_inventory');
        }
      } else {
        // Map UI tabs to legacy status filter values supported by the API
        const statusParam = activeTab === 'in_review' ? 'pending' : activeTab;
        params.set('status', statusParam);
      }
      
      if (appliedQuery) {
        params.set('q', appliedQuery);
      }
      params.set('listingType', listingType);
      
      // For work listings, pass staffMemberUserId to get only this staff member's listings
      if (listingType === 'work' && userId) {
        params.set('staffMemberUserId', userId);
      }
      
      params.set('sort', sort);
      params.set('includeStats', '1'); // Always include stats

      const response = await fetch(`/api/listings/my-listings?${params}`, {
        credentials: 'include',
        cache: 'no-store', // Prevent stale cache data
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch listings' }));
        throw new Error(errorData.error || 'Failed to fetch listings');
      }

      const data = await response.json();
      
      // Update all state atomically to prevent inconsistencies
      setListings(data.data || data.listings || []);
      setMeta(data.meta ?? null);
      
      // Update stats if included in response
      if (data.stats) {
        // Parse all stats as numbers (PostgreSQL bigint comes as strings)
        const parsedStats = {
          all: Number(data.stats.all) || 0,
          active: Number(data.stats.active) || 0,
          public: Number(data.stats.public) || 0,
          inReview: Number(data.stats.inReview) || 0,
          draft: Number(data.stats.draft) || 0,
          rejected: Number(data.stats.rejected) || 0,
          archived: Number(data.stats.archived) || 0,
          suspended: Number(data.stats.suspended) || 0,
          sold: Number(data.stats.sold) || 0,
          expired: Number(data.stats.expired) || 0,
          deleted: Number(data.stats.deleted) || 0,
        };
        // Calculate deepInventory total
        const deepInventoryTotal = 
          parsedStats.archived + 
          parsedStats.suspended + 
          parsedStats.sold + 
          parsedStats.expired + 
          parsedStats.deleted;
        setStats({ ...parsedStats, deepInventory: deepInventoryTotal });
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error('Error fetching listings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch listings');
      setListings([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeTab, deepInventoryFilter, appliedQuery, listingType, sort]);

  useEffect(() => {
    fetchData(false);
    return () => { abortRef.current?.abort(); };
  }, [fetchData]);

  const handleTabChange = (tab: ListingsTab) => {
    setActiveTab(tab);
    // Reset deep inventory filter when switching tabs
    if (tab !== 'deep_inventory') {
      setDeepInventoryFilter('all');
    }
    setUrlParams({ tab, q: appliedQuery, sort, deepFilter: tab === 'deep_inventory' ? deepInventoryFilter : undefined });
  };

  const handleDeepInventoryFilterChange = (filter: DeepInventoryFilter) => {
    setDeepInventoryFilter(filter);
    setUrlParams({ tab: activeTab, q: appliedQuery, sort, deepFilter: filter });
  };

  const handleSortChange = (nextSort: ListingsSort) => {
    setSort(nextSort);
    setUrlParams({ tab: activeTab, q: appliedQuery, sort: nextSort, deepFilter: activeTab === 'deep_inventory' ? deepInventoryFilter : undefined });
  };

  const applySearch = () => {
    const next = draftQuery.trim();
    setAppliedQuery(next);
    setUrlParams({ tab: activeTab, q: next, sort, deepFilter: activeTab === 'deep_inventory' ? deepInventoryFilter : undefined });
  };

  const clearSearch = () => {
    setDraftQuery('');
    setAppliedQuery('');
    setUrlParams({ tab: activeTab, q: undefined, sort, deepFilter: activeTab === 'deep_inventory' ? deepInventoryFilter : undefined });
  };

  const handleArchive = async (listingId: string) => {
    if (deleteConfirm !== listingId) {
      setDeleteConfirm(listingId);
      return;
    }

    try {
      const listing = listings.find((l) => l.id === listingId);
      if (!listing) {
        throw new Error('Listing not found');
      }

      const nextLifecycleStatus = listing.lifecycleStatus === 'archived' ? 'active' : 'archived';

      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lifecycleStatus: nextLifecycleStatus }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update listing');
      }

      setDeleteConfirm(null);
      await fetchData(true); // Pass true to indicate this is a refresh
    } catch (err) {
      console.error('Error updating listing:', err);
      setError(err instanceof Error ? err.message : 'Failed to update listing');
    }
  };

  // Open confirmation modal for delete
  const handleDelete = (listingId: string) => {
    const listing = listings.find((l) => l.id === listingId);
    setConfirmModal({
      isOpen: true,
      action: 'delete',
      listingId,
      title: 'Delete Listing',
      description: `Are you sure you want to delete "${listing?.year} ${listing?.make} ${listing?.model}"? It will be removed from public views but kept in your Deep Inventory.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
  };

  // Open confirmation modal for mark sold
  const handleMarkSold = (listingId: string) => {
    const listing = listings.find((l) => l.id === listingId);
    setConfirmModal({
      isOpen: true,
      action: 'markSold',
      listingId,
      title: 'Mark as Sold',
      description: `Congratulations! Mark "${listing?.year} ${listing?.make} ${listing?.model}" as sold? It will be moved to your Deep Inventory.`,
      confirmLabel: 'Mark Sold',
      variant: 'default',
    });
  };

  // Execute the confirmed action
  const executeConfirmedAction = async () => {
    if (!confirmModal.listingId || !confirmModal.action) return;
    
    setIsConfirming(true);
    try {
      if (confirmModal.action === 'delete') {
        const response = await fetch(`/api/listings/${confirmModal.listingId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload.error || 'Failed to delete listing');
        }
      } else if (confirmModal.action === 'markSold') {
        const response = await fetch(`/api/listings/${confirmModal.listingId}/mark-sold`, {
          method: 'POST',
          credentials: 'include',
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload.error || 'Failed to mark as sold');
        }
      } else if (confirmModal.action === 'extend' && confirmModal.extendDays) {
        const response = await fetch(`/api/listings/${confirmModal.listingId}/extend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ days: confirmModal.extendDays }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload.error || 'Failed to extend listing');
        }
      }

      setConfirmModal({ ...confirmModal, isOpen: false });
      await fetchData(true);
    } catch (err) {
      console.error('Error executing action:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete action');
    } finally {
      setIsConfirming(false);
    }
  };

  const closeConfirmModal = () => {
    if (!isConfirming) {
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
  };

  // Open confirmation modal for extend
  const handleExtend = (listingId: string, days: 7 | 14) => {
    const listing = listings.find((l) => l.id === listingId);
    const expiresAt = listing?.expiresAt ? new Date(listing.expiresAt) : null;
    const newExpiresAt = expiresAt ? new Date(expiresAt.getTime() + days * 24 * 60 * 60 * 1000) : null;
    const formattedNewDate = newExpiresAt?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    setConfirmModal({
      isOpen: true,
      action: 'extend',
      listingId,
      title: `Extend Listing by ${days === 7 ? '1 Week' : '2 Weeks'}`,
      description: `Extend "${listing?.year} ${listing?.make} ${listing?.model}" by ${days} days?${formattedNewDate ? ` New expiration date: ${formattedNewDate}` : ''}`,
      confirmLabel: 'Extend',
      variant: 'default',
      extendDays: days,
    });
  };

  const newListingUrl = listingType === 'work' 
    ? '/staff-dashboard/work-listings/new' 
    : '/user-dashboard/listings/new';

  return (
    <div className="min-h-screen bg-background">
      {/* Page Container */}
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
        {/* Header Section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {listingType === 'work' ? 'Work Listings' : 'My Listings'}
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                {listingType === 'work' 
                  ? 'Manage listings for your partner/dealership' 
                  : 'Manage your personal car listings'}
              </p>
            </div>
            
            <button 
              onClick={() => fetchData(true)} 
              disabled={isRefreshing}
              className="px-5 py-2 rounded-full border border-border hover:bg-secondary/10 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          <ListingsTabs 
            stats={stats}
            activeTab={activeTab}
            deepInventoryFilter={deepInventoryFilter}
            onTabChange={handleTabChange}
            onDeepInventoryFilterChange={handleDeepInventoryFilterChange}
          />

          <div className="flex flex-col gap-3 mt-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_14rem_auto] sm:items-center">
              <div className="flex items-center gap-3">
                <input
                  value={draftQuery}
                  onChange={(e) => setDraftQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') applySearch();
                  }}
                  placeholder="Search make, model, year, VIN..."
                  className="flex-1 h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors px-0 text-sm"
                />
                <button 
                  onClick={applySearch} 
                  className="px-5 py-2 rounded-full border border-border hover:bg-secondary/10 text-sm transition-colors"
                >
                  Search
                </button>
                {(draftQuery || appliedQuery) && (
                  <button 
                    onClick={clearSearch} 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              <Select value={sort} onValueChange={(v) => handleSortChange(v as ListingsSort)}>
                <SelectTrigger className="h-10 border-0 border-b border-border rounded-none bg-transparent">
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
                <button className="px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors">
                  New Listing
                </button>
              </Link>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {appliedQuery ? `Search: “${appliedQuery}”` : 'Tip: Use Active for clean inventory.'}
              </p>
              <p className="text-xs text-muted-foreground">
                Showing {meta?.count ?? listings.length} of {stats.all}
              </p>
            </div>
          </div>
        </section>

        {/* Listings Section */}
        <section className="space-y-8">
          <div className="border-b border-border/40 pb-2">
            <h3 className="text-lg font-medium tracking-tight">Your Listings</h3>
          </div>

          {/* Refreshing Indicator */}
          {isRefreshing && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              Refreshing...
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* Loading State - Only show on initial load */}
          {isLoading && listings.length === 0 && (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading listings...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && listings.length === 0 && (
            <div className="rounded-xl border border-border p-16 text-center">
              <svg className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
              <p className="text-sm text-muted-foreground mb-4">
                {appliedQuery ? 'No listings found matching your search' : 'You haven\'t created any listings yet'}
              </p>
              <Link href={newListingUrl}>
                <button className="px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors">
                  Create Your First Listing
                </button>
              </Link>
            </div>
          )}

          {/* Listings */}
          {listings.length > 0 && (
            <div className="space-y-4">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  listingType={listingType}
                  deleteConfirm={deleteConfirm}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                  onMarkSold={handleMarkSold}
                  onExtend={handleExtend}
                  onCancelDelete={() => setDeleteConfirm(null)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={confirmModal.isOpen} onOpenChange={(open) => !open && closeConfirmModal()}>
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
              onClick={closeConfirmModal}
              disabled={isConfirming}
              className="px-5 py-2 rounded-full border border-border hover:bg-secondary/10 text-sm transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={executeConfirmedAction}
              disabled={isConfirming}
              className={`px-5 py-2 rounded-full text-white text-sm transition-colors disabled:opacity-50 ${
                confirmModal.variant === 'destructive' 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
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
