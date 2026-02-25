import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  doublePrecision,
  jsonb,
  index,
  uniqueIndex,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { user } from './auth';
import { partner } from './partner';
import {
  LISTING_MODERATION_STATUSES,
  LISTING_LIFECYCLE_STATUSES,
  LISTING_POSTED_BY_ROLES,
  SELLER_TYPES,
  VIN_VISIBILITY_OPTIONS,
  VEHICLE_CONDITION_VALUES,
  BODY_TYPE_VALUES,
  FUEL_TYPE_VALUES,
  TRANSMISSION_TYPE_VALUES,
  SPECS_TYPE_VALUES,
  ENGINE_SIZE_VALUES,
  ENGINE_TYPE_VALUES,
  STEERING_SIDE_VALUES,
  EXPORT_STATUS_VALUES,
  WARRANTY_TYPE_VALUES,
  POWER_RANGE_VALUES,
  EXTERIOR_COLOR_VALUES,
  INTERIOR_COLOR_VALUES,
  DOORS_VALUES,
  SEATING_CAPACITY_VALUES,
} from './listing-constants';

export const listingModerationStatusEnum = pgEnum('listing_moderation_status', LISTING_MODERATION_STATUSES);

export const listingLifecycleStatusEnum = pgEnum('listing_lifecycle_status', LISTING_LIFECYCLE_STATUSES);

/**
 * Posted by role - determines seller type automatically:
 * - 'user' = private seller
 * - 'staff' = dealer (partner)
 */
export const listingPostedByRoleEnum = pgEnum('listing_posted_by_role', LISTING_POSTED_BY_ROLES);

/**
 * Seller type - derived from postedByRole but kept for backward compatibility
 * - 'private' = user posting (postedByRole: 'user')
 * - 'dealer' = staff posting (postedByRole: 'staff')
 */
export const sellerTypeEnum = pgEnum('seller_type', SELLER_TYPES);

/**
 * VIN visibility - controls whether VIN is shown publicly
 * - 'public' = VIN shown on listing (default, builds trust)
 * - 'private' = VIN verified but hidden from public view
 */
export const vinVisibilityEnum = pgEnum('vin_visibility', VIN_VISIBILITY_OPTIONS);

export const vehicleConditionEnum = pgEnum('vehicle_condition', VEHICLE_CONDITION_VALUES);

export const bodyTypeEnum = pgEnum('body_type', BODY_TYPE_VALUES);

export const fuelTypeEnum = pgEnum('fuel_type', FUEL_TYPE_VALUES);

export const transmissionTypeEnum = pgEnum('transmission_type', TRANSMISSION_TYPE_VALUES);

export const specsTypeEnum = pgEnum('specs_type', SPECS_TYPE_VALUES);

export const steeringSideEnum = pgEnum('steering_side', STEERING_SIDE_VALUES);

export const exportStatusEnum = pgEnum('export_status', EXPORT_STATUS_VALUES);

/**
 * Simplified engine size ranges
 * Much easier for users to select and filter
 */
export const engineSizeEnum = pgEnum('engine_size', ENGINE_SIZE_VALUES);

export const engineTypeEnum = pgEnum('engine_type', ENGINE_TYPE_VALUES);

export const exteriorColorEnum = pgEnum('exterior_color', EXTERIOR_COLOR_VALUES);

export const interiorColorEnum = pgEnum('interior_color', INTERIOR_COLOR_VALUES);

export const warrantyTypeEnum = pgEnum('warranty_type', WARRANTY_TYPE_VALUES);

export const powerRangeEnum = pgEnum('power_range', POWER_RANGE_VALUES);

export const doorsEnum = pgEnum('doors', DOORS_VALUES);

export const seatingCapacityEnum = pgEnum('seating_capacity', SEATING_CAPACITY_VALUES);

export const carListing = pgTable('car_listing', {
  id: text('id').primaryKey(),
  vin: text('vin').unique(),
  /**
   * Controls whether VIN is shown publicly on the listing.
   * VIN is still stored and used for anti-abuse regardless of this setting.
   * - 'public' = VIN shown to all users (default, recommended for trust)
   * - 'private' = VIN verified badge shown, but actual VIN hidden
   */
  vinVisibility: vinVisibilityEnum('vin_visibility').default('public').notNull(),
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
  condition: vehicleConditionEnum('condition').default('used').notNull(),
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
  
  /**
   * Original first-publish timestamp - Anti-abuse protection
   * 
   * This timestamp is set the FIRST time a VIN is published by a user.
   * If the same user deletes and reposts the same VIN, this date is preserved
   * to prevent "bump to top" abuse.
   * 
   * Used for sorting "newest" listings instead of publishedAt.
   * - Same VIN, same user = inherit originalPublishedAt from previous listing
   * - Same VIN, different user = fresh originalPublishedAt (ownership transfer)
   * - Different VIN = fresh originalPublishedAt (genuinely new car)
   */
  originalPublishedAt: timestamp('original_published_at'),
  
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
  
  // Public search with originalPublishedAt sorting (anti-abuse: prevents repost bump)
  index('car_listing_public_search_originalPublishedAt_idx').on(
    table.moderationStatus, 
    table.lifecycleStatus, 
    table.needsRemoderation, 
    table.originalPublishedAt.desc()
  ),
  
  // Original publish date index (for "newest" sort that prevents abuse)
  index('car_listing_originalPublishedAt_idx').on(table.originalPublishedAt.desc()),
  
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
  
  // Consignment funnel matching - user listings with proper status
  // Covers WHERE partnerId IS NULL AND moderationStatus = 'approved' AND lifecycleStatus = 'active'
  index('car_listing_user_consignment_idx').on(table.partnerId, table.moderationStatus, table.lifecycleStatus, table.userId),
  
  // ⚡ Work listings by partner + staff member (staffMemberUserId filter)
  // Covers: WHERE partnerId = ? AND userId = ? with status filters and sorting
  index('car_listing_partnerId_userId_idx').on(table.partnerId, table.userId),
  index('car_listing_partnerId_userId_publishedAt_idx').on(table.partnerId, table.userId, table.publishedAt.desc()),
  index('car_listing_partnerId_userId_lifecycleStatus_idx').on(table.partnerId, table.userId, table.lifecycleStatus),
  
  // ⚡ User work listings (listingType='work' - partnerId IS NOT NULL)
  // Covers stats queries: WHERE userId = ? AND partnerId IS NOT NULL
  index('car_listing_userId_partnerId_not_null_idx').on(table.userId, table.partnerId),
  
  // ⚡ Optimized sorting index for newest sort (avoid coalesce in ORDER BY)
  index('car_listing_partnerId_publishedAt_createdAt_idx').on(table.partnerId, table.publishedAt.desc(), table.createdAt.desc()),
  index('car_listing_userId_publishedAt_createdAt_idx').on(table.userId, table.publishedAt.desc(), table.createdAt.desc()),
  
  // ========================================
  // ⚡ SEARCH PERFORMANCE: Partial indexes for public active listings
  // Base: WHERE approved AND active AND NOT needs_remoderation
  // These dramatically reduce scan size for ALL search/facet/count queries
  // Uses raw SQL to avoid drizzle-kit parameterization issues with DDL
  // ========================================
  
  // Public listings base (for ID query, COUNT)
  index('idx_public_listings_id_expires').on(table.expiresAt, table.id)
    .where(sql`moderation_status = 'approved' AND lifecycle_status = 'active' AND needs_remoderation = false`),
  
  // Newest sort
  index('idx_public_listings_newest').on(table.originalPublishedAt.desc(), table.publishedAt.desc(), table.createdAt.desc())
    .where(sql`moderation_status = 'approved' AND lifecycle_status = 'active' AND needs_remoderation = false`),
  
  // Price sort  
  index('idx_public_listings_price_asc').on(table.price.asc(), table.createdAt.desc())
    .where(sql`moderation_status = 'approved' AND lifecycle_status = 'active' AND needs_remoderation = false`),
  index('idx_public_listings_price_desc').on(table.price.desc(), table.createdAt.desc())
    .where(sql`moderation_status = 'approved' AND lifecycle_status = 'active' AND needs_remoderation = false`),
  
  // Facet indexes (each GROUP BY column + expires_at for range filter)
  index('idx_public_facet_make').on(table.make, table.expiresAt)
    .where(sql`moderation_status = 'approved' AND lifecycle_status = 'active' AND needs_remoderation = false`),
  index('idx_public_facet_model').on(table.model, table.expiresAt)
    .where(sql`moderation_status = 'approved' AND lifecycle_status = 'active' AND needs_remoderation = false`),
  index('idx_public_facet_trim').on(table.trim, table.expiresAt)
    .where(sql`moderation_status = 'approved' AND lifecycle_status = 'active' AND needs_remoderation = false`),
  index('idx_public_facet_emirate').on(table.emirate, table.expiresAt)
    .where(sql`moderation_status = 'approved' AND lifecycle_status = 'active' AND needs_remoderation = false`),
  index('idx_public_facet_specs').on(table.specs, table.expiresAt)
    .where(sql`moderation_status = 'approved' AND lifecycle_status = 'active' AND needs_remoderation = false`),
  index('idx_public_facet_body_type').on(table.bodyType, table.expiresAt)
    .where(sql`moderation_status = 'approved' AND lifecycle_status = 'active' AND needs_remoderation = false`),
  index('idx_public_facet_fuel_type').on(table.fuelType, table.expiresAt)
    .where(sql`moderation_status = 'approved' AND lifecycle_status = 'active' AND needs_remoderation = false`),
  index('idx_public_facet_transmission').on(table.transmission, table.expiresAt)
    .where(sql`moderation_status = 'approved' AND lifecycle_status = 'active' AND needs_remoderation = false`),
  index('idx_public_facet_engine_size').on(table.engineSize, table.expiresAt)
    .where(sql`moderation_status = 'approved' AND lifecycle_status = 'active' AND needs_remoderation = false`),
  index('idx_public_facet_exterior_color').on(table.exteriorColor, table.expiresAt)
    .where(sql`moderation_status = 'approved' AND lifecycle_status = 'active' AND needs_remoderation = false`),
  index('idx_public_facet_interior_color').on(table.interiorColor, table.expiresAt)
    .where(sql`moderation_status = 'approved' AND lifecycle_status = 'active' AND needs_remoderation = false`),
  index('idx_public_facet_seller_type').on(table.sellerType, table.expiresAt)
    .where(sql`moderation_status = 'approved' AND lifecycle_status = 'active' AND needs_remoderation = false`),
  
  // Range facet indexes (year, price, mileage min/max)
  index('idx_public_facet_year').on(table.year, table.expiresAt)
    .where(sql`moderation_status = 'approved' AND lifecycle_status = 'active' AND needs_remoderation = false`),
  index('idx_public_facet_mileage').on(table.mileage, table.expiresAt)
    .where(sql`moderation_status = 'approved' AND lifecycle_status = 'active' AND needs_remoderation = false`),
  index('idx_public_facet_price').on(table.price, table.expiresAt)
    .where(sql`moderation_status = 'approved' AND lifecycle_status = 'active' AND needs_remoderation = false`),
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

/**
 * VIN Publication History - Anti-abuse tracking
 * 
 * Tracks when a VIN was first published by each user to prevent
 * delete-and-repost abuse where users bump their listings to the top.
 * 
 * Key behaviors:
 * - Same VIN + same user: Inherit originalPublishedAt from history
 * - Same VIN + different user: Fresh timestamp (ownership transfer is legitimate)
 * - Different VIN: Fresh timestamp (genuinely new car)
 */
export const vinPublicationHistory = pgTable('vin_publication_history', {
  id: text('id').primaryKey(),
  vin: text('vin').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  
  /** The timestamp when this VIN was FIRST published by this user */
  originalPublishedAt: timestamp('original_published_at').notNull(),
  
  /** The current/latest listing ID for this VIN (null if deleted) */
  currentListingId: text('current_listing_id').references(() => carListing.id, { onDelete: 'set null' }),
  
  /** Array of all listing IDs that have used this VIN (for audit trail) */
  listingHistory: jsonb('listing_history').$type<Array<{
    listingId: string;
    publishedAt: string;
    deletedAt?: string;
    soldAt?: string;
  }>>().default([]).notNull(),
  
  /** How many times this VIN has been reposted by this user */
  repostCount: integer('repost_count').default(0).notNull(),
  
  /** Last time this record was updated */
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  // UNIQUE constraint for ON CONFLICT upsert: one record per VIN+user
  uniqueIndex('vin_publication_history_vin_userId_unique').on(table.vin, table.userId),
  // Find all history for a VIN (across all users)
  index('vin_publication_history_vin_idx').on(table.vin),
  // Find all VINs a user has published
  index('vin_publication_history_userId_idx').on(table.userId),
]);
