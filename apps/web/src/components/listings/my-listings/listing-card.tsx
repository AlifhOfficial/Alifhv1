/**
 * Listing Card Component
 */

'use client';

import Link from 'next/link';
import { Eye, Heart, Edit2, Archive, Trash2, CheckCircle2, Clock, Zap, RotateCcw } from 'lucide-react';
import type { ListingData, ListingType } from './types';

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
  // BLK toggle props (work listings only)
  onToggleBlk?: (listingId: string, currentlyBlk: boolean) => void;
  isTogglingBlk?: boolean;
  canPromoteToBlk?: boolean;
}

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
  const editHref =
    listingType === 'work'
      ? `/staff-dashboard/work-listings/${listing.id}/edit`
      : `/user-dashboard/listings/${listing.id}/edit`;
  
  const newListingUrl = listingType === 'work' 
    ? '/staff-dashboard/work-listings/new' 
    : '/user-dashboard/listings/new';

  const expiresAt = listing.expiresAt ? new Date(listing.expiresAt as any) : null;
  const msRemaining = expiresAt ? expiresAt.getTime() - Date.now() : null;
  const isExpiringSoon =
    listing.lifecycleStatus === 'active' &&
    !!expiresAt &&
    msRemaining !== null &&
    msRemaining > 0 &&
    msRemaining <= 2 * 24 * 60 * 60 * 1000;

  const isSuspended = !!listing.suspensionReason;
  const isRejected = listing.moderationStatus === 'rejected';
  const isInReview = listing.moderationStatus === 'submitted' || listing.moderationStatus === 'pending_review';
  const isDraft = listing.moderationStatus === 'draft';
  const isApproved = listing.moderationStatus === 'approved';
  const isDeleted = listing.lifecycleStatus === 'deleted';
  const isSold = listing.lifecycleStatus === 'sold';
  const isExpired = listing.lifecycleStatus === 'expired';
  const isArchived = listing.lifecycleStatus === 'archived';

  // Can archive/unarchive only if active or archived (and not suspended)
  const canArchiveToggle =
    (listing.lifecycleStatus === 'active' || listing.lifecycleStatus === 'archived') &&
    !isSuspended &&
    !(isRejected && listing.lifecycleStatus === 'archived');
  
  // Can soft delete only if not already deleted
  const canDelete = listing.lifecycleStatus !== 'deleted';
  
  // Deep inventory items (sold, expired, deleted, suspended) - limited actions
  const isDeepInventory = isDeleted || isSold || isExpired || isSuspended;

  // Status priority (higher = higher priority):
  // 1. Lifecycle states (deleted, sold, expired, archived) - terminal/override states
  // 2. Suspended/Rejected - admin actions
  // 3. Public - visible to users
  // 4. In Review - pending approval
  // 5. Draft - not submitted
  // 6. Approved but not public - approved but not yet visible
  // 7. Active - default fallback
  
  const statusLabel = 
    listing.lifecycleStatus === 'deleted' ? 'Deleted'
    : listing.lifecycleStatus === 'sold' ? 'Sold'
    : listing.lifecycleStatus === 'expired' ? 'Expired'
    : listing.lifecycleStatus === 'archived' && !isSuspended ? 'Archived'
    : isSuspended ? 'Suspended'
    : isRejected ? 'Rejected'
    : listing.isPublic ? 'Public'
    : isInReview ? 'In Review'
    : isDraft ? 'Draft'
    : isApproved ? 'Approved'
    : 'Active';

  const badgeClassName = 
    listing.lifecycleStatus === 'deleted' ? 'bg-muted text-muted-foreground'
    : listing.lifecycleStatus === 'sold' ? 'bg-green-500/10 text-green-500'
    : listing.lifecycleStatus === 'expired' ? 'bg-yellow-500/10 text-yellow-500'
    : listing.lifecycleStatus === 'archived' && !isSuspended ? 'bg-muted text-muted-foreground'
    : isSuspended || isRejected ? 'bg-red-500/10 text-red-500'
    : listing.isPublic ? 'bg-green-500/10 text-green-500'
    : isInReview ? 'bg-blue-500/10 text-blue-500'
    : isDraft ? 'bg-yellow-500/10 text-yellow-500'
    : 'bg-muted text-muted-foreground';

  return (
    <div className="group relative overflow-hidden rounded-xl transition-all duration-300 bg-sidebar border border-sidebar-border hover:border-sidebar-border/80 hover:shadow-md">
      <div className="flex flex-col">
        {/* Main Content Row */}
        <div className="flex items-start gap-5 p-5">
          {/* Thumbnail */}
          <Link href={`/listings/${listing.id}`} className="flex-shrink-0">
            <div className="relative aspect-[4/3] w-36 overflow-hidden rounded-lg bg-muted/20">
              {listing.thumbnail ? (
                <img
                  src={listing.thumbnail}
                  alt={`${listing.year} ${listing.make} ${listing.model}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                  <span className="text-xs">No image</span>
                </div>
              )}
            </div>
          </Link>

          {/* Details */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Title and Price */}
            <div className="flex items-start justify-between gap-4">
              <Link
                href={`/listings/${listing.id}`}
                className="group/title flex-1 min-w-0"
              >
                <h3 className="text-base font-medium text-sidebar-foreground group-hover/title:text-primary transition-colors line-clamp-1">
                  {listing.make} {listing.model}
                </h3>
                <p className="text-sm font-medium text-muted-foreground line-clamp-1 min-h-[1rem] mt-1">
                  {listing.trim || '\u00A0'}
                </p>
              </Link>
              <p className="text-lg font-semibold text-blue-600 whitespace-nowrap">
                {listing.price.toLocaleString()} AED
              </p>
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-2.5 text-sm">
              <span className="font-semibold text-sidebar-foreground/80">
                {listing.year}
              </span>
              
              {/* BLK Badge */}
              {listing.isBlkListing && (
                <>
                  <span className="text-sidebar-foreground/40">•</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-100 tracking-wider">
                    BLK
                  </span>
                </>
              )}
              
              <span className="text-sidebar-foreground/40">•</span>
              
              {/* Status */}
              <span
                className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  listing.lifecycleStatus === 'deleted' ? 'bg-muted text-muted-foreground'
                  : listing.lifecycleStatus === 'sold' ? 'bg-green-500/10 text-green-600'
                  : listing.lifecycleStatus === 'expired' ? 'bg-yellow-500/10 text-yellow-600'
                  : listing.lifecycleStatus === 'archived' && !isSuspended ? 'bg-muted text-muted-foreground'
                  : isSuspended || isRejected ? 'bg-red-500/10 text-red-600'
                  : listing.isPublic ? 'bg-green-500/10 text-green-600'
                  : isInReview ? 'bg-yellow-500/10 text-yellow-600'
                  : isDraft ? 'bg-muted text-muted-foreground'
                  : 'bg-muted text-muted-foreground'
                }`}
              >
                {statusLabel}
              </span>
              
              <span className="text-sidebar-foreground/40">•</span>
              
              {/* View Count */}
              <span className="inline-flex items-center gap-1 font-medium text-sidebar-foreground/60">
                <Eye className="w-3.5 h-3.5" />
                {listing.viewCount}
              </span>
              
              <span className="text-sidebar-foreground/40">•</span>
              
              {/* Favorite Count */}
              <span className="inline-flex items-center gap-1 font-medium text-sidebar-foreground/60">
                <Heart className="w-3.5 h-3.5" />
                {listing.favouriteCount}
              </span>
              
              {/* Expiry Date - Always show if available */}
              {expiresAt && (
                <>
                  <span className="text-sidebar-foreground/40">•</span>
                  <span className={`font-medium ${isExpiringSoon ? 'text-red-600' : 'text-sidebar-foreground/60'}`}>
                    Expires {expiresAt.toLocaleDateString()}
                    {msRemaining !== null && msRemaining > 0 && ` (${Math.ceil(msRemaining / (24 * 60 * 60 * 1000))}d)`}
                  </span>
                </>
              )}
            </div>

            {/* Warnings */}
            {(isSuspended && listing.suspensionReason) && (
              <p className="text-xs font-medium text-red-600">
                Suspended: {listing.suspensionReason}
              </p>
            )}
            {(listing.moderationStatus === 'rejected' && listing.rejectionReason) && (
              <p className="text-xs font-medium text-red-600">
                Rejected: {listing.rejectionReason}
              </p>
            )}
          </div>
        </div>

        {/* Actions Row - Bottom */}
        <div className="flex items-center justify-between px-5 pb-4 pt-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2">
            {/* View - only for public listings */}
            {listing.isPublic && (
              <Link href={`/listings/${listing.id}`}>
                <button className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent">
                  View
                </button>
              </Link>
            )}
            
            {/* Edit - only for non-suspended, non-deep-inventory */}
            {!isSuspended && !isDeepInventory && (
              <Link href={editHref}>
                <button className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent">
                  Edit
                </button>
              </Link>
            )}

            {/* Mark Sold */}
            {listing.isPublic && listing.lifecycleStatus === 'active' && (
              <button 
                onClick={() => onMarkSold(listing.id)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-green-600 hover:bg-green-500/10"
              >
                Mark Sold
              </button>
            )}
            
            {/* BLK Toggle - for work listings */}
            {onToggleBlk && listing.lifecycleStatus === 'active' && (
              listing.isBlkListing ? (
                <button
                  onClick={() => onToggleBlk(listing.id, true)}
                  disabled={isTogglingBlk}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTogglingBlk ? 'Updating...' : 'Remove BLK'}
                </button>
              ) : canPromoteToBlk && (
                <button
                  onClick={() => onToggleBlk(listing.id, false)}
                  disabled={isTogglingBlk}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTogglingBlk ? 'Updating...' : 'Promote to BLK'}
                </button>
              )
            )}

            {/* Extend buttons when expiring soon */}
            {isExpiringSoon && (
              <>
                <button 
                  onClick={() => onExtend(listing.id, 7)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  Extend 1w
                </button>
                <button 
                  onClick={() => onExtend(listing.id, 14)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  Extend 2w
                </button>
              </>
            )}

            {/* Archive/Unarchive */}
            {canArchiveToggle && (
              <button
                onClick={() => onArchive(listing.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  deleteConfirm === listing.id 
                    ? 'text-yellow-600 bg-yellow-500/10' 
                    : 'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                {deleteConfirm === listing.id
                  ? 'Confirm?'
                  : listing.lifecycleStatus === 'archived'
                  ? 'Unarchive'
                  : 'Archive'}
              </button>
            )}
            
            {/* Delete */}
            {canDelete && !isDeepInventory && (
              <button
                onClick={() => onDelete(listing.id)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-red-600 hover:bg-red-500/10"
              >
                Delete
              </button>
            )}
            
            {/* Suspended - Relist */}
            {isSuspended && (
              <Link href={newListingUrl}>
                <button className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-primary hover:bg-primary/10">
                  Relist Your Car
                </button>
              </Link>
            )}
          </div>
          
          {/* Updated Date - Right Side */}
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
            {listing.publishedAt 
              ? `Published ${new Date(listing.publishedAt).toLocaleDateString()}`
              : `Updated ${new Date(listing.updatedAt).toLocaleDateString()}`
            }
          </span>
        </div>
      </div>
    </div>
  );
}
