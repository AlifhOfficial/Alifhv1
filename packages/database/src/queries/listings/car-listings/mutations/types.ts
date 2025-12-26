/**
 * Car Listing Mutations - Type Definitions
 * 
 * Shared types and interfaces for car listing mutations.
 * 
 * @module queries/listings/car-listings/mutations/types
 */

import type { TechnicalFeatures, SpecialNotes } from '../car-detailed-query';

// Re-export for convenience
export type { TechnicalFeatures, SpecialNotes };

export type ListingPostedByRole = 'user' | 'staff';
export type ListingModerationStatus = 'draft' | 'submitted' | 'pending_review' | 'approved' | 'rejected';
export type ListingLifecycleStatus = 'active' | 'archived' | 'sold' | 'expired' | 'deleted';

/**
 * Input data for creating a new car listing
 */
export interface CreateCarListingInput {
  // Required fields
  userId: string;
  postedByRole: ListingPostedByRole;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  specs: string; // 'gcc' | 'american' | 'european' | 'japanese' | 'canadian' | 'other' (lowercase!)
  steeringSide: string; // 'left' | 'right'
  emirate: string;
  
  // Optional basic info
  vin?: string;
  trim?: string;
  description?: string;
  currency?: string; // defaults to 'AED'
  isNegotiable?: boolean;
  
  // Optional specifications
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  engineSize?: string;
  engineType?: string;
  cylinders?: number;
  powerRange?: string;
  torque?: string;
  fuelEconomy?: string;
  doors?: string;
  seatingCapacity?: string;
  exteriorColor?: string;
  interiorColor?: string;
  
  // Moderation & Lifecycle
  moderationStatus?: ListingModerationStatus;
  lifecycleStatus?: ListingLifecycleStatus;

  // Export
  exportStatus?: string; // 'imported' | 'local' | 'unknown'
  warrantyType?: string;
  sellerType?: string; // 'dealer' | 'private' | 'partner'
  
  // Location
  city?: string;
  
  // Media
  thumbnail?: string;
  images?: string[];
  videoUrl?: string;
  
  // Features & Notes
  technicalFeatures?: TechnicalFeatures;
  extras?: string[];
  specialNotes?: SpecialNotes;
  badges?: string[];
  tags?: string[];
  
  // Partner (if listing is from partner)
  partnerId?: string;
}

/**
 * Input data for updating an existing car listing
 * All fields are optional for partial updates
 */
export interface UpdateCarListingInput {
  // Basic info
  make?: string;
  model?: string;
  year?: number;
  trim?: string;
  description?: string;
  vin?: string;
  
  // Pricing
  price?: number;
  currency?: string;
  isNegotiable?: boolean;
  
  // Specifications
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  specs?: string;
  steeringSide?: string;
  engineSize?: string;
  engineType?: string;
  cylinders?: number;
  powerRange?: string;
  torque?: string;
  fuelEconomy?: string;
  doors?: string;
  seatingCapacity?: string;
  exteriorColor?: string;
  interiorColor?: string;
  mileage?: number;
  
  // Moderation & Lifecycle
  moderationStatus?: ListingModerationStatus;
  lifecycleStatus?: ListingLifecycleStatus;

  // Export
  exportStatus?: string;
  warrantyType?: string;
  sellerType?: string;
  
  // Location
  emirate?: string;
  city?: string;
  
  // Media
  thumbnail?: string;
  images?: string[];
  videoUrl?: string;
  
  // Features & Notes
  technicalFeatures?: TechnicalFeatures;
  extras?: string[];
  specialNotes?: SpecialNotes;
  badges?: string[];
  tags?: string[];

  // Moderation/system fields (staff/admin controlled)
  submittedAt?: Date | null;
  approvedAt?: Date | null;
  lastModeratedAt?: Date | null;
  needsRemoderation?: boolean;
  publishedAt?: Date | null;
  expiresAt?: Date | null;
  deletedAt?: Date | null;
  rejectionReason?: string | null;
}

/**
 * Fields that trigger re-moderation when edited on user-posted listings.
 * Staff-posted listings can edit these without re-moderation.
 */
export const CONTENT_EDIT_KEYS: Array<keyof UpdateCarListingInput> = [
  'make',
  'model',
  'year',
  'trim',
  'description',
  'vin',
  'price',
  'currency',
  'isNegotiable',
  'bodyType',
  'fuelType',
  'transmission',
  'specs',
  'steeringSide',
  'engineSize',
  'engineType',
  'cylinders',
  'powerRange',
  'torque',
  'fuelEconomy',
  'doors',
  'seatingCapacity',
  'exteriorColor',
  'interiorColor',
  'mileage',
  'exportStatus',
  'warrantyType',
  'sellerType',
  'emirate',
  'city',
  'thumbnail',
  'images',
  'videoUrl',
  'technicalFeatures',
  'extras',
  'specialNotes',
  'badges',
  'tags',
];

/**
 * Standard listing summary returned by query functions
 */
export interface ListingSummary {
  id: string;
  make: string;
  model: string;
  year: number;
  trim: string | null;
  price: number;
  postedByRole: ListingPostedByRole;
  moderationStatus: ListingModerationStatus;
  lifecycleStatus: ListingLifecycleStatus;
  isPublic: boolean;
  rejectionReason: string | null;
  suspensionReason: string | null;
  suspendedAt: string | null;
  thumbnail: string | null;
  viewCount: number;
  favouriteCount: number;
  partnerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  expiresAt: Date | null;
  extensionCount: number;
  lastExtendedAt: Date | null;
}

/**
 * Extended listing summary with poster info (for partner listings)
 */
export interface ListingSummaryWithPoster extends ListingSummary {
  postedByUserId: string | null;
  postedByDisplayName: string | null;
  postedByEmail: string | null;
  postedByAvatar: string | null;
}

/**
 * Listing statistics
 */
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
}

/**
 * Options for querying user listings
 */
export interface GetListingsByUserOptions {
  status?: string;
  moderationStatus?: ListingModerationStatus;
  lifecycleStatus?: ListingLifecycleStatus;
  q?: string;
  sort?: 'newest' | 'oldest' | 'updated' | 'expiring';
  limit?: number;
  offset?: number;
  listingType?: 'personal' | 'work';
}

/**
 * Options for querying partner listings
 */
export interface GetListingsByPartnerOptions {
  status?: string;
  moderationStatus?: ListingModerationStatus;
  lifecycleStatus?: ListingLifecycleStatus;
  userId?: string;
  q?: string;
  sort?: 'newest' | 'oldest' | 'updated' | 'expiring';
  limit?: number;
  offset?: number;
}
