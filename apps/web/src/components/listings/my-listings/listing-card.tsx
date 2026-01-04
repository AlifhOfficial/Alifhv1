/**
 * Listing Card Component
 */

'use client';

import Link from 'next/link';
import { Eye, Heart } from 'lucide-react';
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
    <div className="rounded-xl border border-border/40 p-5 bg-sidebar hover:bg-muted/30 transition-colors">
      <div className="flex items-start justify-between gap-6">
        {/* Main Content */}
        <div className="flex items-start gap-5 flex-1 min-w-0">
          {/* Thumbnail */}
          <div className="w-36 h-28 bg-muted/40 rounded-lg overflow-hidden flex-shrink-0 border border-border/40">
            {listing.thumbnail ? (
              <img
                src={listing.thumbnail}
                alt={`${listing.year} ${listing.make} ${listing.model}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/70">
                <span className="text-sm">No image</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <Link
                href={`/listings/${listing.id}`}
                className="text-lg font-semibold tracking-tight hover:text-primary transition-colors line-clamp-1"
              >
                {listing.year} {listing.make} {listing.model}
                {listing.trim && ` ${listing.trim}`}
              </Link>
              <p className="text-[15px] font-medium text-muted-foreground/70 mt-1.5">
                {listing.price?.toLocaleString() || '0'} AED
              </p>
            </div>
            {/* Status & Info */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* BLK Badge */}
              {listing.isBlkListing && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-100 tracking-wider">
                  BLK
                </span>
              )}
              <span
                className={`px-3 py-1.5 rounded-full text-sm font-semibold tracking-tight w-fit ${
                  listing.lifecycleStatus === 'deleted' ? 'bg-muted text-muted-foreground border border-border/40'
                  : listing.lifecycleStatus === 'sold' ? 'bg-green-500/10 text-green-500'
                  : listing.lifecycleStatus === 'expired' ? 'bg-yellow-500/10 text-yellow-500'
                  : listing.lifecycleStatus === 'archived' && !isSuspended ? 'bg-muted text-muted-foreground border border-border/40'
                  : isSuspended || isRejected ? 'bg-red-500/10 text-red-500'
                  : listing.isPublic ? 'bg-green-500/10 text-green-500'
                  : isInReview ? 'bg-yellow-500/10 text-yellow-500'
                  : isDraft ? 'bg-muted text-muted-foreground border border-border/40'
                  : 'bg-muted text-muted-foreground border border-border/40'
                }`}
              >
                {statusLabel}
              </span>
              
              {/* Stats */}
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground/70">
                <Eye className="w-4 h-4" />
                {listing.viewCount}
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground/70">
                <Heart className="w-4 h-4" />
                {listing.favouriteCount}
              </span>
            </div>

            {/* Additional Info - Warnings & Expiry */}
            {(isSuspended && listing.suspensionReason) && (
              <p className="text-[15px] font-medium text-red-500">
                Suspended: {listing.suspensionReason}
              </p>
            )}

            {(listing.moderationStatus === 'rejected' && listing.rejectionReason) && (
              <p className="text-[15px] font-medium text-red-500">
                Rejected: {listing.rejectionReason}
              </p>
            )}

            {expiresAt && (
              <p className={`text-sm font-medium ${isExpiringSoon ? 'text-yellow-500' : 'text-muted-foreground/70'}`}>
                Expires {expiresAt.toLocaleDateString()}
                {msRemaining !== null && msRemaining > 0 ? ` (${Math.ceil(msRemaining / (24 * 60 * 60 * 1000))}d left)` : ''}
              </p>
            )}
          </div>
        </div>

        {/* Price & Date - Right Side */}
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-foreground whitespace-nowrap">
            {listing.price.toLocaleString()} AED
          </p>
          <p className="text-sm font-medium text-muted-foreground/70 mt-1.5 whitespace-nowrap">
            {listing.publishedAt 
              ? `Published ${new Date(listing.publishedAt).toLocaleDateString()}`
              : `Updated ${new Date(listing.updatedAt).toLocaleDateString()}`
            }
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-border/40">
        {/* View - only show for public listings (visible on marketplace) */}
        {listing.isPublic && (
          <Link href={`/listings/${listing.id}`}>
            <button className="px-5 py-2.5 rounded-full border border-border/40 hover:bg-muted/40 text-sm font-semibold tracking-tight transition-colors">
              View
            </button>
          </Link>
        )}
        
        {/* Suspended listings - show Relist option prominently */}
        {isSuspended && (
          <Link href={newListingUrl}>
            <button className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold tracking-tight transition-colors">
              Relist Your Car
            </button>
          </Link>
        )}
        
        {/* Edit - only for non-suspended, non-deep-inventory items */}
        {!isSuspended && !isDeepInventory && (
          <Link href={editHref}>
            <button className="px-5 py-2.5 rounded-full border border-border/40 hover:bg-muted/40 text-sm font-semibold tracking-tight transition-colors">
              Edit
            </button>
          </Link>
        )}

        {/* Mark Sold - only show for public listings (makes sense only when car is listed) */}
        {listing.isPublic && listing.lifecycleStatus === 'active' && (
          <button 
            onClick={() => onMarkSold(listing.id)}
            className="px-5 py-2.5 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm font-semibold tracking-tight transition-colors"
          >
            Mark Sold
          </button>
        )}
        
        {/* BLK Toggle Button - Only for active work listings */}
        {onToggleBlk && listing.lifecycleStatus === 'active' && (
          listing.isBlkListing ? (
            <button
              onClick={() => onToggleBlk(listing.id, true)}
              disabled={isTogglingBlk}
              className="px-5 py-2.5 rounded-full bg-zinc-800 text-zinc-100 text-sm font-semibold tracking-tight transition-colors hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTogglingBlk ? 'Updating...' : 'Remove BLK'}
            </button>
          ) : canPromoteToBlk && (
            <button
              onClick={() => onToggleBlk(listing.id, false)}
              disabled={isTogglingBlk}
              className="px-5 py-2.5 rounded-full border border-zinc-500/50 text-zinc-400 text-sm font-semibold tracking-tight transition-colors hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTogglingBlk ? 'Updating...' : 'Promote to BLK'}
            </button>
          )
        )}

        {isExpiringSoon && (
          <>
            <button 
              onClick={() => onExtend(listing.id, 7)}
              className="px-5 py-2.5 rounded-full border border-border/40 hover:bg-muted/40 text-sm font-semibold tracking-tight transition-colors"
            >
              Extend 1w
            </button>
            <button 
              onClick={() => onExtend(listing.id, 14)}
              className="px-5 py-2.5 rounded-full border border-border/40 hover:bg-muted/40 text-sm font-semibold tracking-tight transition-colors"
            >
              Extend 2w
            </button>
          </>
        )}

        {canArchiveToggle && (
          <button
            onClick={() => onArchive(listing.id)}
            className={`px-5 py-2.5 rounded-full border text-sm font-semibold tracking-tight transition-colors ${
              deleteConfirm === listing.id 
                ? 'border-yellow-500/40 text-yellow-500 bg-yellow-500/10' 
                : 'border-border/40 hover:bg-muted/40'
            }`}
          >
            {deleteConfirm === listing.id
              ? 'Confirm?'
              : listing.lifecycleStatus === 'archived'
              ? 'Unarchive'
              : 'Archive'}
          </button>
        )}
        
        {/* Soft delete - only for non-deep-inventory items */}
        {canDelete && !isDeepInventory && (
          <button
            onClick={() => onDelete(listing.id)}
            className="px-5 py-2.5 rounded-full border border-red-500/40 text-red-500 hover:bg-red-500/10 text-sm font-medium tracking-tight transition-colors"
          >
            Delete
          </button>
        )}
        
        {deleteConfirm === listing.id && (
          <button
            onClick={onCancelDelete}
            className="px-5 py-2.5 rounded-full border border-border/40 hover:bg-secondary/50 text-sm font-medium tracking-tight transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
