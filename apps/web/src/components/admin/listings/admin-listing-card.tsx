/**
 * Admin Listing Card Component
 */

'use client';

import Link from 'next/link';
import { Eye, Heart, User, Building2, Clock, Calendar, AlertTriangle, Zap, Bot } from 'lucide-react';
import { getAppThumbUrl } from '@/utils/storage';

interface Listing {
  id: string;
  make: string;
  model: string;
  year: number;
  trim?: string | null;
  price: number;
  postedByRole: 'user' | 'staff';
  moderationStatus: 'draft' | 'submitted' | 'pending_review' | 'approved' | 'rejected';
  lifecycleStatus: 'active' | 'archived' | 'sold' | 'expired' | 'deleted' | 'suspended';
  isPublic: boolean;
  userId: string;
  userName?: string;
  userEmail?: string;
  partnerId?: string | null;
  partnerName?: string | null;
  thumbnail?: string | null;
  viewCount: number;
  favouriteCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  expiresAt?: string | null;
  suspensionReason?: string | null;
  rejectionReason?: string | null;
  emirate: string;
  mileage: number;
  // AI moderation data
  specialNotes?: {
    aiModeration?: {
      decision: 'approve' | 'flag' | 'reject';
      confidence: number;
      flags: Array<{ code: string; severity: string; message: string }>;
      reasoning: string;
      autoApproved?: boolean;
      autoRejected?: boolean;
      processedAt?: string;
      model?: string;
    };
  };
}

interface AdminListingCardProps {
  listing: Listing;
  onApprove: () => void;
  onReject: () => void;
  onSuspend: () => void;
  onDelete: () => void;
}

export function AdminListingCard({ listing, onApprove, onReject, onSuspend, onDelete }: AdminListingCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isPending =
    listing.lifecycleStatus === 'active' &&
    (listing.moderationStatus === 'submitted' || listing.moderationStatus === 'pending_review');
  const isUserListing = !listing.partnerId;
  const isArchived = listing.lifecycleStatus === 'archived';
  const isSold = listing.lifecycleStatus === 'sold';
  const isExpired = listing.lifecycleStatus === 'expired';
  const isDeleted = listing.lifecycleStatus === 'deleted';
  const isSuspended = listing.lifecycleStatus === 'suspended';
  
  // Deep inventory = any non-active lifecycle status
  const isDeepInventory = isArchived || isSold || isExpired || isDeleted || isSuspended;
  
  // AI moderation info
  const aiModeration = listing.specialNotes?.aiModeration;
  const isAIModerated = !!aiModeration;
  const isAutoApproved = aiModeration?.autoApproved === true;
  const isAutoRejected = aiModeration?.autoRejected === true;

  // Status label with clear priority hierarchy
  const getStatusLabel = (): { label: string; className: string } => {
    // Lifecycle status takes priority for non-active items
    if (isSuspended) return { label: 'Suspended', className: 'bg-warning-muted text-warning' };
    if (isDeleted) return { label: 'Deleted', className: 'bg-destructive-muted text-destructive' };
    if (isExpired) return { label: 'Expired', className: 'bg-secondary/50 text-muted-foreground' };
    if (isSold) return { label: 'Sold', className: 'bg-success-muted text-success' };
    if (isArchived) return { label: 'Archived', className: 'bg-secondary/50 text-muted-foreground' };
    
    // For active lifecycle, check moderation status
    if (listing.isPublic) return { label: 'Public', className: 'bg-success-muted text-success' };
    if (isPending) return { label: 'In Review', className: 'bg-primary-muted text-primary' };
    if (listing.moderationStatus === 'draft') return { label: 'Draft', className: 'bg-warning-muted text-warning' };
    if (listing.moderationStatus === 'rejected') return { label: 'Rejected', className: 'bg-destructive-muted text-destructive' };
    
    return { label: listing.moderationStatus, className: 'bg-secondary/50 text-muted-foreground' };
  };

  const status = getStatusLabel();

  return (
    <div className={`rounded-xl border p-6 transition-colors ${
      isDeepInventory ? 'border-border/50 bg-muted/10 opacity-75' : 'border-border bg-muted/20 hover:bg-muted/30'
    }`}>
      <div className="flex gap-6">
        {/* Thumbnail */}
        <div className="w-40 h-28 bg-secondary/50 rounded-xl overflow-hidden flex-shrink-0">
          {getAppThumbUrl(listing.thumbnail) ? (
            <img
              src={getAppThumbUrl(listing.thumbnail)!}
              alt={`${listing.year} ${listing.make} ${listing.model}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-caption1">No image</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <Link
                href={`/listings/${listing.id}`}
                target="_blank"
                className="text-subhead hover:text-primary transition-colors"
              >
                {listing.year} {listing.make} {listing.model}
                {listing.trim && ` ${listing.trim}`}
              </Link>
              
              <div className="flex items-center gap-2 mt-2">
                {/* Status Badge */}
                <span className={`px-3 py-1 rounded-md text-caption1 ${status.className}`}>
                  {status.label}
                </span>

                {/* AI Moderated Badge */}
                {isAutoApproved && (
                  <span className="px-3 py-1 rounded-md text-caption1 bg-emerald-500/10 text-emerald-500 flex items-center gap-1.5">
                    <Bot className="w-3 h-3" />
                    AI Auto-Approved
                  </span>
                )}
                {isAutoRejected && (
                  <span className="px-3 py-1 rounded-md text-caption1 bg-destructive-muted text-destructive flex items-center gap-1.5">
                    <Bot className="w-3 h-3" />
                    AI Auto-Rejected
                  </span>
                )}
                {isAIModerated && !isAutoApproved && !isAutoRejected && (
                  <span className="px-3 py-1 rounded-md text-caption1 bg-purple-500/10 text-purple-500 flex items-center gap-1.5">
                    <Zap className="w-3 h-3" />
                    AI Reviewed
                  </span>
                )}

                {/* Listing Type Badge */}
                <span
                  className={`px-3 py-1 rounded-md text-caption1 ${
                    isUserListing
                      ? 'bg-secondary/50 text-muted-foreground'
                      : 'bg-primary-muted text-primary'
                  }`}
                >
                  {isUserListing ? (
                    'User'
                  ) : (
                    'Partner'
                  )}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="text-right">
              <p className="text-callout text-foreground">
                {formatPrice(listing.price)}
              </p>
              <p className="text-caption1 text-muted-foreground mt-1">
                {listing.emirate} • {(listing.mileage / 1000).toFixed(0)}k km
              </p>
            </div>
          </div>

          {/* User/Partner Info & Stats Row */}
          <div className="flex items-center justify-between text-caption1 text-muted-foreground">
            <div className="flex items-center gap-4">
              {/* Owner Info */}
              <div className="flex items-center gap-1.5">
                {isUserListing ? (
                  <>
                    <User className="w-3.5 h-3.5" />
                    <span>{listing.userName || 'Unknown'}</span>
                  </>
                ) : (
                  <>
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{listing.partnerName || 'Unknown'}</span>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3">
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

            {/* Date */}
            <div className="flex items-center gap-1">
              {listing.publishedAt ? (
                <>
                  <Calendar className="w-3.5 h-3.5" />
                  Published {formatDate(listing.publishedAt)}
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  Created {formatDate(listing.createdAt)}
                </>
              )}
            </div>
          </div>
          
          {/* Suspension/Rejection Reason */}
          {(isSuspended && listing.suspensionReason) && (
            <div className="flex items-start gap-2 p-3 border border-yellow-500/20 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-caption1 text-warning">Suspension Reason</p>
                <p className="text-caption1 text-muted-foreground mt-0.5">{listing.suspensionReason}</p>
              </div>
            </div>
          )}
          {(listing.moderationStatus === 'rejected' && listing.rejectionReason) && (
            <div className="flex items-start gap-2 p-3 border border-destructive/20 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-caption1 text-destructive">Rejection Reason</p>
                <p className="text-caption1 text-muted-foreground mt-0.5">{listing.rejectionReason}</p>
              </div>
            </div>
          )}
          
          {/* AI Moderation Details */}
          {aiModeration && (
            <div className="flex items-start gap-2 p-3 border border-purple-500/20 rounded-xl bg-purple-500/5">
              <Bot className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-caption1 text-purple-500">AI Moderation</p>
                  <span className="text-caption1 text-muted-foreground">
                    {(aiModeration.confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>
                <p className="text-caption1 text-muted-foreground">{aiModeration.reasoning}</p>
                {aiModeration.flags && aiModeration.flags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {aiModeration.flags.map((flag, i) => (
                      <span 
                        key={i} 
                        className={`px-2 py-0.5 rounded text-caption1 ${
                          flag.severity === 'high' 
                            ? 'bg-destructive-muted text-destructive' 
                            : flag.severity === 'medium'
                            ? 'bg-warning-muted text-warning'
                            : 'bg-primary-muted text-primary'
                        }`}
                      >
                        {flag.code}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Link 
              href={`/listings/${listing.id}`} 
              target="_blank"
              className="px-4 py-2 rounded-full border border-border hover:bg-secondary/10 text-caption1 transition-colors"
            >
              View
            </Link>

            {/* Actions for pending review items */}
            {isPending && (
              <>
                <button 
                  onClick={onApprove}
                  className="px-4 py-2 rounded-full bg-success hover:bg-success/90 text-white text-caption1 transition-colors"
                >
                  Approve
                </button>
                <button 
                  onClick={onReject}
                  className="px-4 py-2 rounded-full border border-border hover:bg-secondary/10 text-caption1 transition-colors"
                >
                  Reject
                </button>
              </>
            )}

            {/* Suspend available for active, non-deep-inventory items */}
            {!isDeepInventory && !isPending && (
              <button 
                onClick={onSuspend} 
                className="px-4 py-2 rounded-full border border-yellow-500/40 text-warning hover:bg-warning-muted text-caption1 transition-colors"
              >
                Suspend
              </button>
            )}

            {/* Delete available for non-deleted items */}
            {!isDeleted && (
              <button 
                onClick={onDelete} 
                className="px-4 py-2 rounded-full border border-destructive/40 text-destructive hover:bg-destructive-muted text-caption1 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
