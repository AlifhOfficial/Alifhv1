/**
 * Listing Card Component
 * Clean, readable design following profile-view typography patterns
 */

'use client';

import Link from 'next/link';
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
  const daysRemaining = msRemaining ? Math.ceil(msRemaining / (24 * 60 * 60 * 1000)) : null;
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

  // Status config with colors
  const getStatusConfig = () => {
    if (listing.lifecycleStatus === 'deleted') return { label: 'Deleted', bg: 'bg-muted', text: 'text-muted-foreground' };
    if (listing.lifecycleStatus === 'sold') return { label: 'Sold', bg: 'bg-green-500/10', text: 'text-green-600' };
    if (listing.lifecycleStatus === 'expired') return { label: 'Expired', bg: 'bg-amber-500/10', text: 'text-amber-600' };
    if (listing.lifecycleStatus === 'archived' && !isSuspended) return { label: 'Archived', bg: 'bg-muted', text: 'text-muted-foreground' };
    if (isSuspended) return { label: 'Suspended', bg: 'bg-red-500/10', text: 'text-red-600' };
    if (isRejected) return { label: 'Rejected', bg: 'bg-red-500/10', text: 'text-red-600' };
    if (listing.isPublic) return { label: 'Public', bg: 'bg-green-500/10', text: 'text-green-600' };
    if (isInReview) return { label: 'In Review', bg: 'bg-blue-500/10', text: 'text-blue-600' };
    if (isDraft) return { label: 'Draft', bg: 'bg-amber-500/10', text: 'text-amber-600' };
    if (isApproved) return { label: 'Approved', bg: 'bg-green-500/10', text: 'text-green-600' };
    return { label: 'Active', bg: 'bg-muted', text: 'text-muted-foreground' };
  };

  const status = getStatusConfig();

  return (
    <div className="group rounded-xl border border-border/40 bg-sidebar hover:border-border/60 transition-all">
      <div className="flex items-center gap-4 p-4">
        {/* Thumbnail */}
        <Link href={`/listings/${listing.id}`} className="flex-shrink-0">
          <div className="w-20 h-14 rounded-lg overflow-hidden bg-muted">
            {listing.thumbnail ? (
              <img
                src={listing.thumbnail}
                alt={`${listing.year} ${listing.make} ${listing.model}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-xs text-muted-foreground/30">No image</span>
              </div>
            )}
          </div>
        </Link>

        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <Link href={`/listings/${listing.id}`} className="block">
            <p className="text-[15px] font-bold tracking-tight text-foreground truncate hover:text-primary transition-colors">
              {listing.year} {listing.make} {listing.model}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {listing.trim && (
                <span className="text-sm text-muted-foreground/70 truncate">{listing.trim}</span>
              )}
              {listing.isBlkListing && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-zinc-900 text-white rounded">BLK</span>
              )}
            </div>
          </Link>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-4 flex-shrink-0">
          <div className="text-center">
            <p className="text-sm font-semibold text-muted-foreground/70">Views</p>
            <p className="text-[15px] font-bold text-foreground">{listing.viewCount}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-muted-foreground/70">Saves</p>
            <p className="text-[15px] font-bold text-foreground">{listing.favouriteCount}</p>
          </div>
        </div>

        {/* Price */}
        <div className="text-right flex-shrink-0">
          <p className="text-[15px] font-bold tracking-tight text-foreground">
            {listing.price.toLocaleString()}
          </p>
          <p className="text-sm font-semibold text-muted-foreground/70">AED</p>
        </div>

        {/* Status Badge */}
        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 ${status.bg} ${status.text}`}>
          {status.label}
        </span>
      </div>

      {/* Expiring Soon / Actions Bar */}
      {(isExpiringSoon || listing.lifecycleStatus === 'active') && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/40 bg-muted/20">
          {/* Left: Expiry info */}
          <div className="flex items-center gap-3">
            {isExpiringSoon ? (
              <span className="text-xs font-semibold text-amber-600">⚠ Expires in {daysRemaining}d</span>
            ) : expiresAt && listing.lifecycleStatus === 'active' ? (
              <span className="text-xs text-muted-foreground/70">{daysRemaining}d remaining</span>
            ) : null}
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Edit */}
            {!isSuspended && !isDeepInventory && (
              <Link href={editHref}>
                <button className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background transition-colors">
                  Edit
                </button>
              </Link>
            )}

            {/* Extend - When expiring soon */}
            {isExpiringSoon && (
              <button 
                onClick={() => onExtend(listing.id, 7)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-500/10 transition-colors"
              >
                Extend
              </button>
            )}

            {/* Mark Sold */}
            {listing.isPublic && listing.lifecycleStatus === 'active' && (
              <button 
                onClick={() => onMarkSold(listing.id)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-green-600 hover:bg-green-500/10 transition-colors"
              >
                Mark Sold
              </button>
            )}

            {/* BLK Toggle */}
            {onToggleBlk && listing.lifecycleStatus === 'active' && (
              listing.isBlkListing ? (
                <button
                  onClick={() => onToggleBlk(listing.id, true)}
                  disabled={isTogglingBlk}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:bg-zinc-500/10 transition-colors disabled:opacity-50"
                >
                  {isTogglingBlk ? '...' : 'Remove BLK'}
                </button>
              ) : canPromoteToBlk ? (
                <button
                  onClick={() => onToggleBlk(listing.id, false)}
                  disabled={isTogglingBlk}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:bg-zinc-500/10 transition-colors disabled:opacity-50"
                >
                  {isTogglingBlk ? '...' : 'Add BLK'}
                </button>
              ) : null
            )}

            {/* Archive/Unarchive */}
            {canArchiveToggle && (
              <button
                onClick={() => onArchive(listing.id)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
              >
                {listing.lifecycleStatus === 'archived' ? 'Restore' : 'Archive'}
              </button>
            )}

            {/* Delete */}
            {canDelete && !isDeepInventory && (
              <button
                onClick={() => onDelete(listing.id)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-500/10 transition-colors"
              >
                Delete
              </button>
            )}

            {/* Relist - For suspended */}
            {isSuspended && (
              <Link href={newListingUrl}>
                <button className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-primary hover:bg-primary/10 transition-colors">
                  Relist
                </button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Deep Inventory Actions (archived, sold, expired, etc.) */}
      {isDeepInventory && (
        <div className="flex items-center justify-end px-4 py-2.5 border-t border-border/40 bg-muted/20">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {canArchiveToggle && (
              <button
                onClick={() => onArchive(listing.id)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
              >
                Restore
              </button>
            )}
            {isSuspended && (
              <Link href={newListingUrl}>
                <button className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-primary hover:bg-primary/10 transition-colors">
                  Create New
                </button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
