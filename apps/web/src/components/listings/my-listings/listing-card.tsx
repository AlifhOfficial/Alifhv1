/**
 * Listing Card Component - Owner's View
 * 
 * macOS-inspired minimal design
 * Clean typography, subtle interactions
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Sparkles, 
  Heart, 
  Flame, 
  MoreHorizontal, 
  Pencil, 
  Archive, 
  Trash2, 
  CheckCircle2, 
  RotateCcw, 
  Plus, 
  Clock, 
  ChevronDown,
  TrendingUp,
  BarChart3,
  Eye
} from 'lucide-react';
import { cn } from '@/utils';
import type { ListingData, ListingType } from './types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ============================================================================
// Types & Helpers
// ============================================================================

interface ListingCardProps {
  listing: ListingData;
  listingType: ListingType;
  deleteConfirm: string | null;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onRelist?: (id: string) => void;
  onMarkSold: (id: string) => void;
  onExtend: (id: string, days: 7 | 14) => void;
  onCancelDelete: () => void;
  onToggleBlk?: (listingId: string, currentlyBlk: boolean) => void;
  isTogglingBlk?: boolean;
  canPromoteToBlk?: boolean;
}

function calculateHotScore(listing: ListingData): number {
  const views = listing.viewCount ?? 0;
  const impressions = listing.impressionCount ?? 0;
  const saves = listing.favouriteCount ?? 0;
  const superlikes = listing.superlikeCount ?? 0;
  
  const ctr = impressions > 0 ? views / impressions : 0;
  const engagement = views > 0 ? (saves + superlikes * 2) / views : 0;
  
  const ctrScore = Math.min(ctr * 1000, 50);
  const engagementScore = Math.min(engagement * 1000, 40);
  const volumeBonus = Math.min(Math.log10(views + 1) * 5, 10);
  
  return Math.round(ctrScore + engagementScore + volumeBonus);
}

function getHotLevel(score: number): { label: string; color: string } {
  if (score >= 70) return { label: 'Hot', color: 'text-orange-500' };
  if (score >= 40) return { label: 'Warm', color: 'text-amber-500' };
  if (score >= 20) return { label: 'Active', color: 'text-emerald-500' };
  return { label: 'New', color: 'text-muted-foreground' };
}

// ============================================================================
// Main Component
// ============================================================================

export function ListingCard({
  listing,
  listingType,
  deleteConfirm,
  onArchive,
  onDelete,
  onRelist,
  onMarkSold,
  onExtend,
  onCancelDelete,
  onToggleBlk,
  isTogglingBlk,
  canPromoteToBlk,
}: ListingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const editHref = listingType === 'work'
    ? `/staff-dashboard/work-listings/${listing.id}/edit`
    : `/user-dashboard/listings/${listing.id}/edit`;
  
  const newListingUrl = listingType === 'work' 
    ? '/staff-dashboard/work-listings/new' 
    : '/user-dashboard/listings/new';

  const displayImage = listing.thumbnail || '/assets/cars/car1.avif';

  // Time calculations
  const expiresAt = listing.expiresAt ? new Date(listing.expiresAt as any) : null;
  const msRemaining = expiresAt ? expiresAt.getTime() - Date.now() : null;
  const daysRemaining = msRemaining ? Math.ceil(msRemaining / (24 * 60 * 60 * 1000)) : null;
  const isExpiringSoon = listing.lifecycleStatus === 'active' && !!expiresAt && msRemaining !== null && msRemaining > 0 && msRemaining <= 2 * 24 * 60 * 60 * 1000;

  // Date formatting
  const formatDate = (date: Date | string | null) => {
    if (!date) return '—';
    const d = new Date(date);
    return d.toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  const formatRelativeDate = (date: Date | string | null) => {
    if (!date) return '—';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return formatDate(date);
  };

  // Status flags
  const isSuspended = !!listing.suspensionReason;
  const isRejected = listing.moderationStatus === 'rejected';
  const isInReview = listing.moderationStatus === 'submitted' || listing.moderationStatus === 'pending_review';
  const isDraft = listing.moderationStatus === 'draft';
  const isApproved = listing.moderationStatus === 'approved';
  const isDeleted = listing.lifecycleStatus === 'deleted';
  const isSold = listing.lifecycleStatus === 'sold';
  const isExpired = listing.lifecycleStatus === 'expired';
  const isArchived = listing.lifecycleStatus === 'archived';

  // Permissions
  const canArchiveToggle = (listing.lifecycleStatus === 'active' || listing.lifecycleStatus === 'archived') && !isSuspended && !(isRejected && listing.lifecycleStatus === 'archived');
  const canDelete = listing.lifecycleStatus !== 'deleted';
  const isDeepInventory = isDeleted || isSold || isExpired || isSuspended;
  const canEdit = !isSuspended && !isDeepInventory;
  const canMarkSold = listing.isPublic && listing.lifecycleStatus === 'active';

  // Metrics
  const views = listing.viewCount ?? 0;
  const impressions = listing.impressionCount ?? 0;
  const saves = listing.favouriteCount ?? 0;
  const superlikes = listing.superlikeCount ?? 0;
  const hotScore = calculateHotScore(listing);
  const hotLevel = getHotLevel(hotScore);
  const ctr = impressions > 0 ? ((views / impressions) * 100).toFixed(1) : '0.0';

  // Status config
  const getStatus = () => {
    if (isDeleted) return { label: 'Deleted', color: 'text-muted-foreground' };
    if (isSold) return { label: 'Sold', color: 'text-emerald-600' };
    if (isExpired) return { label: 'Expired', color: 'text-amber-600' };
    if (isArchived && !isSuspended) return { label: 'Archived', color: 'text-muted-foreground' };
    if (isSuspended) return { label: 'Suspended', color: 'text-red-600' };
    if (isRejected) return { label: 'Rejected', color: 'text-red-600' };
    if (listing.isPublic) return { label: 'Live', color: 'text-emerald-600' };
    if (isInReview) return { label: 'In Review', color: 'text-blue-600' };
    if (isDraft) return { label: 'Draft', color: 'text-amber-600' };
    if (isApproved) return { label: 'Ready', color: 'text-emerald-600' };
    return { label: 'Active', color: 'text-muted-foreground' };
  };
  const status = getStatus();

  return (
    <div className="group relative rounded-xl bg-sidebar border border-sidebar-border overflow-hidden">
      {/* Main Card Content */}
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="p-3 sm:w-56 lg:w-64 flex-shrink-0">
          <Link 
            href={`/listings/${listing.id}`} 
            className="relative aspect-[4/3] w-full overflow-hidden rounded-lg block bg-muted/20"
          >
            <Image
              src={displayImage}
              alt={`${listing.year} ${listing.make} ${listing.model}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 224px, 256px"
            />
            
            {listing.isBlkListing && (
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm">
                <span className="text-[10px] font-bold tracking-widest text-white">BLK</span>
              </div>
            )}

            {isExpiringSoon && daysRemaining !== null && (
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-amber-500">
                <span className="text-[10px] font-bold text-white">{daysRemaining}d left</span>
              </div>
            )}
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:py-4 sm:pr-4 sm:pl-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <Link href={`/listings/${listing.id}`} className="flex-1 min-w-0">
              <h3 className="text-[15px] font-bold tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {listing.year} {listing.make} {listing.model}
              </h3>
              {listing.trim && (
                <p className="text-sm text-muted-foreground/70 mt-0.5 line-clamp-1">{listing.trim}</p>
              )}
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 -m-1 rounded-md text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/50 transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {canEdit && (
                  <DropdownMenuItem asChild>
                    <Link href={editHref} className="flex items-center gap-2">
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                )}
                {canMarkSold && (
                  <DropdownMenuItem onClick={() => onMarkSold(listing.id)} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Mark as Sold
                  </DropdownMenuItem>
                )}
                {isExpiringSoon && (
                  <DropdownMenuItem onClick={() => onExtend(listing.id, 7)} className="flex items-center gap-2 text-blue-600">
                    <Clock className="w-4 h-4" />
                    Extend 7 days
                  </DropdownMenuItem>
                )}
                {onToggleBlk && listing.lifecycleStatus === 'active' && (
                  listing.isBlkListing ? (
                    <DropdownMenuItem onClick={() => onToggleBlk(listing.id, true)} disabled={isTogglingBlk} className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {isTogglingBlk ? 'Updating...' : 'Remove BLK'}
                    </DropdownMenuItem>
                  ) : canPromoteToBlk ? (
                    <DropdownMenuItem onClick={() => onToggleBlk(listing.id, false)} disabled={isTogglingBlk} className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {isTogglingBlk ? 'Updating...' : 'Promote to BLK'}
                    </DropdownMenuItem>
                  ) : null
                )}
                {canArchiveToggle && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onArchive(listing.id)} className="flex items-center gap-2">
                      {listing.lifecycleStatus === 'archived' ? (
                        <><RotateCcw className="w-4 h-4" />Restore</>
                      ) : (
                        <><Archive className="w-4 h-4" />Archive</>
                      )}
                    </DropdownMenuItem>
                  </>
                )}
                {canDelete && !isDeepInventory && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDelete(listing.id)} className="flex items-center gap-2 text-red-600 focus:text-red-600">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
                {isSuspended && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="text-primary">
                      <Link href={newListingUrl} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Create New
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Price Row */}
          <p className="text-lg font-bold text-blue-600 tabular-nums tracking-tight mb-auto">
            {listing.price.toLocaleString()} <span className="text-sm font-semibold text-muted-foreground">AED</span>
          </p>

          {/* Status + Stats Row */}
          <div className="flex items-center justify-between pt-3">
            {/* Left: Status + Days Left + Hot */}
            <div className="flex items-center gap-2">
              <span className={cn("text-xs font-semibold", status.color)}>
                {status.label}
              </span>
              {listing.isPublic && daysRemaining !== null && daysRemaining > 0 && (
                <>
                  <span className="text-muted-foreground/30">·</span>
                  <span className={cn(
                    "text-xs font-medium tabular-nums",
                    isExpiringSoon ? "text-amber-600" : "text-muted-foreground/70"
                  )}>
                    {daysRemaining}d left
                  </span>
                </>
              )}
              {hotScore >= 20 && (
                <>
                  <span className="text-muted-foreground/30">·</span>
                  <span className={cn("flex items-center gap-1 text-xs font-semibold", hotLevel.color)}>
                    {hotScore >= 40 && <Flame className="w-3.5 h-3.5" />}
                    {hotLevel.label}
                  </span>
                </>
              )}
            </div>
            
            {/* Right: Stats */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="font-semibold text-foreground tabular-nums">{views}</span>
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="font-semibold text-foreground tabular-nums">{saves}</span>
              </span>
              {superlikes > 0 && (
                <span className="flex items-center gap-1 text-amber-500">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="font-semibold tabular-nums">{superlikes}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Insights Toggle Bar - Full Width */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 border-t border-sidebar-border/60 hover:bg-sidebar-accent/30 transition-colors",
          isExpanded && "bg-sidebar-accent/20"
        )}
      >
        <span className="text-xs font-medium text-muted-foreground">
          {isExpanded ? 'Hide Insights' : 'View Insights'}
        </span>
        <ChevronDown className={cn(
          "w-4 h-4 text-muted-foreground/50 transition-transform duration-200",
          isExpanded && "rotate-180"
        )} />
      </button>

      {/* Expanded Insights Panel - Full Width */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-3 bg-sidebar-accent/10 border-t border-sidebar-border/30 animate-in slide-in-from-top-2 duration-200">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-6 mb-4">
            {/* Click Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">Click Rate</span>
                <span className="text-sm font-bold tabular-nums text-foreground">{ctr}%</span>
              </div>
              <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(parseFloat(ctr) * 10, 100)}%` }}
                />
              </div>
            </div>
            
            {/* Engagement */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">Engagement</span>
                <span className={cn("text-sm font-bold tabular-nums", hotLevel.color)}>{hotScore}/100</span>
              </div>
              <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    hotScore >= 70 ? "bg-orange-500" :
                    hotScore >= 40 ? "bg-amber-500" :
                    hotScore >= 20 ? "bg-emerald-500" :
                    "bg-muted-foreground/30"
                  )}
                  style={{ width: `${hotScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Additional Stats Row */}
          <div className="flex items-center justify-between pt-3 border-t border-sidebar-border/30">
            <div className="flex items-center gap-5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                <span className="font-semibold text-foreground tabular-nums">{impressions.toLocaleString()}</span>
                impressions
              </span>
              {(listing.extensionCount ?? 0) > 0 && (
                <span>
                  Extended <span className="font-semibold text-foreground">{listing.extensionCount}×</span>
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatRelativeDate(listing.publishedAt || listing.createdAt)}
            </span>
          </div>

          {/* Expiry Date */}
          {expiresAt && (
            <p className={cn(
              "text-xs mt-3",
              isExpiringSoon ? "text-amber-600 font-medium" : "text-muted-foreground/60"
            )}>
              Expires {formatDate(expiresAt)}
            </p>
          )}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm === listing.id && (
        <div className="absolute inset-0 flex items-center justify-center bg-sidebar/95 backdrop-blur-sm rounded-xl z-10">
          <div className="text-center px-6">
            <p className="text-sm font-semibold text-foreground mb-4">Delete this listing?</p>
            <div className="flex items-center justify-center gap-3">
              <button 
                onClick={onCancelDelete}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => onDelete(listing.id)}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

