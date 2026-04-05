/**
 * My Listings View Component
 * Server-side filtering for accurate pagination
 */

'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, Package, Search, RefreshCw, Plus, X, Clock, FileText, XCircle, Archive, CheckCircle2, Timer, Ban, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

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
    color: 'text-primary', 
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
    color: 'text-warning', 
    message: 'No drafts', 
    subMessage: 'Unfinished listings you\'re working on will appear here' 
  },
  in_review: { 
    icon: Clock, 
    color: 'text-primary', 
    message: 'Nothing in review', 
    subMessage: 'Listings awaiting moderation will appear here' 
  },
  rejected: { 
    icon: XCircle, 
    color: 'text-destructive', 
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
    color: 'text-destructive', 
    message: 'No suspended listings', 
    subMessage: 'Listings flagged for policy review will appear here' 
  },
};
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
  initialData: {
    listings: ListingData[];
    total: number;
    stats: ListingStats;
  };
  initialBlackQuota?: BlackQuotaData | null;
  filters: {
    status: ListingStatus;
    sort: ListingsSort;
    page: number;
    q: string;
  };
}

const ITEMS_PER_PAGE = 50;

export function MyListingsView({
  userId: _userId,
  listingType = 'personal',
  initialData,
  initialBlackQuota = null,
  filters,
}: MyListingsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(filters.q);
  
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
  const [blackQuota, setBlackQuota] = useState<BlackQuotaData | null>(initialBlackQuota);
  const [togglingBlkId, setTogglingBlkId] = useState<string | null>(null);

  const listings = initialData.listings;
  const totalListings = initialData.total;
  const stats = initialData.stats;
  const selectedStatus = filters.status;
  const sort = filters.sort;
  const currentPage = filters.page;
  const debouncedSearch = filters.q;
  const isLoading = isPending;

  useEffect(() => {
    setSearchQuery(filters.q);
  }, [filters.q]);

  useEffect(() => {
    setBlackQuota(initialBlackQuota);
  }, [initialBlackQuota]);

  const updateRoute = useCallback((updates: Partial<MyListingsViewProps['filters']>) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    const nextStatus = updates.status ?? selectedStatus;
    const nextSort = updates.sort ?? sort;
    const nextPage = updates.page ?? currentPage;
    const nextQuery = updates.q ?? debouncedSearch;

    if (nextStatus === 'active') params.delete('status');
    else params.set('status', nextStatus);

    if (nextSort === 'newest') params.delete('sort');
    else params.set('sort', nextSort);

    if (nextPage <= 1) params.delete('page');
    else params.set('page', String(nextPage));

    if (!nextQuery.trim()) params.delete('q');
    else params.set('q', nextQuery.trim());

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
  }, [searchParams, selectedStatus, sort, currentPage, debouncedSearch, pathname, router]);

  // Debounced search handler
  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    updateRoute({ q: value, page: 1 });
  }, 400);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    debouncedSetSearch(value);
  }, [debouncedSetSearch]);

  // Handle filter changes - reset page
  const handleStatusChange = useCallback((status: ListingStatus) => {
    setError(null);
    updateRoute({ status, page: 1 });
  }, [updateRoute]);

  const handleSortChange = useCallback((newSort: ListingsSort) => {
    setError(null);
    updateRoute({ sort: newSort, page: 1 });
  }, [updateRoute]);

  // Pagination
  const totalPages = Math.ceil(totalListings / ITEMS_PER_PAGE);
  const hasActiveFilters = selectedStatus !== 'all' || debouncedSearch.trim() !== '';

  // Main tabs always shown in tab bar
  const mainStatusTabs: Array<{ key: ListingStatus; label: string; count: number; color?: string }> = [
    { key: 'all', label: 'All', count: stats.all, color: 'purple' },
    { key: 'public', label: 'Public', count: stats.public, color: 'green' },
    { key: 'in_review', label: 'Review', count: stats.inReview, color: 'blue' },
    { key: 'archived', label: 'Archived', count: stats.archived, color: 'gray' },
  ];

  // Secondary statuses in dropdown (less frequently accessed)
  const allSecondaryTabs = [
    { key: 'draft' as const, label: 'Drafts', count: stats.draft, color: 'yellow' },
    { key: 'active' as const, label: 'Active', count: stats.active, color: 'blue' },
    { key: 'rejected' as const, label: 'Rejected', count: stats.rejected, color: 'red' },
    { key: 'sold' as const, label: 'Sold', count: stats.sold, color: 'green' },
    { key: 'expired' as const, label: 'Expired', count: stats.expired, color: 'orange' },
    { key: 'suspended' as const, label: 'Suspended', count: stats.suspended, color: 'red' },
  ];
  const secondaryStatusTabs = allSecondaryTabs.filter(tab => tab.count > 0);

  // Check if current selection is a secondary status
  const isSecondaryStatusSelected = secondaryStatusTabs.some(tab => tab.key === selectedStatus);
  const selectedSecondaryTab = secondaryStatusTabs.find(tab => tab.key === selectedStatus);

  // Action handlers
  const handleBulkClear = () => {
    const count = listings.length;
    const allTabs = [...mainStatusTabs, ...allSecondaryTabs];
    const statusLabel = allTabs.find(t => t.key === selectedStatus)?.label.toLowerCase() || 'these';
    
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
    const listing = listings.find((l) => l.id === listingId);
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
    const listing = listings.find((l) => l.id === listingId);
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
    const listing = listings.find((l) => l.id === listingId);
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
    const listing = listings.find((l) => l.id === listingId);
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
        const listingIds = listings.map(l => l.id);
        
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
        const listing = listings.find((l) => l.id === confirmModal.listingId);
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

      if (confirmModal.action === 'bulkClear') {
        updateRoute({ status: 'all', page: 1 });
      } else {
        startTransition(() => {
          router.refresh();
        });
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
      
      // Update quota
      if (result.data?.quota) {
        setBlackQuota(prev => prev ? {
          ...prev,
          activeBlackListingsCount: result.data.quota.current,
          hasAvailableSlots: result.data.quota.current < prev.blackListingQuota,
        } : null);
      }

      startTransition(() => {
        router.refresh();
      });
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

  return (
    <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-callout sm:text-headline font-semibold text-foreground">
              {listingType === 'work' ? 'Inventory' : 'My Listings'}
            </h1>
            <p className="text-caption2 sm:text-caption1 text-muted-foreground/60 mt-0.5">
              {listingType === 'work' 
                ? 'Manage your dealership inventory' 
                : 'Manage your personal car listings'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {listingType === 'work' && blackQuota && (
              <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-zinc-800/80 text-zinc-100">
                <span className="text-[10px] sm:text-caption1">
                  {blackQuota.blackListingQuota - blackQuota.activeBlackListingsCount} of {blackQuota.blackListingQuota} BLK
                </span>
              </div>
            )}
            
            <button 
              onClick={() => startTransition(() => router.refresh())} 
              disabled={isLoading}
              className="p-1.5 sm:p-2 rounded-full hover:bg-secondary/50 active:bg-secondary transition-colors disabled:opacity-50"
              aria-label="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 mb-6 sm:mb-8">
        {/* Row 1: Search + Sort + New */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-9 sm:h-10 pl-9 sm:pl-10 pr-8 rounded-lg sm:rounded-xl bg-secondary/50 text-caption1 sm:text-subhead placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all"
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

          {/* Sort */}
          <Select value={sort} onValueChange={(v) => handleSortChange(v as ListingsSort)}>
            <SelectTrigger className="h-9 sm:h-10 w-24 sm:w-28 border-0 bg-secondary/50 rounded-lg sm:rounded-xl text-caption1 sm:text-subhead shrink-0">
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
            <button className="h-9 sm:h-10 px-3 sm:px-4 rounded-lg sm:rounded-xl bg-primary text-primary-foreground text-caption1 sm:text-subhead transition-colors hover:bg-primary/90 flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">New</span>
            </button>
          </Link>
        </div>

        {/* Row 2: Status Pills - Horizontal scroll */}
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-xl w-fit">
            {mainStatusTabs.map((tab) => {
              const isActive = selectedStatus === tab.key;
              const count = tab.count;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleStatusChange(tab.key)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-caption2 sm:text-caption1 transition-all capitalize whitespace-nowrap ${
                    isActive
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label === 'All' ? 'All' : tab.label.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}
                  {count !== undefined && count > 0 && (
                    <span className="ml-1 sm:ml-1.5 text-muted-foreground">{count}</span>
                  )}
                </button>
              );
            })}
            
            {/* More dropdown for secondary statuses */}
            {secondaryStatusTabs.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-caption2 sm:text-caption1 transition-all flex items-center gap-1 whitespace-nowrap ${
                      isSecondaryStatusSelected
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {isSecondaryStatusSelected && selectedSecondaryTab ? (
                      <>
                        {selectedSecondaryTab.label}
                        <span className="text-muted-foreground">{selectedSecondaryTab.count}</span>
                      </>
                    ) : (
                      <>More</>  
                    )}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[140px]">
                  {secondaryStatusTabs.map((tab) => (
                    <DropdownMenuItem
                      key={tab.key}
                      onClick={() => handleStatusChange(tab.key)}
                      className={`text-caption1 cursor-pointer ${
                        selectedStatus === tab.key ? 'bg-secondary' : ''
                      }`}
                    >
                      <span className="flex-1">{tab.label}</span>
                      <span className="text-muted-foreground ml-2">{tab.count}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Count & Actions */}
      <div className="flex items-center justify-between mb-3 sm:mb-6">
        <p className="text-caption2 sm:text-caption1 text-muted-foreground">
          {totalListings} listing{totalListings !== 1 ? 's' : ''}
          {hasActiveFilters && <span className="hidden xs:inline"> (filtered)</span>}
          {totalPages > 1 && <span className="ml-2 hidden sm:inline">· Page {currentPage} of {totalPages}</span>}
        </p>
          
        {/* Bulk Clear Button */}
        {listings.length > 0 && 
         ['sold', 'archived', 'expired', 'rejected', 'suspended'].includes(selectedStatus) && (
          <button
            onClick={handleBulkClear}
            className="text-caption2 sm:text-caption1 text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 sm:mb-8 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-secondary/50 text-caption1 sm:text-subhead">
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-4 p-4">
              <Skeleton className="w-28 sm:w-36 md:w-44 aspect-[4/3] rounded-lg shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-4 sm:h-5 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-5 w-16 rounded-full mt-auto" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State - No Data */}
      {!isLoading && !error && !hasActiveFilters && listings.length === 0 && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center max-w-xs">
            <Package className="w-8 h-8 mx-auto text-muted-foreground/20 mb-4" strokeWidth={1.5} />
            <h3 className="text-subhead font-semibold text-foreground mb-1">No listings yet</h3>
            <p className="text-caption1 text-muted-foreground/60 leading-relaxed mb-4">Create your first listing to get started</p>
            <Link href={newListingUrl}>
              <button className="px-4 py-2 rounded-lg sm:rounded-xl bg-primary text-primary-foreground text-caption1 sm:text-subhead transition-colors hover:bg-primary/90">
                Create Listing
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Empty State - No Results */}
      {!isLoading && !error && hasActiveFilters && listings.length === 0 && (() => {
        const config = debouncedSearch 
          ? { icon: Search, color: 'text-muted-foreground/20', message: 'No matches found', subMessage: 'Try adjusting your search' }
          : (EMPTY_STATE_CONFIG[selectedStatus] || EMPTY_STATE_CONFIG.all);
        const Icon = config.icon;
        
        return (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center max-w-xs">
              <Icon className={`w-8 h-8 mx-auto mb-4 ${debouncedSearch ? 'text-muted-foreground/20' : config.color}`} strokeWidth={1.5} />
              <h3 className="text-subhead font-semibold text-foreground mb-1">{config.message}</h3>
              <p className="text-caption1 text-muted-foreground/60 leading-relaxed">{config.subMessage}</p>
            </div>
          </div>
        );
      })()}

      {/* Listings */}
      {!isLoading && !error && listings.length > 0 && (
        <>
          <div className="space-y-3 sm:space-y-4">
            {listings.map((listing) => (
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border/30">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateRoute({ page: Math.max(1, currentPage - 1) })}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-md sm:rounded-lg text-caption2 sm:text-caption1 bg-secondary/50 hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-caption2 sm:text-caption1 text-muted-foreground tabular-nums">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => updateRoute({ page: Math.min(totalPages, currentPage + 1) })}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-md sm:rounded-lg text-caption2 sm:text-caption1 bg-secondary/50 hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirmation Modal */}
      <Dialog open={confirmModal.isOpen} onOpenChange={(open) => !open && !isConfirming && setConfirmModal({ ...confirmModal, isOpen: false })}>
        <DialogContent className="max-w-xs rounded-xl border border-border/40 bg-card p-6 shadow-xl">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Icon */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              confirmModal.variant === 'destructive' ? 'bg-destructive/10' :
              confirmModal.variant === 'warning' ? 'bg-warning-muted' :
              confirmModal.variant === 'success' ? 'bg-emerald-500/10' :
              'bg-primary/10'
            }`}>
              <AlertTriangle className={`w-6 h-6 ${
                confirmModal.variant === 'destructive' ? 'text-destructive' :
                confirmModal.variant === 'warning' ? 'text-warning' :
                confirmModal.variant === 'success' ? 'text-emerald-500' :
                'text-primary'
              }`} />
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <DialogTitle className="text-callout font-semibold text-foreground">
                {confirmModal.title}
              </DialogTitle>
              <DialogDescription className="text-subhead text-muted-foreground">
                {confirmModal.description}
              </DialogDescription>
            </div>

            {/* Actions */}
            <div className="flex flex-col w-full gap-2 pt-2">
              <button
                onClick={executeConfirmedAction}
                disabled={isConfirming}
                className={`w-full h-10 rounded-lg text-subhead font-semibold transition-colors disabled:opacity-50 ${
                  confirmModal.variant === 'destructive' 
                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' 
                    : confirmModal.variant === 'warning'
                    ? 'bg-warning text-white hover:bg-warning'
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
                className="w-full h-10 rounded-lg text-subhead font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
