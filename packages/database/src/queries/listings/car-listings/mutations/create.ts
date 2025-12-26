/**
 * Car Listing - Create Operations
 * 
 * Functions for creating new car listings.
 * 
 * @module queries/listings/car-listings/mutations/create
 */

import { db } from '../../../../dbclient';
import { carListing } from '../../../../schema/listing';
import { 
  makeListingId, 
  addDays, 
  DEFAULT_LISTING_EXPIRY_DAYS 
} from './helpers';
import type { 
  CreateCarListingInput, 
  ListingModerationStatus, 
  ListingLifecycleStatus 
} from './types';

/**
 * Create a new car listing
 * Returns the created listing ID
 */
export async function createCarListing(input: CreateCarListingInput): Promise<string> {
  const listingId = makeListingId();
  const now = new Date();

  const moderationStatus: ListingModerationStatus = input.moderationStatus ?? 'draft';
  const lifecycleStatus: ListingLifecycleStatus = input.lifecycleStatus ?? 'active';

  // User-posted listings can never self-approve or self-reject.
  if (input.postedByRole === 'user' && (moderationStatus === 'approved' || moderationStatus === 'rejected')) {
    throw new Error('User listings cannot be approved or rejected without moderation');
  }

  const shouldBePublicNow = moderationStatus === 'approved' && lifecycleStatus === 'active';
  const submittedAt =
    moderationStatus === 'submitted' || moderationStatus === 'pending_review' ? now : null;
  const approvedAt = moderationStatus === 'approved' ? now : null;
  const lastModeratedAt = moderationStatus === 'draft' ? null : now;
  const needsRemoderation = moderationStatus === 'submitted' || moderationStatus === 'pending_review';
  
  const insertData = {
    // Core identification
    id: listingId,
    userId: input.userId,
    vin: input.vin ?? null,
    slug: null, // Will be generated later if needed
    postedByStaffId: input.postedByRole === 'staff' ? input.userId : null,
    postedByRole: input.postedByRole,
    moderationStatus,
    lifecycleStatus,
    
    // Basic info
    make: input.make,
    model: input.model,
    year: input.year,
    trim: input.trim ?? null,
    description: input.description ?? null,
    
    // Pricing
    price: input.price,
    currency: input.currency ?? 'AED',
    isNegotiable: input.isNegotiable ?? false,
    
    // AI fields - will be calculated later
    aiEstimatedPrice: null,
    aiPriceMin: null,
    aiPriceMax: null,
    aiConfidenceScore: null,
    fairValue: null,
    estimateMin: null,
    estimateMax: null,
    priceTrend: null,
    
    // Quality & Engagement - start at 0
    qiScore: null,
    viewCount: 0,
    favouriteCount: 0,
    superlikeCount: 0,
    heatScore: 0,
    
    // Specifications
    bodyType: input.bodyType ?? null,
    fuelType: input.fuelType ?? null,
    transmission: input.transmission ?? null,
    specs: input.specs,
    steeringSide: input.steeringSide,
    engineSize: input.engineSize ?? null,
    engineType: input.engineType ?? null,
    cylinders: input.cylinders ?? null,
    powerRange: input.powerRange ?? null,
    torque: input.torque ?? null,
    fuelEconomy: input.fuelEconomy ?? null,
    doors: input.doors ?? null,
    seatingCapacity: input.seatingCapacity ?? null,
    exteriorColor: input.exteriorColor ?? null,
    interiorColor: input.interiorColor ?? null,
    mileage: input.mileage,
    
    // Export
    exportStatus: input.exportStatus ?? 'local_only',
    warrantyType: input.warrantyType ?? null,
    sellerType: input.sellerType ?? 'private',
    isConsignment: false,
    
    // Location
    emirate: input.emirate,
    city: input.city ?? null,
    
    // Media
    thumbnail: input.thumbnail ?? null,
    images: input.images ?? [],
    videoUrl: input.videoUrl ?? null,
    
    // Features & Notes
    technicalFeatures: input.technicalFeatures ?? {},
    extras: input.extras ?? [],
    specialNotes: input.specialNotes ?? {},
    badges: input.badges ?? [],
    tags: input.tags ?? [],
    
    // Partner info
    partnerId: input.partnerId ?? null,
    partnerBrandName: null, // Will be denormalized later
    partnerVerified: false,
    isBlackMember: false,
    
    // Moderation timestamps
    lastEditedAt: now,
    submittedAt,
    approvedAt,
    lastModeratedAt,
    needsRemoderation,

    // Publishing & expiry (only when it becomes public)
    publishedAt: shouldBePublicNow ? now : null,
    expiresAt: shouldBePublicNow ? addDays(now, DEFAULT_LISTING_EXPIRY_DAYS) : null,

    extensionCount: 0,
    extensionHistory: [],
    lastExtendedAt: null,
    deletedAt: null,
  } as const;

  await db.insert(carListing).values(insertData as any);

  return listingId;
}
