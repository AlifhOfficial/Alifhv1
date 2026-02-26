/**
 * My Listings Types
 */

export interface ListingData {
  id: string;
  make: string;
  model: string;
  year: number;
  trim: string | null;
  price: number;
  postedByRole: 'user' | 'staff';
  moderationStatus: 'draft' | 'submitted' | 'pending_review' | 'approved' | 'rejected';
  lifecycleStatus: 'active' | 'archived' | 'sold' | 'expired' | 'deleted';
  isPublic: boolean;
  isBlkListing?: boolean;
  rejectionReason?: string | null;
  suspensionReason?: string | null;
  suspendedAt?: string | null;
  /** AI moderation info for pending review listings */
  aiModeration?: {
    reasoning?: string;
    flags?: Array<string | { code: string; severity?: string; message?: string }>;
    confidence?: number;
  } | null;
  expiresAt?: Date | string | null;
  extensionCount?: number;
  lastExtendedAt?: Date | string | null;
  thumbnail: string | null;
  viewCount: number;
  impressionCount: number;
  favouriteCount: number;
  superlikeCount: number;
  partnerId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}

export type ListingType = 'personal' | 'work';

export type ListingsTab =
  | 'active'
  | 'public'
  | 'in_review'
  | 'draft'
  | 'rejected'
  | 'deep_inventory';

export type DeepInventoryFilter = 'all' | 'archived' | 'suspended' | 'sold' | 'expired' | 'deleted';

export interface ListingStats {
  all: number;
  active: number;
  public: number;
  inReview: number;
  draft: number;
  rejected: number;
  archived: number;
  suspended: number;
  sold: number;
  expired: number;
  deleted: number;
  deepInventory: number; // archived + suspended + sold + expired + deleted
}

export type ListingsSort = 'newest' | 'oldest' | 'updated' | 'expiring';
