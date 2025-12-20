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

export const listingStatusEnum = pgEnum('listing_status', [
  'draft',
  'pending',
  'published',
  'reserved',
  'sold',
  'archived',
  'rejected',
]);

export const sellerTypeEnum = pgEnum('seller_type', [
  'dealer',
  'private',
  'consignment',
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

export const carListing = pgTable('car_listing', {
  id: text('id').primaryKey(),
  vin: text('vin').unique(),
  partnerId: text('partner_id').references(() => partner.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  postedByStaffId: text('posted_by_staff_id'),
  sellerType: sellerTypeEnum('seller_type').default('dealer').notNull(),
  isConsignment: boolean('is_consignment').default(false).notNull(),
  make: text('make').notNull(),
  model: text('model').notNull(),
  year: integer('year').notNull(),
  trim: text('trim'),
  bodyType: bodyTypeEnum('body_type'),
  fuelType: fuelTypeEnum('fuel_type'),
  transmission: transmissionTypeEnum('transmission'),
  specs: specsTypeEnum('specs').default('gcc').notNull(),
  steeringSide: steeringSideEnum('steering_side').default('left').notNull(),
  engineSize: text('engine_size'),
  engineType: text('engine_type'),
  cylinders: integer('cylinders'),
  power: text('power'),
  torque: text('torque'),
  fuelEconomy: text('fuel_economy'),
  doors: integer('doors').default(4),
  seatingCapacity: integer('seating_capacity').default(5),
  exteriorColor: text('exterior_color'),
  interiorColor: text('interior_color'),
  mileage: integer('mileage').notNull(),
  price: integer('price').notNull(),
  currency: text('currency').default('AED').notNull(),
  isNegotiable: boolean('is_negotiable').default(true).notNull(),
  fairValue: integer('fair_value'),
  estimateMin: integer('estimate_min'),
  estimateMax: integer('estimate_max'),
  priceTrend: text('price_trend'),
  qiScore: doublePrecision('qi_score'),
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
  extras: jsonb('extras').$type<string[]>().default([]),
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
  warranty: text('warranty'),
  status: listingStatusEnum('status').default('draft').notNull(),
  exportStatus: exportStatusEnum('export_status').default('local_only').notNull(),
  badges: jsonb('badges').$type<string[]>().default([]),
  tags: jsonb('tags').$type<string[]>().default([]),
  isFeatured: boolean('is_featured').default(false).notNull(),
  isBlackMember: boolean('is_black_member').default(false).notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  favouriteCount: integer('favourite_count').default(0).notNull(),
  superlikeCount: integer('superlike_count').default(0).notNull(),
  slug: text('slug').unique(),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  reservedAt: timestamp('reserved_at'),
  reservedBy: text('reserved_by').references(() => user.id, { onDelete: 'set null' }),
  soldAt: timestamp('sold_at'),
  soldTo: text('sold_to').references(() => user.id, { onDelete: 'set null' }),
  soldPrice: integer('sold_price'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  publishedAt: timestamp('published_at'),
  archivedAt: timestamp('archived_at'),
  reviewedBy: text('reviewed_by').references(() => user.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at'),
  rejectionReason: text('rejection_reason'),
}, (table) => [
  index('car_listing_vin_idx').on(table.vin),
  index('car_listing_slug_idx').on(table.slug),
  index('car_listing_partnerId_idx').on(table.partnerId),
  index('car_listing_userId_idx').on(table.userId),
  index('car_listing_partnerId_createdAt_idx').on(table.partnerId, table.createdAt.desc()),
  index('car_listing_partnerId_status_createdAt_idx').on(table.partnerId, table.status, table.createdAt.desc()),
  index('car_listing_status_idx').on(table.status),
  index('car_listing_status_createdAt_idx').on(table.status, table.createdAt.desc()),
  index('car_listing_make_idx').on(table.make),
  index('car_listing_model_idx').on(table.model),
  index('car_listing_year_idx').on(table.year),
  index('car_listing_make_model_year_idx').on(table.make, table.model, table.year),
  index('car_listing_bodyType_idx').on(table.bodyType),
  index('car_listing_fuelType_idx').on(table.fuelType),
  index('car_listing_transmission_idx').on(table.transmission),
  index('car_listing_emirate_idx').on(table.emirate),
  index('car_listing_emirate_status_idx').on(table.emirate, table.status),
  index('car_listing_price_idx').on(table.price),
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
