import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  doublePrecision,
  jsonb,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { user } from './auth';
import { partner } from './partner';
import { ENGINE_SIZE_VALUES, SPECS_TYPE_VALUES } from './listing-constants';

export const listingModerationStatusEnum = pgEnum('listing_moderation_status', [
  'draft',
  'submitted',
  'pending_review',
  'approved',
  'rejected',
]);

export const listingLifecycleStatusEnum = pgEnum('listing_lifecycle_status', [
  'active',
  'archived',
  'sold',
  'expired',
  'deleted',
]);

/**
 * Posted by role - determines seller type automatically:
 * - 'user' = private seller
 * - 'staff' = dealer (partner)
 */
export const listingPostedByRoleEnum = pgEnum('listing_posted_by_role', [
  'user',   // Private seller
  'staff',  // Dealer (partner staff)
]);

/**
 * Seller type - derived from postedByRole but kept for backward compatibility
 * - 'private' = user posting (postedByRole: 'user')
 * - 'dealer' = staff posting (postedByRole: 'staff')
 */
export const sellerTypeEnum = pgEnum('seller_type', [
  'dealer',
  'private',
]);

export const bodyTypeEnum = pgEnum('body_type', [
  'sedan',
  'suv',
  'coupe',
  'convertible',
  'hatchback',
  'wagon',
  'pickup',
  'van',
  'sports',
  'luxury',
  'other',
]);

export const fuelTypeEnum = pgEnum('fuel_type', [
  'petrol',
  'diesel',
  'electric',
  'hybrid',
  'plugin_hybrid',
  'hydrogen',
]);

export const transmissionTypeEnum = pgEnum('transmission_type', [
  'automatic',
  'manual',
  'cvt',
  'dct',
  'semi_automatic',
]);

export const specsTypeEnum = pgEnum('specs_type', [
  'gcc',
  'american',
  'european',
  'japanese',
  'chinese',   // Added - trending in UAE
  'korean',    // Added - trending in UAE
  'canadian',
  'other',
]);

export const steeringSideEnum = pgEnum('steering_side', [
  'left',
  'right',
]);

export const exportStatusEnum = pgEnum('export_status', [
  'local_only',
  'gcc',
  'international',
  'restricted',
]);

/**
 * Simplified engine size ranges
 * Much easier for users to select and filter
 */
export const engineSizeEnum = pgEnum('engine_size', [
  'under_1.5L',
  '1.5L_2.0L',
  '2.0L_2.5L',
  '2.5L_3.0L',
  '3.0L_4.0L',
  '4.0L_5.0L',
  '5.0L_6.0L',
  'over_6.0L',
  'electric',
]);

export const engineTypeEnum = pgEnum('engine_type', [
  'inline-3',
  'inline-4',
  'inline-6',
  'v6',
  'v8',
  'v10',
  'v12',
  'w12',
  'electric',
  'hybrid',
  'other',
]);

export const exteriorColorEnum = pgEnum('exterior_color', [
  'white',
  'black',
  'silver',
  'grey',
  'blue',
  'red',
  'green',
  'brown',
  'beige',
  'gold',
  'orange',
  'yellow',
  'purple',
  'other',
]);

export const interiorColorEnum = pgEnum('interior_color', [
  'black',
  'beige',
  'brown',
  'tan',
  'grey',
  'white',
  'red',
  'burgundy',
  'other',
]);

export const warrantyTypeEnum = pgEnum('warranty_type', [
  'none',
  'manufacturer',
  'extended',
  'dealer',
  'other',
]);

export const powerRangeEnum = pgEnum('power_range', [
  'under_100',
  '100_200',
  '200_300',
  '300_400',
  '400_500',
  '500_600',
  '600_700',
  '700_plus',
  'unknown',
]);

export const doorsEnum = pgEnum('doors', [
  '2',
  '3',
  '4',
  '5',
  '6',
]);

export const seatingCapacityEnum = pgEnum('seating_capacity', [
  '2',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9_plus',
]);

export const carListing = pgTable('car_listing', {
  id: text('id').primaryKey(),
  vin: text('vin').unique(),
  slug: text('slug').unique(), // URL-friendly identifier: toyota-camry-2024-abc123
  partnerId: text('partner_id').references(() => partner.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  postedByStaffId: text('posted_by_staff_id'),
  
  /**
   * Posted by role determines seller type:
   * - 'user' = private seller
   * - 'staff' = dealer (via partnerId)
   */
  postedByRole: listingPostedByRoleEnum('posted_by_role').notNull(),
  moderationStatus: listingModerationStatusEnum('moderation_status').default('draft').notNull(),
  lifecycleStatus: listingLifecycleStatusEnum('lifecycle_status').default('active').notNull(),
  
  /**
   * Seller type - derived from postedByRole:
   * - 'private' when postedByRole is 'user'
   * - 'dealer' when postedByRole is 'staff'
   */
  sellerType: sellerTypeEnum('seller_type').default('private').notNull(),
  isConsignment: boolean('is_consignment').default(false).notNull(),
  
  // Consignment Lead Flow
  openToConsignment: boolean('open_to_consignment').default(false).notNull(), // User consent for consignment leads
  
  make: text('make').notNull(),
  model: text('model').notNull(),
  year: integer('year').notNull(),
  trim: text('trim'),
  bodyType: bodyTypeEnum('body_type'),
  fuelType: fuelTypeEnum('fuel_type'),
  transmission: transmissionTypeEnum('transmission'),
  specs: specsTypeEnum('specs').default('gcc').notNull(),
  steeringSide: steeringSideEnum('steering_side').default('left').notNull(),
  engineSize: engineSizeEnum('engine_size'),
  engineType: engineTypeEnum('engine_type'),
  cylinders: integer('cylinders'),
  powerRange: powerRangeEnum('power_range'),
  torque: text('torque'),
  fuelEconomy: text('fuel_economy'),
  doors: doorsEnum('doors').default('4'),
  seatingCapacity: seatingCapacityEnum('seating_capacity').default('5'),
  exteriorColor: exteriorColorEnum('exterior_color'),
  interiorColor: interiorColorEnum('interior_color'),
  mileage: integer('mileage').notNull(),
  price: integer('price').notNull(),
  currency: text('currency').default('AED').notNull(),
  isNegotiable: boolean('is_negotiable').default(true).notNull(),
  
  // AI Valuation (neutral, non-judgmental)
  fairValue: integer('fair_value'),
  estimateMin: integer('estimate_min'),
  estimateMax: integer('estimate_max'),
  priceTrend: text('price_trend'), // 'up' | 'down' | 'stable'
  qiScore: doublePrecision('qi_score'), // 0-100 quality index
  aiConfidenceScore: doublePrecision('ai_confidence_score'), // 0-1
  aiValueFactors: jsonb('ai_value_factors').$type<{
    positives?: string[];      // e.g., ["GCC specs", "Full service history"]
    considerations?: string[]; // Neutral framing, e.g., ["Higher mileage for year"]
    marketContext?: string;    // Brief market note without judgment
  }>(),
  aiModel: text('ai_model').default('v1'),
  aiUpdatedAt: timestamp('ai_updated_at'),
  emirate: text('emirate').notNull(),
  city: text('city'),
  partnerBrandName: text('partner_brand_name'),
  partnerVerified: boolean('partner_verified').default(false),
  thumbnail: text('thumbnail'),
  images: jsonb('images').$type<string[]>().default([]).notNull(),
  videoUrl: text('video_url'),
  description: text('description'),
  technicalFeatures: jsonb('technical_features').$type<{
    abs?: boolean;
    airbags?: number;
    parkingSensors?: boolean;
    rearCamera?: boolean;
    blindSpotMonitor?: boolean;
    laneAssist?: boolean;
    adaptiveCruise?: boolean;
    collisionWarning?: boolean;
    leatherSeats?: boolean;
    heatedSeats?: boolean;
    ventilatedSeats?: boolean;
    sunroof?: boolean;
    panoramicRoof?: boolean;
    climateControl?: boolean;
    powerSeats?: boolean;
    memorySeats?: boolean;
    touchscreen?: boolean;
    screenSize?: string;
    appleCarPlay?: boolean;
    androidAuto?: boolean;
    bluetooth?: boolean;
    navigation?: boolean;
    soundSystem?: string;
    wirelessCharging?: boolean;
    sportMode?: boolean;
    paddleShifters?: boolean;
    allWheelDrive?: boolean;
    adjustableSuspension?: boolean;
    launchControl?: boolean;
  }>().default({}),
  
  /**
   * Extras - Vehicle features/options selected from predefined list
   * e.g., ['panoramicSunroof', 'leatherSeats', 'navigation']
   */
  extras: jsonb('extras').$type<string[]>().default([]),
  
  /**
   * Tags - Predefined badges user selects (MAX 3)
   * e.g., ['serviceHistory', 'singleOwner', 'accidentFree']
   * See LISTING_TAGS in listing-constants.ts
   */
  tags: jsonb('tags').$type<string[]>().default([]),
  
  /**
   * Special Notes - Owner's personal remarks about the car (MAX 10 bullet points)
   * Free-text entries like:
   * - "Modified exhaust system"
   * - "Always kept in garage"
   * - "Minor scratch on rear bumper"
   * 
   * Also contains admin moderation fields for backward compatibility
   */
  specialNotes: jsonb('special_notes').$type<{
    // Owner notes (array of strings, max 10)
    ownerRemarks?: string[];
    
    // Legacy boolean tags (kept for backward compat, use tags[] instead)
    serviceHistory?: boolean;
    singleOwner?: boolean;
    accidentFree?: boolean;
    underWarranty?: boolean;
    registeredUntil?: string;
    
    // Admin moderation fields
    rejectionReason?: string;
    rejectedAt?: string;
    rejectedBy?: string;
    rejectedByName?: string;
    suspensionReason?: string;
    suspendedAt?: string;
    suspendedBy?: string;
    suspendedByName?: string;
  }>().default({}),
  
  warrantyType: warrantyTypeEnum('warranty_type'),
  exportStatus: exportStatusEnum('export_status').default('local_only').notNull(),
  
  /**
   * Badges - System-assigned badges (not user selectable)
   * e.g., ['verified', 'featured', 'premium']
   */
  badges: jsonb('badges').$type<string[]>().default([]),
  isBlkListing: boolean('is_black_member').default(false).notNull(),
  impressionCount: integer('impression_count').default(0).notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  favouriteCount: integer('favourite_count').default(0).notNull(),
  superlikeCount: integer('superlike_count').default(0).notNull(),
  
  // Heat Score (trending/hot cars)
  heatScore: integer('heat_score').default(0).notNull(),
  heatScoreUpdatedAt: timestamp('heat_score_updated_at'),
  
  // SEO fields (slug is defined at the top of the table)
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  reservedAt: timestamp('reserved_at'),
  reservedBy: text('reserved_by').references(() => user.id, { onDelete: 'set null' }),
  soldAt: timestamp('sold_at'),
  soldTo: text('sold_to').references(() => user.id, { onDelete: 'set null' }),
  soldPrice: integer('sold_price'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  lastEditedAt: timestamp('last_edited_at').defaultNow().notNull(),
  submittedAt: timestamp('submitted_at'),
  approvedAt: timestamp('approved_at'),
  lastModeratedAt: timestamp('last_moderated_at'),
  needsRemoderation: boolean('needs_remoderation').default(false).notNull(),
  publishedAt: timestamp('published_at'),
  expiresAt: timestamp('expires_at'),
  extensionCount: integer('extension_count').default(0).notNull(),
  extensionHistory: jsonb('extension_history').$type<Array<{
    extendedAt: string;
    days: 7 | 14;
    previousExpiresAt: string;
    newExpiresAt: string;
    extendedBy: string | null;
  }>>().default([]).notNull(),
  lastExtendedAt: timestamp('last_extended_at'),
  archivedAt: timestamp('archived_at'),
  deletedAt: timestamp('deleted_at'),
  rejectionReason: text('rejection_reason'),
}, (table) => [
  index('car_listing_vin_idx').on(table.vin),
  index('car_listing_slug_idx').on(table.slug),
  index('car_listing_partnerId_idx').on(table.partnerId),
  index('car_listing_userId_idx').on(table.userId),
  index('car_listing_userId_createdAt_idx').on(table.userId, table.createdAt.desc()),
  index('car_listing_userId_updatedAt_idx').on(table.userId, table.updatedAt.desc()),
  index('car_listing_partnerId_createdAt_idx').on(table.partnerId, table.createdAt.desc()),
  index('car_listing_partnerId_lifecycleStatus_createdAt_idx').on(table.partnerId, table.lifecycleStatus, table.createdAt.desc()),
  index('car_listing_partnerId_updatedAt_idx').on(table.partnerId, table.updatedAt.desc()),
  index('car_listing_moderationStatus_idx').on(table.moderationStatus),
  index('car_listing_lifecycleStatus_idx').on(table.lifecycleStatus),
  index('car_listing_moderationStatus_lifecycleStatus_createdAt_idx').on(table.moderationStatus, table.lifecycleStatus, table.createdAt.desc()),
  index('car_listing_moderationStatus_lifecycleStatus_publishedAt_createdAt_idx').on(
    table.moderationStatus,
    table.lifecycleStatus,
    table.publishedAt.desc(),
    table.createdAt.desc()
  ),
  index('car_listing_moderationStatus_lifecycleStatus_updatedAt_idx').on(table.moderationStatus, table.lifecycleStatus, table.updatedAt.desc()),
  index('car_listing_partnerId_moderationStatus_lifecycleStatus_idx').on(table.partnerId, table.moderationStatus, table.lifecycleStatus),
  index('car_listing_updatedAt_idx').on(table.updatedAt.desc()),
  index('car_listing_createdAt_idx').on(table.createdAt.desc()),
  index('car_listing_publishedAt_idx').on(table.publishedAt.desc()),
  index('car_listing_lifecycleStatus_expiresAt_idx').on(table.lifecycleStatus, table.expiresAt),
  index('car_listing_moderationStatus_lifecycleStatus_expiresAt_idx').on(table.moderationStatus, table.lifecycleStatus, table.expiresAt),
  
  // Public search base conditions index (moderation_status, lifecycle_status, needs_remoderation, expires_at)
  // Covers: WHERE approved AND active AND NOT needs_remoderation AND expires_at > NOW()
  index('car_listing_public_search_base_idx').on(
    table.moderationStatus, 
    table.lifecycleStatus, 
    table.needsRemoderation, 
    table.expiresAt
  ),
  
  // Public search with publishedAt sorting (most common sort)
  index('car_listing_public_search_publishedAt_idx').on(
    table.moderationStatus, 
    table.lifecycleStatus, 
    table.needsRemoderation, 
    table.publishedAt.desc()
  ),
  
  index('car_listing_make_idx').on(table.make),
  index('car_listing_model_idx').on(table.model),
  index('car_listing_year_idx').on(table.year),
  index('car_listing_make_model_year_idx').on(table.make, table.model, table.year),
  index('car_listing_bodyType_idx').on(table.bodyType),
  index('car_listing_fuelType_idx').on(table.fuelType),
  index('car_listing_transmission_idx').on(table.transmission),
  index('car_listing_emirate_idx').on(table.emirate),
  index('car_listing_emirate_lifecycleStatus_idx').on(table.emirate, table.lifecycleStatus),
  index('car_listing_price_idx').on(table.price),
  
  // Consignment lead matching index
  index('car_listing_openToConsignment_publicish_idx').on(table.openToConsignment, table.moderationStatus, table.lifecycleStatus),
]);

export const listingPriceHistory = pgTable('listing_price_history', {
  id: text('id').primaryKey(),
  listingId: text('listing_id').notNull().references(() => carListing.id, { onDelete: 'cascade' }),
  oldPrice: integer('old_price').notNull(),
  newPrice: integer('new_price').notNull(),
  changePercent: doublePrecision('change_percent'),
  reason: text('reason'),
  changedBy: text('changed_by').references(() => user.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('listing_price_history_listingId_idx').on(table.listingId),
  index('listing_price_history_createdAt_idx').on(table.createdAt),
]);

export const listingView = pgTable('listing_view', {
  id: text('id').primaryKey(),
  listingId: text('listing_id').notNull().references(() => carListing.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
  sessionId: text('session_id'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  referrer: text('referrer'),
  deviceType: text('device_type'),
  timeSpent: integer('time_spent'),
  imagesViewed: integer('images_viewed').default(0),
  videoPlayed: boolean('video_played').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('listing_view_listingId_idx').on(table.listingId),
  index('listing_view_userId_idx').on(table.userId),
  index('listing_view_createdAt_idx').on(table.createdAt),
  index('listing_view_sessionId_idx').on(table.sessionId),
]);
