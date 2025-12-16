/**
 * Car Listing Schema
 * 
 * ===== ARCHITECTURE =====
 * Car listings can be created by:
 * 1. Partners (dealers/showrooms) - Primary use case for v1
 * 2. Individual users (P2P) - Future feature
 * 
 * ===== LOCATION STRATEGY =====
 * Listings store emirate + city (denormalized from owner) for search performance.
 * 
 * When creating/updating listing:
 * - Partner listing → Copy partner.emirate and partner.city to listing
 * - User listing → Copy userProfile.locationEmirate and userProfile.locationCity to listing
 * 
 * For detailed location (address, lat/lng coordinates):
 * - Partner listing → Join with partner table
 * - User listing → Join with userProfile table
 * 
 * This approach balances:
 * ✅ Fast search/filter queries (no joins needed for emirate/city filtering)
 * ✅ Accurate detailed location (join owner for full address/coordinates)
 * ✅ Consistency (location updates in owner automatically reflect in queries)
 * 
 * ===== KEY FEATURES =====
 * - Comprehensive vehicle data (VIN, specs, features, etc.)
 * - Rich media (images, videos, 360 views)
 * - Pricing & valuation (AI estimates, market trends)
 * - Status workflow (draft → published → reserved → sold)
 * - Performance tracking (views, favorites, shares)
 * - Quality scoring (QI Score for ranking)
 * - Advanced search/filter support
 * 
 * ===== LISTING FLOW =====
 * Partner creates → Draft → Review/Edit → Publish → Active
 *                                              ↓
 *                                         Reserved → Sold
 */

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

// Enums
export const listingStatusEnum = pgEnum('listing_status', [
  'draft',        // Being created/edited
  'pending',      // Submitted for review (if needed)
  'published',    // Live and visible
  'reserved',     // Someone reserved it
  'sold',         // Successfully sold
  'archived',     // Removed from active listings
  'rejected',     // Failed review
]);

export const sellerTypeEnum = pgEnum('seller_type', [
  'dealer',       // Partner/showroom listing
  'private',      // Individual user (P2P - future)
  'consignment',  // Listed by dealer but owned by private seller
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
  'gcc',          // Gulf Cooperation Council specs
  'american',
  'european',
  'japanese',
  'canadian',
  'other',
]);

export const steeringSideEnum = pgEnum('steering_side', [
  'left',         // LHD (Left-Hand Drive) - Standard in UAE
  'right',        // RHD (Right-Hand Drive)
]);

export const exportStatusEnum = pgEnum('export_status', [
  'local_only',   // UAE market only
  'gcc',          // Available for GCC export
  'international', // Can be exported globally
  'restricted',   // Export restrictions apply
]);

/**
 * Car Listing Table
 * Core vehicle listing with all details
 */
export const carListing = pgTable('car_listing', {
  // Primary identification
  id: text('id').primaryKey(),
  vin: text('vin').unique(), // Vehicle Identification Number (optional but recommended)
  
  // Ownership & Seller
  partnerId: text('partner_id').references(() => partner.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }), // For P2P listings
  sellerType: sellerTypeEnum('seller_type').default('dealer').notNull(),
  isConsignment: boolean('is_consignment').default(false).notNull(), // Dealer listing but private owner
  
  // Basic Vehicle Information
  make: text('make').notNull(), // "Mercedes-Benz", "Toyota", "BMW"
  model: text('model').notNull(), // "C-Class", "Camry", "X5"
  year: integer('year').notNull(), // 2023
  trim: text('trim'), // "AMG", "Sport", "Prestige"
  
  // Vehicle Specifications
  bodyType: bodyTypeEnum('body_type'),
  fuelType: fuelTypeEnum('fuel_type'),
  transmission: transmissionTypeEnum('transmission'),
  specs: specsTypeEnum('specs').default('gcc').notNull(),
  steeringSide: steeringSideEnum('steering_side').default('left').notNull(),
  
  // Engine & Performance
  engineSize: text('engine_size'), // "3.0L", "2000cc"
  engineType: text('engine_type'), // "V6", "Inline-4", "Electric"
  cylinders: integer('cylinders'), // 4, 6, 8
  power: text('power'), // "300 HP", "450 HP"
  torque: text('torque'), // "400 Nm", "600 Nm"
  fuelEconomy: text('fuel_economy'), // "12 L/100km", "45 MPG"
  
  // Physical Details
  doors: integer('doors').default(4),
  seatingCapacity: integer('seating_capacity').default(5),
  exteriorColor: text('exterior_color'), // "White", "Black", "Silver"
  interiorColor: text('interior_color'), // "Black", "Beige", "Brown"
  
  // Condition & Mileage
  mileage: integer('mileage').notNull(), // In kilometers
  
  // Pricing
  price: integer('price').notNull(), // In AED cents (so 250000.00 AED = 25000000 cents)
  currency: text('currency').default('AED').notNull(),
  isNegotiable: boolean('is_negotiable').default(true).notNull(),
  
  // AI Valuation & Market Intelligence
  fairValue: integer('fair_value'), // AI estimated fair market value (AED cents)
  estimateMin: integer('estimate_min'), // Lower bound of price range
  estimateMax: integer('estimate_max'), // Upper bound of price range
  priceTrend: text('price_trend'), // "below_market", "at_market", "above_market"
  qiScore: doublePrecision('qi_score'), // Quality Intelligence Score (0-100) for ranking
  
  // Location (denormalized from owner for query performance)
  // These fields are copied from owner (partner or user) when listing is created/updated
  // This avoids expensive joins for search/filter queries
  // For full address/coordinates: join with partner or userProfile
  emirate: text('emirate').notNull(), // "Dubai", "Abu Dhabi", "Sharjah", etc.
  city: text('city'), // "Dubai Marina", "Downtown", etc.
  
  // Media & Content
  thumbnail: text('thumbnail'), // Main thumbnail URL
  images: jsonb('images').$type<string[]>().default([]).notNull(), // All image URLs
  videoUrl: text('video_url'), // YouTube, Vimeo, or direct URL
  description: text('description'), // Rich text description
  
  // Features & Extras
  technicalFeatures: jsonb('technical_features').$type<{
    // Safety
    abs?: boolean;
    airbags?: number;
    parkingSensors?: boolean;
    rearCamera?: boolean;
    blindSpotMonitor?: boolean;
    laneAssist?: boolean;
    adaptiveCruise?: boolean;
    collisionWarning?: boolean;
    
    // Comfort
    leatherSeats?: boolean;
    heatedSeats?: boolean;
    ventilatedSeats?: boolean;
    sunroof?: boolean;
    panoramicRoof?: boolean;
    climateControl?: boolean;
    powerSeats?: boolean;
    memorySeats?: boolean;
    
    // Technology
    touchscreen?: boolean;
    screenSize?: string;
    appleCarPlay?: boolean;
    androidAuto?: boolean;
    bluetooth?: boolean;
    navigation?: boolean;
    soundSystem?: string;
    wirelessCharging?: boolean;
    
    // Performance
    sportMode?: boolean;
    paddleShifters?: boolean;
    allWheelDrive?: boolean;
    adjustableSuspension?: boolean;
    launchControl?: boolean;
  }>().default({}),
  
  extras: jsonb('extras').$type<string[]>().default([]), // Free-form extra features
  specialNotes: jsonb('special_notes').$type<{
    serviceHistory?: boolean;
    singleOwner?: boolean;
    accidentFree?: boolean;
    underWarranty?: boolean;
    registeredUntil?: string;
    customizations?: string[];
    recentServices?: string[];
    knownIssues?: string[];
  }>().default({}),
  
  // Warranty & Documentation
  warranty: text('warranty'), // "Factory warranty until 2025", "No warranty"
  
  // Status & Publication
  status: listingStatusEnum('status').default('draft').notNull(),
  exportStatus: exportStatusEnum('export_status').default('local_only').notNull(),
  
  // Badges & Tags
  badges: jsonb('badges').$type<string[]>().default([]), // ["verified", "top_rated", "price_reduced"]
  tags: jsonb('tags').$type<string[]>().default([]), // ["luxury", "family_car", "low_mileage"]
  isFeatured: boolean('is_featured').default(false).notNull(), // Premium placement
  isBlackMember: boolean('is_black_member').default(false).notNull(), // Black tier partner
  
  // Engagement Metrics
  // NOTE: Favorites are unlimited, Superlikes are limited to 5 per user per month
  // See userSuperlikeQuota table for tracking monthly limits
  viewCount: integer('view_count').default(0).notNull(),
  favouriteCount: integer('favourite_count').default(0).notNull(), // Unlimited favorites
  superlikeCount: integer('superlike_count').default(0).notNull(), // 5 per user per month max
  shareCount: integer('share_count').default(0).notNull(),
  
  // Lead Generation Metrics
  inquiryCount: integer('inquiry_count').default(0).notNull(), // Number of inquiries received
  bookingCount: integer('booking_count').default(0).notNull(), // Number of bookings made
  callCount: integer('call_count').default(0).notNull(), // Number of times "Call" button clicked
  whatsappCount: integer('whatsapp_count').default(0).notNull(),
  
  // Conversion Tracking
  leadQuality: doublePrecision('lead_quality'), // 0-100 score based on engagement
  conversionRate: doublePrecision('conversion_rate'), // Inquiry → booking rate
  avgTimeToSale: integer('avg_time_to_sale'), // Days from publish to sold
  
  // SEO & Discovery
  slug: text('slug').unique(), // URL-friendly identifier: "2023-mercedes-c-class-amg-dubai-abc123"
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  
  // Reservation & Sale
  reservedAt: timestamp('reserved_at'),
  reservedBy: text('reserved_by').references(() => user.id, { onDelete: 'set null' }),
  soldAt: timestamp('sold_at'),
  soldTo: text('sold_to').references(() => user.id, { onDelete: 'set null' }),
  soldPrice: integer('sold_price'), // Actual final sale price (AED cents)
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  publishedAt: timestamp('published_at'), // When it went live
  archivedAt: timestamp('archived_at'),
  
  // Moderation & Quality Control
  reviewedBy: text('reviewed_by').references(() => user.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at'),
  rejectionReason: text('rejection_reason'),
  
  // Performance Analytics (auto-calculated)
  performanceScore: doublePrecision('performance_score'), // Overall listing quality 0-100
  daysOnMarket: integer('days_on_market'), // Days since published
  priceChanges: integer('price_changes').default(0), // Number of times price was updated
  lastPriceChange: timestamp('last_price_change'),
}, (table) => [
  // Core Identification
  index('car_listing_vin_idx').on(table.vin),
  index('car_listing_slug_idx').on(table.slug),
  
  // Ownership
  index('car_listing_partnerId_idx').on(table.partnerId),
  index('car_listing_userId_idx').on(table.userId),
  index('car_listing_sellerType_idx').on(table.sellerType),
  
  // Status & Discovery
  index('car_listing_status_idx').on(table.status),
  index('car_listing_status_publishedAt_idx').on(table.status, table.publishedAt),
  index('car_listing_isFeatured_status_idx').on(table.isFeatured, table.status),
  
  // Vehicle Search
  index('car_listing_make_idx').on(table.make),
  index('car_listing_model_idx').on(table.model),
  index('car_listing_year_idx').on(table.year),
  index('car_listing_make_model_year_idx').on(table.make, table.model, table.year),
  index('car_listing_bodyType_idx').on(table.bodyType),
  index('car_listing_fuelType_idx').on(table.fuelType),
  index('car_listing_transmission_idx').on(table.transmission),
  
  // Location
  index('car_listing_emirate_idx').on(table.emirate),
  index('car_listing_city_idx').on(table.city),
  index('car_listing_emirate_status_idx').on(table.emirate, table.status),
  
  // Pricing & Valuation
  index('car_listing_price_idx').on(table.price),
  index('car_listing_qiScore_idx').on(table.qiScore),
  
  // Timestamps for sorting
  index('car_listing_createdAt_idx').on(table.createdAt),
  index('car_listing_publishedAt_idx').on(table.publishedAt),
  
  // Foreign keys for joins
  index('car_listing_reservedBy_idx').on(table.reservedBy),
  index('car_listing_soldTo_idx').on(table.soldTo),
  index('car_listing_reviewedBy_idx').on(table.reviewedBy),
]);

/**
 * Listing Price History Table
 * Tracks all price changes for market analysis and transparency
 */
export const listingPriceHistory = pgTable('listing_price_history', {
  id: text('id').primaryKey(),
  listingId: text('listing_id').notNull().references(() => carListing.id, { onDelete: 'cascade' }),
  
  oldPrice: integer('old_price').notNull(), // Previous price (AED cents)
  newPrice: integer('new_price').notNull(), // New price (AED cents)
  changePercent: doublePrecision('change_percent'), // Percentage change
  reason: text('reason'), // "market_adjustment", "quick_sale", "seasonal"
  changedBy: text('changed_by').references(() => user.id, { onDelete: 'set null' }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('listing_price_history_listingId_idx').on(table.listingId),
  index('listing_price_history_createdAt_idx').on(table.createdAt),
]);

/**
 * Listing View Tracking
 * Track unique views for analytics (optional - can use external analytics)
 */
export const listingView = pgTable('listing_view', {
  id: text('id').primaryKey(),
  listingId: text('listing_id').notNull().references(() => carListing.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }), // Null for anonymous
  
  // Analytics Data
  sessionId: text('session_id'), // For tracking unique sessions
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  referrer: text('referrer'), // Where they came from
  deviceType: text('device_type'), // mobile, tablet, desktop
  
  // Engagement
  timeSpent: integer('time_spent'), // Seconds spent viewing
  imagesViewed: integer('images_viewed').default(0), // How many images they viewed
  videoPlayed: boolean('video_played').default(false),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('listing_view_listingId_idx').on(table.listingId),
  index('listing_view_userId_idx').on(table.userId),
  index('listing_view_createdAt_idx').on(table.createdAt),
  index('listing_view_sessionId_idx').on(table.sessionId),
]);
