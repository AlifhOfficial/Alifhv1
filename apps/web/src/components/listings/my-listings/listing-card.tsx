/**
 * Listing Card Component - Owner's View
 * Clean minimal design with expandable insights
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Zap, 
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
  BarChart3,
  Eye
} from 'lucide-react';
import { cn, getThumbUrl } from '@/utils';
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

  const displayImage = getThumbUrl(listing.thumbnail) || listing.thumbnail || '/assets/cars/car1.avif';

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
  // Rejected listings can only be deleted - no archive, edit, or other actions
  const canArchiveToggle = (listing.lifecycleStatus === 'active' || listing.lifecycleStatus === 'archived') && !isSuspended && !isRejected;
  const canDelete = listing.lifecycleStatus !== 'deleted';
  const isDeepInventory = isDeleted || isSold || isExpired || isSuspended;
  const canEdit = !isSuspended && !isDeepInventory && !isRejected;
  const canMarkSold = listing.isPublic && listing.lifecycleStatus === 'active' && !isRejected;

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
    <div className="group relative rounded-lg sm:rounded-xl bg-card border border-border/40 overflow-hidden hover:border-border/60 transition-colors">
      {/* Main Card Content */}
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="p-2 sm:p-2.5 sm:w-44 md:w-52 lg:w-56 flex-shrink-0">
          <Link 
            href={`/listings/${listing.id}`} 
            className="relative aspect-[16/9] sm:aspect-[4/3] w-full overflow-hidden rounded-md sm:rounded-lg block bg-muted/30"
          >
            <Image
              src={displayImage}
              alt={`${listing.year} ${listing.make} ${listing.model}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 176px, (max-width: 1024px) 208px, 224px"
            />
            
            {listing.isBlkListing && (
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black text-white">
                <span className="text-[9px] font-bold tracking-widest">BLK</span>
              </div>
            )}

            {isExpiringSoon && daysRemaining !== null && (
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-amber-500 text-white">
                <span className="text-[10px] font-bold">{daysRemaining}d left</span>
              </div>
            )}
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 px-2 pb-2 sm:p-3 sm:py-3 sm:pr-3 sm:pl-0.5 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-1 sm:mb-1.5">
            <Link href={`/listings/${listing.id}`} className="flex-1 min-w-0">
              <h3 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-1">
                {listing.year} {listing.make} {listing.model}
              </h3>
              {listing.trim && (
                <p className="text-[11px] sm:text-xs text-muted-foreground/60 mt-0.5 line-clamp-1">{listing.trim}</p>
              )}
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-6 h-6 sm:w-7 sm:h-7 -mr-1 flex items-center justify-center rounded-md sm:rounded-lg text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50 transition-colors">
                  <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
                      <Zap className="w-4 h-4" />
                      {isTogglingBlk ? 'Updating...' : 'Remove BLK'}
                    </DropdownMenuItem>
                  ) : canPromoteToBlk ? (
                    <DropdownMenuItem onClick={() => onToggleBlk(listing.id, false)} disabled={isTogglingBlk} className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
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
                {canDelete && (!isDeepInventory || isRejected || isSuspended) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDelete(listing.id)} className="flex items-center gap-2 text-red-600 focus:text-red-600">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Price Row */}
          <p className="text-sm sm:text-base font-bold text-primary tabular-nums mb-auto">
            {listing.price.toLocaleString()} <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground">AED</span>
          </p>

          {/* Status + Stats Row */}
          <div className="flex items-center justify-between gap-2 pt-1.5 sm:pt-2 mt-1.5 sm:mt-2 border-t border-border/30">
            {/* Left: Status + Days Left + Hot */}
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              <span className={cn("text-[10px] sm:text-[11px] font-semibold px-1.5 py-0.5 rounded", 
                status.label === 'Live' ? 'bg-emerald-500/10 text-emerald-600' :
                status.label === 'Sold' ? 'bg-emerald-500/10 text-emerald-600' :
                status.label === 'Draft' ? 'bg-amber-500/10 text-amber-600' :
                status.label === 'In Review' ? 'bg-blue-500/10 text-blue-600' :
                status.label === 'Rejected' ? 'bg-red-500/10 text-red-600' :
                status.label === 'Suspended' ? 'bg-red-500/10 text-red-600' :
                status.label === 'Expired' ? 'bg-amber-500/10 text-amber-600' :
                'bg-muted text-muted-foreground'
              )}>
                {status.label}
              </span>
              {listing.isPublic && daysRemaining !== null && daysRemaining > 0 && !isExpiringSoon && (
                <span className="text-[10px] sm:text-[11px] text-muted-foreground/60 tabular-nums">
                  {daysRemaining}d
                </span>
              )}
              {hotScore >= 40 && (
                <span className={cn("flex items-center gap-0.5 text-[10px] sm:text-[11px] font-semibold", hotLevel.color)}>
                  <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  {hotLevel.label}
                </span>
              )}
            </div>
            
            {/* Right: Stats */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 text-[10px] sm:text-[11px] text-muted-foreground/60 shrink-0">
              <span className="flex items-center gap-0.5 sm:gap-1">
                <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span className="font-semibold text-foreground/80 tabular-nums">{views}</span>
              </span>
              <span className="flex items-center gap-0.5 sm:gap-1">
                <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3" strokeWidth={1.5} />
                <span className="font-semibold text-foreground/80 tabular-nums">{saves}</span>
              </span>
              {superlikes > 0 && (
                <span className="flex items-center gap-0.5 sm:gap-1 text-amber-500">
                  <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="font-semibold tabular-nums">{superlikes}</span>
                </span>
              )}
            </div>
          </div>

          {/* Rejection Reason */}
          {isRejected && listing.rejectionReason && (
            <div className="mt-1.5 sm:mt-2 px-2 py-1 sm:py-1.5 rounded-md bg-red-500/5 border border-red-500/10">
              <p className="text-[10px] sm:text-[11px] text-red-600 line-clamp-2">
                <span className="font-semibold">Reason:</span> {listing.rejectionReason}
              </p>
            </div>
          )}

          {/* AI Moderation Reason for Pending Review */}
          {isInReview && listing.aiModeration?.reasoning && (
            <div className="mt-1.5 sm:mt-2 px-2 py-1 sm:py-1.5 rounded-md bg-blue-500/5 border border-blue-500/10">
              <p className="text-[10px] sm:text-[11px] text-blue-600 line-clamp-2">
                <span className="font-semibold">Under Review:</span> {listing.aiModeration.reasoning}
              </p>
            </div>
          )}

          {/* Suspension Reason */}
          {isSuspended && listing.suspensionReason && (
            <div className="mt-1.5 sm:mt-2 px-2 py-1 sm:py-1.5 rounded-md bg-red-500/5 border border-red-500/10">
              <p className="text-[10px] sm:text-[11px] text-red-600 line-clamp-2">
                <span className="font-semibold">Reason:</span> {listing.suspensionReason}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Insights Toggle Bar - Full Width */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 border-t border-border/30 hover:bg-muted/30 transition-colors",
          isExpanded && "bg-muted/20"
        )}
      >
        <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground/60">
          {isExpanded ? 'Hide insights' : 'View insights'}
        </span>
        <ChevronDown className={cn(
          "w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground/40 transition-transform duration-200",
          isExpanded && "rotate-180"
        )} />
      </button>

      {/* Expanded Insights Panel - Full Width */}
      {isExpanded && (
        <div className="px-2 sm:px-3 pb-2 sm:pb-3 pt-2 bg-muted/10 animate-in slide-in-from-top-2 duration-200">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-2 sm:mb-3">
            {/* Click Rate */}
            <div>
              <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground/60">Click Rate</span>
                <span className="text-[11px] sm:text-xs font-bold tabular-nums text-foreground">{ctr}%</span>
              </div>
              <div className="h-1 sm:h-1.5 bg-muted/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(parseFloat(ctr) * 10, 100)}%` }}
                />
              </div>
            </div>
            
            {/* Engagement */}
            <div>
              <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground/60">Engagement</span>
                <span className={cn("text-[11px] sm:text-xs font-bold tabular-nums", hotLevel.color)}>{hotScore}/100</span>
              </div>
              <div className="h-1 sm:h-1.5 bg-muted/50 rounded-full overflow-hidden">
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
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1 xs:gap-0 pt-2 border-t border-border/30">
            <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-[11px] text-muted-foreground/60">
              <span className="flex items-center gap-1">
                <BarChart3 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span className="font-semibold text-foreground/80 tabular-nums">{impressions.toLocaleString()}</span>
                <span>impr</span>
              </span>
              {(listing.extensionCount ?? 0) > 0 && (
                <span>
                  Extended <span className="font-semibold text-foreground/80">{listing.extensionCount}×</span>
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground/50">
              {formatRelativeDate(listing.publishedAt || listing.createdAt)}
            </span>
          </div>

          {/* Expiry Date */}
          {expiresAt && (
            <p className={cn(
              "text-[10px] sm:text-[11px] mt-1.5 sm:mt-2",
              isExpiringSoon ? "text-amber-600 font-medium" : "text-muted-foreground/50"
            )}>
              Expires {formatDate(expiresAt)}
            </p>
          )}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm === listing.id && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-2xl rounded-lg sm:rounded-xl z-10">
          <div className="text-center px-4 sm:px-6">
            <p className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-3">Delete this listing?</p>
            <div className="flex items-center justify-center gap-2">
              <button 
                onClick={onCancelDelete}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground rounded-md sm:rounded-lg hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => onDelete(listing.id)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-destructive hover:bg-destructive/90 rounded-md sm:rounded-lg transition-colors"
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

