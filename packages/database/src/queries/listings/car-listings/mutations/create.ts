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
  DEFAULT_LISTING_EXPIRY_DAYS,
  computeQiScore,
} from './helpers';
import { recordVinPublication, updateVinHistoryCurrentListing } from './vin-history';
import type { CreateCarListingInput } from './types';
import type { 
  ListingModerationStatus, 
  ListingLifecycleStatus 
} from '../../../../schema/listing-constants';

/**
 * Create a new car listing
 * Returns the created listing ID
 * 
 * Anti-abuse: If the same user reposts the same VIN, the originalPublishedAt
 * is preserved from the first publication to prevent "bump to top" abuse.
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
  
  // Determine originalPublishedAt based on VIN history (anti-abuse)
  // If the same user has previously published the same VIN, we inherit
  // the original publish date to prevent "bump to top" abuse.
  // Exception: if the cooldown period (24 days) has passed, user gets a fresh date.
  let originalPublishedAt: Date | null = null;
  let publishedAt: Date | null = null;
  
  if (shouldBePublicNow) {
    publishedAt = now;
    
    if (input.vin) {
      // Check VIN history - this will inherit originalPublishedAt if reposting
      const vinResult = await recordVinPublication({
        vin: input.vin,
        userId: input.userId,
        listingId,
        publishedAt: now,
      });
      originalPublishedAt = vinResult.originalPublishedAt;
      
      // Log repost detection for monitoring
      if (vinResult.isRepost) {
        if (vinResult.cooldownReset) {
          console.log(`[anti-abuse] VIN repost after cooldown: ${input.vin} by user ${input.userId}. Fresh date granted.`);
        } else {
          console.log(`[anti-abuse] VIN repost detected: ${input.vin} by user ${input.userId}. Using original date: ${originalPublishedAt.toISOString()}`);
        }
      }
    } else {
      // No VIN provided - use current timestamp
      originalPublishedAt = now;
    }
  }
  
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
    condition: input.condition ?? 'used',
    
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
    
    // Quality & Engagement - qiScore pre-computed for fast relevance sorting
    qiScore: computeQiScore({
      images: input.images ?? [],
      description: input.description ?? null,
      extras: input.extras ?? [],
      tags: input.tags ?? [],
      videoUrl: input.videoUrl ?? null,
      partnerVerified: false, // New listings start unverified
    }),
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
    isBlkListing: false,
    
    // Moderation timestamps
    lastEditedAt: now,
    submittedAt,
    approvedAt,
    lastModeratedAt,
    needsRemoderation,

    // Publishing & expiry (only when it becomes public)
    // publishedAt = current publish time (can be refreshed)
    // originalPublishedAt = first-ever publish time for this VIN (anti-abuse, used for sorting)
    publishedAt,
    originalPublishedAt,
    expiresAt: shouldBePublicNow ? addDays(now, DEFAULT_LISTING_EXPIRY_DAYS) : null,

    extensionCount: 0,
    extensionHistory: [],
    lastExtendedAt: null,
    deletedAt: null,
  } as const;

  await db.insert(carListing).values(insertData as any);

  // Update VIN history with current_listing_id now that the listing exists
  if (shouldBePublicNow && input.vin) {
    await updateVinHistoryCurrentListing({
      vin: input.vin,
      userId: input.userId,
      listingId,
    });
  }

  return listingId;
}
