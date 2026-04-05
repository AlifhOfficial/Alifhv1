/**
 * Consignment Funnels View Component
 * Staff dashboard view for managing consignment funnels
 * Each funnel is displayed as a row with inline preview of matching cars
 */

'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Trash2,
  Edit2,
  Loader2,
  AlertTriangle,
  Inbox,
  RefreshCw,
  ImageIcon,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { getAppThumbUrl } from '@/utils/storage';
import Link from 'next/link';
import { FunnelFormDrawer } from './funnel-form-drawer';
import { FunnelMatchesView } from './funnel-matches-view';
import { getFunnelMatchesAction } from '@/actions/funnels';

interface ConsignmentFunnel {
  id: string;
  partnerId: string;
  name: string;
  description: string | null;
  filters: {
    makes?: string[];
    models?: string[];
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

interface ConsignmentFunnelsViewProps {
  initialData?: { funnels: FunnelWithCount[] };
}

export function ConsignmentFunnelsView({ initialData }: ConsignmentFunnelsViewProps) {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingFunnel, setEditingFunnel] = useState<ConsignmentFunnel | null>(null);
  const [viewingFunnel, setViewingFunnel] = useState<ConsignmentFunnel | null>(null);
  const [deletingFunnel, setDeletingFunnel] = useState<ConsignmentFunnel | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

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
    refetchOnMount: initialData ? false : 'always',
    initialData,
    initialDataUpdatedAt: initialData ? Date.now() : undefined,
    staleTime: initialData ? 60_000 : 0,
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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-callout sm:text-headline font-semibold text-foreground">Lead Funnels</h1>
          <p className="text-caption2 sm:text-caption1 text-muted-foreground/60 mt-0.5">
            Create saved searches to find consignment leads
          </p>
        </div>
        <div className="flex items-center gap-2">
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
              // Refetch main query
              await refetch();
              // Also invalidate funnel previews
              queryClient.invalidateQueries({ queryKey: ['funnel-preview'] });
              // Reset syncing after a delay
              setTimeout(() => setIsSyncing(false), 500);
            }}
            disabled={isSyncing || isFetching}
            className="p-1.5 sm:p-2 rounded-full hover:bg-secondary/50 active:bg-secondary transition-colors disabled:opacity-50"
            title={cooldownRemaining > 0 ? `Wait ${cooldownRemaining}s` : isSyncing ? 'Syncing...' : 'Sync funnels'}
          >
            <RefreshCw className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground", (isSyncing || isFetching) && "animate-spin")} />
          </button>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="h-9 sm:h-10 px-3 sm:px-4 rounded-lg sm:rounded-xl bg-primary text-primary-foreground text-caption1 sm:text-subhead transition-colors hover:bg-primary/90 flex items-center gap-1.5 sm:gap-2"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">New Funnel</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      {!isLoading && data?.funnels && data.funnels.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-10">
          <div>
            <span className="text-[10px] sm:text-caption1 text-muted-foreground">Funnels</span>
            <p className="text-callout sm:text-headline lg:text-title3 font-semibold tracking-tight mt-0.5 sm:mt-1 text-primary">{data.funnels.length}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {/* Stats Skeleton */}
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <Skeleton className="h-3 w-14 mb-1" />
              <Skeleton className="h-6 w-8" />
            </div>
          </div>
          
          {/* Funnel Cards Skeleton */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg sm:rounded-xl border border-border/40 p-3 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Chevron + Title */}
                  <div className="flex items-center gap-2 sm:gap-3 mb-1">
                    <Skeleton className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded flex-shrink-0" />
                    <Skeleton className="h-4 sm:h-5 w-32 sm:w-40" />
                  </div>
                  {/* Description */}
                  <Skeleton className="h-3 w-48 sm:w-56 mb-2 ml-5 sm:ml-7" />
                  {/* Filter Tags */}
                  <div className="flex gap-1 sm:gap-1.5 ml-5 sm:ml-7">
                    <Skeleton className="h-5 w-14 sm:w-16 rounded-md" />
                    <Skeleton className="h-5 w-16 sm:w-20 rounded-md" />
                    <Skeleton className="h-5 w-12 sm:w-14 rounded-md" />
                  </div>
                </div>
                {/* Active Badge + Menu */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Skeleton className="h-5 sm:h-6 w-14 sm:w-16 rounded-full" />
                  <Skeleton className="h-6 w-6 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-6 sm:mb-8 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-secondary/50 text-caption1 sm:text-subhead">
          Failed to load funnels. Please try again.
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && (!data?.funnels || data.funnels.length === 0) && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center max-w-xs">
            <Inbox className="w-8 h-8 mx-auto text-muted-foreground/20 mb-4" strokeWidth={1.5} />
            <h3 className="text-subhead font-semibold text-foreground mb-1">No Lead Funnels Yet</h3>
            <p className="text-caption1 text-muted-foreground/60 leading-relaxed mb-4">
              Create a funnel to discover consignment leads
            </p>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 rounded-lg sm:rounded-xl bg-primary text-primary-foreground text-caption1 sm:text-subhead transition-colors hover:bg-primary/90"
            >
              Create Funnel
            </button>
          </div>
        </div>
      )}

      {/* Funnels as Rows */}
      {!isLoading && !error && data?.funnels && data.funnels.length > 0 && (
        <div className="space-y-2 sm:space-y-3">
          {data.funnels.map((funnel) => (
            <FunnelRow
              key={funnel.id}
              funnel={funnel}
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

function FunnelRow({ funnel, onViewAll, onEdit, onDelete, isDeleting }: FunnelRowProps) {
  const [isExpanded, setIsExpanded] = useState(false); // Start collapsed - lazy load
  const filterTags = getFilterTags(funnel.filters);

  // Fetch preview listings only when expanded (lazy load)
  const { data: previewData, isLoading: previewLoading } = useQuery<{
    listings: MatchingListing[];
    total: number;
  }>({
    queryKey: ['funnel-preview', funnel.id],
    queryFn: () => getFunnelMatchesAction(funnel.id, { limit: 4 }),
    enabled: isExpanded, // Only fetch when row is expanded

  });

  return (
    <div className="rounded-lg sm:rounded-xl border border-border/40 bg-card hover:border-border/60 transition-all overflow-hidden">
      {/* Funnel Header */}
      <div className="w-full p-3 sm:p-4 border-b border-border/30">
        <div className="flex items-start justify-between gap-3">
          {/* Left: Toggle + Title, Description, Tags - Clickable for collapse */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="min-w-0 flex-1 text-left"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-1">
              <ChevronDown className={cn(
                "w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground/50 transition-transform flex-shrink-0",
                !isExpanded && "-rotate-90"
              )} />
              <h3 className="text-subhead sm:text-callout font-semibold tracking-tight truncate">{funnel.name}</h3>
            </div>
            
            {funnel.description && (
              <p className="text-caption2 sm:text-caption1 text-muted-foreground/60 line-clamp-1 mb-2 ml-5 sm:ml-7">
                {funnel.description}
              </p>
            )}

            {/* Filter Tags */}
            <div className="flex flex-wrap gap-1 sm:gap-1.5 ml-5 sm:ml-7">
              {filterTags.length > 0 ? (
                filterTags.slice(0, 5).map((tag, i) => (
                  <span key={i} className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-caption1 bg-secondary text-muted-foreground rounded-md">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-[10px] sm:text-caption1 text-muted-foreground/40 italic">All vehicles</span>
              )}
              {filterTags.length > 5 && (
                <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-caption1 bg-secondary text-muted-foreground rounded-md">
                  +{filterTags.length - 5} more
                </span>
              )}
            </div>
          </button>

          {/* Right: Active Badge + Actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <span className={cn(
              'shrink-0 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-caption1 font-semibold rounded-full mr-1 sm:mr-2',
              funnel.isActive 
                ? 'bg-success-muted text-success' 
                : 'bg-muted/50 text-muted-foreground'
            )}>
              {funnel.isActive ? 'Active' : 'Paused'}
            </span>
            <button
              type="button"
              onClick={onEdit}
              className="p-1.5 sm:p-2 text-muted-foreground/60 hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
              title="Edit funnel"
            >
              <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="p-1.5 sm:p-2 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
              title="Delete funnel"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Car Previews - Collapsible */}
      {isExpanded && (
      <div className="p-3 sm:p-4">
        {previewLoading ? (
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:overflow-visible scrollbar-hide">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[140px] sm:w-auto">
                <div className="rounded-lg border border-border/40 bg-card overflow-hidden">
                  <Skeleton className="aspect-[4/3]" />
                  <div className="p-2 sm:p-2.5">
                    <Skeleton className="h-3 sm:h-4 w-24 sm:w-32 mb-1.5" />
                    <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !previewData?.listings || previewData.listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
            <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground/20 mb-2" />
            <p className="text-[10px] sm:text-caption1 text-muted-foreground/50">No matching vehicles yet</p>
          </div>
        ) : (
          <>
            {/* Simple Preview Grid */}
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:overflow-visible scrollbar-hide">
              {previewData.listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.id}`}
                  className="flex-shrink-0 w-[140px] sm:w-auto group"
                >
                  <div className="rounded-lg border border-border/40 bg-card overflow-hidden hover:border-border/60 transition-all">
                    {/* Image */}
                    <div className="aspect-[4/3] bg-muted/20 relative overflow-hidden">
                      {getAppThumbUrl(listing.thumbnail) ? (
                        <img
                          src={getAppThumbUrl(listing.thumbnail)!}
                          alt={`${listing.year} ${listing.make} ${listing.model}`}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary">
                          <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground/20" />
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="p-2 sm:p-2.5">
                      <p className="text-caption1 sm:text-subhead font-semibold truncate">
                        {listing.year} {listing.make} {listing.model}
                      </p>
                      <p className="text-caption1 sm:text-subhead font-bold text-primary">
                        AED {listing.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* View All Button */}
            <div className="mt-3 sm:mt-4 flex justify-end">
              <button
                type="button"
                onClick={onViewAll}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-caption1 sm:text-subhead font-semibold text-primary hover:bg-primary/5 rounded-lg transition-colors"
              >
                View All →
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

  if (filters.models?.length) {
    tags.push(...filters.models.slice(0, 2));
    if (filters.models.length > 2) tags.push(`+${filters.models.length - 2} models`);
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

  // Use portal to render at document.body level to avoid stacking context issues
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] bg-background/40 backdrop-blur-2xl flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="max-w-md w-full bg-card border border-border rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <h2 className="text-headline font-semibold mb-1">Delete Funnel</h2>
          <p className="text-subhead text-muted-foreground/60">
            Are you sure you want to delete <span className="font-medium text-foreground">&ldquo;{funnelName}&rdquo;</span>? This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 h-10 px-4 border border-border text-foreground text-subhead rounded-lg hover:bg-secondary/50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 h-10 px-4 bg-destructive text-destructive-foreground text-subhead rounded-lg hover:bg-destructive/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
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
    </div>,
    document.body
  );
}
