/**
 * Consignment Funnels View Component
 * Staff dashboard view for managing consignment funnels
 * Each funnel is displayed as a row with inline preview of matching cars
 */

'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Trash2,
  Edit2,
  Loader2,
  Search,
  AlertTriangle,
  Inbox,
  RefreshCw,
  ImageIcon,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { FunnelFormDrawer } from './funnel-form-drawer';
import { FunnelMatchesView } from './funnel-matches-view';

interface ConsignmentFunnel {
  id: string;
  partnerId: string;
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
}

interface FunnelWithCount extends ConsignmentFunnel {
  matchCount: number;
}

const SYNC_COOLDOWN = 30000; // 30 seconds between syncs
const SYNC_STORAGE_KEY = 'funnel-last-sync';

export function ConsignmentFunnelsView() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingFunnel, setEditingFunnel] = useState<ConsignmentFunnel | null>(null);
  const [viewingFunnel, setViewingFunnel] = useState<ConsignmentFunnel | null>(null);
  const [deletingFunnel, setDeletingFunnel] = useState<ConsignmentFunnel | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [syncTimestamp, setSyncTimestamp] = useState<number | null>(null); // For cache busting

  // Get last sync time from localStorage (persists across refreshes)
  const getLastSyncTime = () => {
    if (typeof window === 'undefined') return 0;
    return parseInt(localStorage.getItem(SYNC_STORAGE_KEY) || '0', 10);
  };

  const setLastSyncTime = (time: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SYNC_STORAGE_KEY, time.toString());
    }
  };

  // Check cooldown on mount
  useEffect(() => {
    const lastSync = getLastSyncTime();
    const now = Date.now();
    const remaining = Math.ceil((SYNC_COOLDOWN - (now - lastSync)) / 1000);
    if (remaining > 0) {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => setCooldownRemaining(remaining), 0);
    }
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  const { data, isLoading, isFetching, error, refetch } = useQuery<{ funnels: FunnelWithCount[] }>({
    queryKey: ['consignment-funnels'],
    queryFn: async () => {
      // Add cache-busting param to bypass browser HTTP cache
      const res = await fetch(`/api/partner/consignment/funnels?_t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to fetch funnels');
      return res.json();
    },
    staleTime: 0, // Always refetch on invalidation
    refetchOnMount: 'always', // Always refetch when component mounts
    gcTime: 0, // Don't keep stale data in cache
  });

  const deleteMutation = useMutation({
    mutationFn: async (funnelId: string) => {
      const res = await fetch(`/api/partner/consignment/funnels/${funnelId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete funnel');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consignment-funnels'] });
      queryClient.invalidateQueries({ queryKey: ['partner-all-funnels'] });
    },
  });

  // If viewing all matches for a specific funnel
  if (viewingFunnel) {
    return (
      <FunnelMatchesView 
        funnel={viewingFunnel} 
        onBack={() => setViewingFunnel(null)} 
      />
    );
  }

  const totalMatches = data?.funnels?.reduce((sum, f) => sum + f.matchCount, 0) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Lead Funnels</h1>
          <p className="text-sm sm:text-[15px] text-muted-foreground/70 mt-1">
            Create saved searches to find consignment leads
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={async () => {
              const now = Date.now();
              const lastSync = getLastSyncTime();
              const remaining = Math.ceil((SYNC_COOLDOWN - (now - lastSync)) / 1000);
              if (remaining > 0) {
                setCooldownRemaining(remaining);
                return; // Rate limited
              }
              setLastSyncTime(now);
              setIsSyncing(true);
              // Set sync timestamp to bust browser HTTP cache
              setSyncTimestamp(now);
              // Refetch main query
              await refetch();
              // Also invalidate funnel previews
              queryClient.invalidateQueries({ queryKey: ['funnel-preview'] });
              // Reset syncing after a delay
              setTimeout(() => setIsSyncing(false), 500);
            }}
            disabled={isSyncing || isFetching}
            className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors disabled:opacity-50"
            title={cooldownRemaining > 0 ? `Wait ${cooldownRemaining}s` : isSyncing ? 'Syncing...' : 'Sync funnels'}
          >
            <RefreshCw className={cn("w-4 h-4 transition-transform", (isSyncing || isFetching) && "animate-spin")} />
            <span className="hidden sm:inline">
              {cooldownRemaining > 0 ? `Wait ${cooldownRemaining}s` : isSyncing ? 'Syncing' : 'Sync'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm sm:text-[15px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-full transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Funnel</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      {!isLoading && data?.funnels && data.funnels.length > 0 && (
        <div className="flex items-center gap-4 sm:gap-6 mb-6 pb-6 border-b border-border/30">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground/60" />
            <span className="text-sm sm:text-[15px] font-medium text-muted-foreground/80">
              <span className="font-bold text-blue-600">{data.funnels.length}</span> funnels
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-[15px] font-medium text-muted-foreground/80">
              <span className="font-bold text-blue-600">{totalMatches}</span> matching vehicles
            </span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground/40 mb-4" />
          <p className="text-[15px] text-muted-foreground/60 font-medium">Loading your funnels...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-24 rounded-xl bg-destructive/5 border border-destructive/20">
          <p className="text-[15px] text-destructive font-medium">Failed to load funnels. Please try again.</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && (!data?.funnels || data.funnels.length === 0) && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Inbox className="w-12 h-12 text-muted-foreground/30 mb-4" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold tracking-tight mb-1">No Lead Funnels Yet</h3>
          <p className="text-sm text-muted-foreground/60 max-w-sm">
            Create a funnel to discover consignment leads
          </p>
        </div>
      )}

      {/* Funnels as Rows */}
      {!isLoading && data?.funnels && data.funnels.length > 0 && (
        <div className="space-y-6 sm:space-y-8">
          {data.funnels.map((funnel) => (
            <FunnelRow
              key={funnel.id}
              funnel={funnel}
              syncTimestamp={syncTimestamp}
              onViewAll={() => setViewingFunnel(funnel)}
              onEdit={() => setEditingFunnel(funnel)}
              onDelete={() => setDeletingFunnel(funnel)}
              isDeleting={deleteMutation.isPending && deletingFunnel?.id === funnel.id}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={!!deletingFunnel}
        funnelName={deletingFunnel?.name || ''}
        onClose={() => setDeletingFunnel(null)}
        onConfirm={() => {
          if (deletingFunnel) {
            deleteMutation.mutate(deletingFunnel.id, {
              onSuccess: () => setDeletingFunnel(null),
            });
          }
        }}
        isDeleting={deleteMutation.isPending}
      />

      {/* Create/Edit Drawer */}
      <FunnelFormDrawer
        open={isCreateOpen || !!editingFunnel}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingFunnel(null);
        }}
        funnel={editingFunnel}
      />
    </div>
  );
}

// ============================================================================
// Funnel Row Component - Shows funnel header + inline car previews
// ============================================================================

interface FunnelRowProps {
  funnel: FunnelWithCount;
  syncTimestamp: number | null;
  onViewAll: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

interface MatchingListing {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  thumbnail: string | null;
}

function FunnelRow({ funnel, syncTimestamp, onViewAll, onEdit, onDelete, isDeleting }: FunnelRowProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const filterTags = getFilterTags(funnel.filters);

  // Fetch preview listings (limit 4)
  const { data: previewData, isLoading: previewLoading } = useQuery<{
    listings: MatchingListing[];
    total: number;
  }>({
    queryKey: ['funnel-preview', funnel.id, syncTimestamp],
    queryFn: async () => {
      // Add cache-busting param when syncing to bypass browser HTTP cache
      const url = syncTimestamp 
        ? `/api/partner/consignment/funnels/${funnel.id}/matches?limit=4&_t=${syncTimestamp}`
        : `/api/partner/consignment/funnels/${funnel.id}/matches?limit=4`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch preview');
      return res.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes for previews
  });

  return (
    <div className="rounded-xl border border-sidebar-border bg-sidebar overflow-hidden">
      {/* Funnel Header */}
      <div className="w-full p-4 sm:p-5 border-b border-sidebar-border/50 bg-sidebar-accent/30">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Toggle + Title, Description, Tags - Clickable for collapse */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="min-w-0 flex-1 text-left hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-3 mb-1">
              <ChevronDown className={cn(
                "w-4 h-4 text-sidebar-foreground/60 transition-transform flex-shrink-0",
                !isExpanded && "-rotate-90"
              )} />
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-sidebar-foreground truncate">{funnel.name}</h3>
              <span className="text-sm font-semibold text-blue-600">Count: {funnel.matchCount}</span>
            </div>
            
            {funnel.description && (
              <p className="text-sm text-sidebar-foreground/60 line-clamp-1 mb-2 ml-7">
                {funnel.description}
              </p>
            )}

            {/* Filter Tags */}
            <div className="flex flex-wrap gap-1.5 ml-7">
              {filterTags.length > 0 ? (
                filterTags.slice(0, 5).map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 text-xs font-medium bg-sidebar-accent text-sidebar-foreground/70 rounded-md">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-xs text-sidebar-foreground/40 italic">All vehicles</span>
              )}
              {filterTags.length > 5 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-sidebar-accent text-sidebar-foreground/70 rounded-md">
                  +{filterTags.length - 5} more
                </span>
              )}
            </div>
          </button>

          {/* Right: Active Badge + Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={cn(
              'shrink-0 px-2 py-0.5 text-xs font-semibold rounded-full mr-2',
              funnel.isActive 
                ? 'bg-green-500/10 text-green-600' 
                : 'bg-muted/50 text-muted-foreground'
            )}>
              {funnel.isActive ? 'Active' : 'Paused'}
            </span>
            <button
              type="button"
              onClick={onEdit}
              className="p-2 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors"
              title="Edit funnel"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="p-2 text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
              title="Delete funnel"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Car Previews - Collapsible */}
      {isExpanded && (
      <div className="p-4 sm:p-5">
        {previewLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-sidebar-foreground/30" />
          </div>
        ) : !previewData?.listings || previewData.listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ImageIcon className="w-8 h-8 text-sidebar-foreground/20 mb-2" />
            <p className="text-sm text-sidebar-foreground/50">No matching vehicles yet</p>
          </div>
        ) : (
          <>
            {/* Simple Preview Grid */}
            <div className="flex gap-3 overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:overflow-visible scrollbar-hide">
              {previewData.listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.id}`}
                  className="flex-shrink-0 w-[180px] sm:w-auto group"
                >
                  <div className="rounded-lg border border-sidebar-border bg-sidebar overflow-hidden hover:border-sidebar-border/80 hover:shadow-md transition-all">
                    {/* Image */}
                    <div className="aspect-[4/3] bg-muted/20 relative overflow-hidden">
                      {listing.thumbnail ? (
                        <Image
                          src={listing.thumbnail}
                          alt={`${listing.year} ${listing.make} ${listing.model}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 180px, 200px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-sidebar-accent">
                          <ImageIcon className="w-8 h-8 text-sidebar-foreground/20" />
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="p-2.5">
                      <p className="text-sm font-semibold text-sidebar-foreground truncate">
                        {listing.year} {listing.make} {listing.model}
                      </p>
                      <p className="text-sm font-bold text-blue-600">
                        AED {listing.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* View All Button */}
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={onViewAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-primary hover:bg-primary/5 rounded-lg transition-colors"
              >
                View All {previewData.total > 4 ? `${previewData.total} ` : ''}→
              </button>
            </div>
          </>
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
// ============================================================================
// Delete Confirmation Modal
// ============================================================================

interface DeleteConfirmModalProps {
  open: boolean;
  funnelName: string;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

function DeleteConfirmModal({ open, funnelName, onClose, onConfirm, isDeleting }: DeleteConfirmModalProps) {
  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="max-w-md w-full bg-sidebar border border-sidebar-border rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold text-sidebar-foreground mb-1">Delete Funnel</h2>
          <p className="text-sm text-sidebar-foreground/60">
            Are you sure you want to delete <span className="font-medium text-sidebar-foreground">&ldquo;{funnelName}&rdquo;</span>? This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 h-10 px-4 border border-sidebar-border text-sidebar-foreground text-sm font-medium rounded-lg hover:bg-sidebar-accent disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 h-10 px-4 bg-destructive text-destructive-foreground text-sm font-medium rounded-lg hover:bg-destructive/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}