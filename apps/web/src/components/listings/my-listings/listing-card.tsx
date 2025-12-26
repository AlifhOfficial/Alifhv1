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
    <div className="rounded-xl border border-border p-6 hover:bg-secondary/10 transition-colors">
      <div className="flex gap-6">
        {/* Thumbnail */}
        <div className="w-48 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
          {listing.thumbnail ? (
            <img
              src={listing.thumbnail}
              alt={`${listing.year} ${listing.make} ${listing.model}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-xs">No image</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <Link
                href={`/listings/${listing.id}`}
                className="text-lg font-medium hover:text-primary transition-colors"
              >
                {listing.year} {listing.make} {listing.model}
                {listing.trim && ` ${listing.trim}`}
              </Link>
              
              {/* Status Badge */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex flex-col gap-1">
                  <span
                    className={`px-3 py-1 rounded-md text-xs font-medium w-fit ${badgeClassName}`}
                  >
                    {statusLabel}
                  </span>

                  {isSuspended && listing.suspensionReason && (
                    <p className="text-xs text-red-600">
                      Reason: {listing.suspensionReason}
                    </p>
                  )}

                  {listing.moderationStatus === 'rejected' && listing.rejectionReason && (
                    <p className="text-xs text-red-500">
                      Reason: {listing.rejectionReason}
                    </p>
                  )}

                  {expiresAt && (
                    <p className={`text-xs ${isExpiringSoon ? 'text-red-500' : 'text-muted-foreground'}`}>
                      Expires {expiresAt.toLocaleDateString()} at {expiresAt.toLocaleTimeString()}
                      {msRemaining !== null && msRemaining > 0 ? ` (${Math.ceil(msRemaining / (24 * 60 * 60 * 1000))}d left)` : ''}
                    </p>
                  )}
                </div>
                
                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {listing.viewCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5" />
                    {listing.favouriteCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="text-right">
              <p className="text-base font-medium text-foreground">
                {listing.price.toLocaleString()} AED
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {listing.publishedAt 
                  ? `Published ${new Date(listing.publishedAt).toLocaleDateString()}`
                  : `Updated ${new Date(listing.updatedAt).toLocaleDateString()}`
                }
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mt-4">
            <Link href={`/listings/${listing.id}`}>
              <button className="px-5 py-2 rounded-full border border-border hover:bg-secondary/10 text-sm transition-colors">
                View
              </button>
            </Link>
            
            {/* Suspended listings - show Relist option prominently */}
            {isSuspended && (
              <div className="flex items-center gap-3">
                <Link href={newListingUrl}>
                  <button className="px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors">
                    Relist Your Car
                  </button>
                </Link>
                <span className="text-xs text-muted-foreground">
                  Create a new listing to relist this vehicle
                </span>
              </div>
            )}
            
            {/* Edit - only for non-suspended, non-deep-inventory items */}
            {!isSuspended && !isDeepInventory && (
              <Link href={editHref}>
                <button className="px-5 py-2 rounded-full border border-border hover:bg-secondary/10 text-sm transition-colors">
                  Edit
                </button>
              </Link>
            )}

            {listing.lifecycleStatus === 'active' && (
              <button 
                onClick={() => onMarkSold(listing.id)}
                className="px-5 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm transition-colors"
              >
                Mark Sold
              </button>
            )}

            {isExpiringSoon && (
              <>
                <button 
                  onClick={() => onExtend(listing.id, 7)}
                  className="px-5 py-2 rounded-full border border-border hover:bg-secondary/10 text-sm transition-colors"
                >
                  Extend 1w
                </button>
                <button 
                  onClick={() => onExtend(listing.id, 14)}
                  className="px-5 py-2 rounded-full border border-border hover:bg-secondary/10 text-sm transition-colors"
                >
                  Extend 2w
                </button>
              </>
            )}

            {canArchiveToggle && (
              <button
                onClick={() => onArchive(listing.id)}
                className={`px-5 py-2 rounded-full border text-sm transition-colors ${
                  deleteConfirm === listing.id 
                    ? 'border-red-500 text-red-500' 
                    : 'border-border hover:bg-secondary/10'
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
                className="px-5 py-2 rounded-full border border-red-500 text-red-500 hover:bg-red-500/10 text-sm transition-colors"
              >
                Delete
              </button>
            )}
            
            {deleteConfirm === listing.id && (
              <button
                onClick={onCancelDelete}
                className="px-5 py-2 rounded-full border border-border hover:bg-secondary/10 text-sm transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
