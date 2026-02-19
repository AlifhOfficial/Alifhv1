/**
 * Car Listing Mutations - Type Definitions
 * 
 * Shared types and interfaces for car listing mutations.
 * 
 * @module queries/listings/car-listings/mutations/types
 */

import type { TechnicalFeatures, SpecialNotes } from '../car-detailed-query';
import type {
  ListingPostedByRole,
  ListingModerationStatus,
  ListingLifecycleStatus,
} from '../../../../schema/listing-constants';

// Re-export for convenience
export type { TechnicalFeatures, SpecialNotes };

// Note: ListingPostedByRole, ListingModerationStatus, ListingLifecycleStatus
// are imported from listing-constants but NOT re-exported to avoid conflicts.
// Import directly from '@alifh/database' or listing-constants if needed.

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
  specs: string; // 'gcc' | 'american' | 'european' | 'japanese' | 'chinese' | 'korean' | 'canadian' | 'other'
  steeringSide: string; // 'left' | 'right'
  emirate: string;
  
  // Optional basic info
  vin?: string;
  trim?: string;
  description?: string;
  condition?: 'new' | 'used'; // defaults to 'used'
  currency?: string; // defaults to 'AED'
  isNegotiable?: boolean;
  
  // Optional specifications
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  engineSize?: string; // Simplified: 'under_1.5L' | '1.5L_2.0L' | ... | 'electric'
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
  exportStatus?: string; // 'local_only' | 'gcc' | 'international' | 'restricted'
  warrantyType?: string;
  sellerType?: string; // 'dealer' | 'private' - derived from postedByRole
  
  // Location
  city?: string;
  
  // Media
  thumbnail?: string;
  images?: string[];
  videoUrl?: string;
  
  // Features & Notes
  technicalFeatures?: TechnicalFeatures;
  extras?: string[];             // Vehicle features from predefined list
  tags?: string[];               // Predefined tags (max 3)
  specialNotes?: SpecialNotes;   // Owner remarks + moderation meta
  badges?: string[];             // System-assigned badges
  
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
  condition?: 'new' | 'used';
  
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
  sellerType?: string; // 'dealer' | 'private'
  
  // Location
  emirate?: string;
  city?: string;
  
  // Media
  thumbnail?: string;
  images?: string[];
  videoUrl?: string;
  
  // Features & Notes
  technicalFeatures?: TechnicalFeatures;
  extras?: string[];             // Vehicle features from predefined list
  tags?: string[];               // Predefined tags (max 3)
  specialNotes?: SpecialNotes;   // Owner remarks + moderation meta
  badges?: string[];             // System-assigned badges

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
 * 
 * MAJOR edits: Only free-form content and significant pricing changes.
 * 
 * Fields that DON'T trigger re-moderation (constrained/validated):
 * - make, model, year, trim, vin — fixed dropdown values
 * - images, thumbnail, videoUrl — media (validated on upload)
 * - bodyType, fuelType, transmission, specs — fixed dropdowns
 * - All other spec fields
 * 
 * Why this is safe:
 * - Dropdown values are constrained to our constants
 * - Images go through upload validation
 * - Only free text (description) can contain spam/scams
 */
export const MAJOR_CONTENT_EDIT_KEYS: Array<keyof UpdateCarListingInput> = [
  // Free-form text that could contain scams/spam
  'description',
  // Significant price changes could indicate bait-and-switch
  'price',
];

/**
 * Minor edit fields that do NOT trigger re-moderation.
 * These are constrained values (dropdowns), validated formats, or media
 * that goes through upload validation.
 */
export const MINOR_CONTENT_EDIT_KEYS: Array<keyof UpdateCarListingInput> = [
  // Core identity - constrained dropdown values
  'make',
  'model',
  'year',
  'trim',
  'vin',
  'condition',
  // Media - validated on upload
  'images',
  'thumbnail',
  'videoUrl',
  // Pricing metadata
  'currency',
  'isNegotiable',
  // Specs - all constrained dropdowns
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
  'technicalFeatures',
  'extras',
  'specialNotes',
  'badges',
  'tags',
];

/**
 * All content edit keys (union of major and minor)
 * @deprecated Use MAJOR_CONTENT_EDIT_KEYS for re-moderation checks
 */
export const CONTENT_EDIT_KEYS: Array<keyof UpdateCarListingInput> = [
  ...MAJOR_CONTENT_EDIT_KEYS,
  ...MINOR_CONTENT_EDIT_KEYS,
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
  isBlkListing: boolean;
  rejectionReason: string | null;
  suspensionReason: string | null;
  suspendedAt: string | null;
  /** AI moderation info for pending review listings */
  aiModeration?: {
    reasoning?: string;
    flags?: string[];
    confidence?: number;
  } | null;
  thumbnail: string | null;
  viewCount: number;
  impressionCount: number;
  favouriteCount: number;
  superlikeCount: number;
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
