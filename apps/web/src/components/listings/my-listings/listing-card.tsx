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
  Clock, 
  ChevronDown,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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

  const displayImage = getThumbUrl(listing.thumbnail);

  // Time calculations
  const expiresAt = listing.expiresAt ? new Date(listing.expiresAt as any) : null;
  const msRemaining = expiresAt ? expiresAt.getTime() - Date.now() : null;
  const daysRemaining = msRemaining ? Math.ceil(msRemaining / (24 * 60 * 60 * 1000)) : null;
  const isExpiringSoon = listing.lifecycleStatus === 'active' && !!expiresAt && msRemaining !== null && msRemaining > 0 && msRemaining <= 2 * 24 * 60 * 60 * 1000;

  // Date formatting
  const formatRelativeDate = (date: Date | string | null) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return d.toLocaleDateString('en-AE', { day: 'numeric', month: 'short' });
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

  // Permissions - simplified logic
  // Active/Archived: full options
  // Sold/Expired/Suspended/Rejected: delete only
  // Deleted: no options (hide menu)
  const canArchiveToggle = (listing.lifecycleStatus === 'active' || listing.lifecycleStatus === 'archived') && !isSuspended && !isRejected;
  const canDelete = !isDeleted; // Can delete anything except already deleted
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
    if (isDeleted) return { label: 'Deleted', bg: 'bg-muted', text: 'text-muted-foreground' };
    if (isSold) return { label: 'Sold', bg: 'bg-emerald-500/10', text: 'text-emerald-600' };
    if (isExpired) return { label: 'Expired', bg: 'bg-amber-500/10', text: 'text-amber-600' };
    if (isSuspended) return { label: 'Suspended', bg: 'bg-red-500/10', text: 'text-red-600' };
    if (isRejected) return { label: 'Rejected', bg: 'bg-red-500/10', text: 'text-red-600' };
    if (isArchived) return { label: 'Archived', bg: 'bg-muted', text: 'text-muted-foreground' };
    if (listing.isPublic) return { label: 'Live', bg: 'bg-emerald-500/10', text: 'text-emerald-600' };
    if (isInReview) return { label: 'In Review', bg: 'bg-blue-500/10', text: 'text-blue-600' };
    if (isDraft) return { label: 'Draft', bg: 'bg-amber-500/10', text: 'text-amber-600' };
    if (isApproved) return { label: 'Ready', bg: 'bg-emerald-500/10', text: 'text-emerald-600' };
    return { label: 'Active', bg: 'bg-muted', text: 'text-muted-foreground' };
  };
  const status = getStatus();

  return (
    <div className="group relative">
      {/* Main Card */}
      <div className="flex gap-4 p-4">
        {/* Image */}
        <Link 
          href={`/listings/${listing.id}`} 
          className="relative w-28 sm:w-36 md:w-44 aspect-[4/3] flex-shrink-0 overflow-hidden rounded-lg bg-muted/30"
        >
          {displayImage ? (
            <Image
              src={displayImage}
              alt={`${listing.year} ${listing.make} ${listing.model}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, 176px"
            />
          ) : (
            <div className="absolute inset-0 bg-muted/30" />
          )}
          
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

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Top: Title + Menu */}
          <div className="flex items-start justify-between gap-3">
            <Link href={`/listings/${listing.id}`} className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-tight line-clamp-1">
                {listing.year} {listing.make} {listing.model}
              </h3>
              {listing.trim && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{listing.trim}</p>
              )}
            </Link>

            {/* Hide menu for deleted listings - no actions available */}
            {!isDeleted && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 -mr-2 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
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
                  <>
                    <DropdownMenuItem onClick={() => onExtend(listing.id, 7)} className="flex items-center gap-2 text-blue-600">
                      <Clock className="w-4 h-4" />
                      Extend 7 days
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onExtend(listing.id, 14)} className="flex items-center gap-2 text-blue-600">
                      <Clock className="w-4 h-4" />
                      Extend 14 days
                    </DropdownMenuItem>
                  </>
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
                {canDelete && (
                  <>
                    {(canEdit || canMarkSold || canArchiveToggle) && <DropdownMenuSeparator />}
                    <DropdownMenuItem onClick={() => onDelete(listing.id)} className="flex items-center gap-2 text-red-600 focus:text-red-600">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            )}
          </div>

          {/* Price */}
          <p className="text-base sm:text-lg font-bold text-foreground tabular-nums mt-2">
            {listing.price.toLocaleString()} <span className="text-xs font-medium text-muted-foreground">AED</span>
          </p>

          {/* Status + Stats */}
          <div className="flex items-center gap-3 mt-auto pt-3">
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", status.bg, status.text)}>
              {status.label}
            </span>
            
            {hotScore >= 40 && (
              <span className={cn("flex items-center gap-1 text-xs font-medium", hotLevel.color)}>
                <Flame className="w-3.5 h-3.5" />
                {hotLevel.label}
              </span>
            )}

            <div className="flex items-center gap-3 ml-auto text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {views}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" />
                {saves}
              </span>
              {superlikes > 0 && (
                <span className="flex items-center gap-1 text-amber-500">
                  <Zap className="w-3.5 h-3.5" />
                  {superlikes}
                </span>
              )}
            </div>
          </div>

          {/* Rejection/Suspension Reason */}
          {isRejected && listing.rejectionReason && (
            <p className="text-xs text-red-600 mt-3 line-clamp-2">
              {listing.rejectionReason}
            </p>
          )}
          {isSuspended && listing.suspensionReason && (
            <p className="text-xs text-red-600 mt-3 line-clamp-2">
              {listing.suspensionReason}
            </p>
          )}
        </div>
      </div>

      {/* Insights Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center gap-1.5 py-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
      >
        <span>{isExpanded ? 'Hide insights' : isInReview ? 'Review status' : 'View insights'}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isExpanded && "rotate-180")} />
      </button>

      {/* Expanded Insights */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-2 space-y-5 animate-in slide-in-from-top-2 duration-200">
          {/* AI Moderation for Review - shown first when in review */}
          {isInReview && listing.aiModeration?.reasoning && (
            <div className="p-4 rounded-lg bg-blue-500/5">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-600">Under Review</span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {listing.aiModeration.reasoning}
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                A human moderator will make the final decision
              </p>
            </div>
          )}

          {/* Metrics */}
          <TooltipProvider delayDuration={200}>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs text-muted-foreground cursor-help border-b border-dotted border-muted-foreground/50">Click Rate</span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px]">
                      <p className="text-xs">Percentage of people who viewed your listing after seeing it in search results</p>
                      <p className="text-xs text-muted-foreground mt-1">Views ÷ Impressions × 100</p>
                    </TooltipContent>
                  </Tooltip>
                  <span className="text-sm font-semibold tabular-nums">{ctr}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${Math.min(parseFloat(ctr) * 5, 100)}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs text-muted-foreground cursor-help border-b border-dotted border-muted-foreground/50">Engagement</span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[220px]">
                      <p className="text-xs">Score based on how users interact with your listing</p>
                      <p className="text-xs text-muted-foreground mt-1">Combines click rate, saves, superlikes, and view volume (0-100)</p>
                    </TooltipContent>
                  </Tooltip>
                  <span className={cn("text-sm font-semibold tabular-nums", hotLevel.color)}>{hotScore}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full",
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
          </TooltipProvider>

          {/* Additional Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            <span>{impressions.toLocaleString()} impressions</span>
            <span>{formatRelativeDate(listing.publishedAt || listing.createdAt)}</span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Overlay */}
      {deleteConfirm === listing.id && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl z-10">
          <div className="text-center px-6">
            <p className="text-sm font-semibold mb-4">Delete this listing?</p>
            <div className="flex items-center justify-center gap-3">
              <button 
                onClick={onCancelDelete}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => onDelete(listing.id)}
                className="px-4 py-2 text-sm font-semibold text-white bg-destructive hover:bg-destructive/90 rounded-lg transition-colors"
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
