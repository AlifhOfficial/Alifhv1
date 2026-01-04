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
import { user } from './auth';

export const userProfile = pgTable('user_profile', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  
  phone: text('phone'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  avatar: text('avatar'),
  description: text('description'),
  
  kycVerified: boolean('kyc_verified').default(false).notNull(),
  kycVerifiedAt: timestamp('kyc_verified_at'),
  
  badges: jsonb('badges').$type<string[]>().default([]),
  tags: jsonb('tags').$type<string[]>().default([]),
  
  locationLat: doublePrecision('location_lat'),
  locationLng: doublePrecision('location_lng'),
  locationCity: text('location_city'),
  locationEmirate: text('location_emirate'),
  
  inventoryCount: integer('inventory_count').default(0).notNull(),
  rating: doublePrecision('rating').default(0.0),
  platformRating: doublePrecision('platform_rating'),
  platformReviewCount: integer('platform_review_count').default(0).notNull(),
  
  avgResponseTime: integer('avg_response_time'),
  lastActiveAt: timestamp('last_active_at'),
  
  notificationPreferences: jsonb('notification_preferences').$type<{
    emailKYC: boolean;
    emailEscrow: boolean;
    emailBooking: boolean;
    emailMessages: boolean;
    emailFinancial: boolean;
    emailMarketing: boolean;
    emailReservation: boolean;
  }>().default({
    emailKYC: true,
    emailEscrow: true,
    emailBooking: true,
    emailMessages: true,
    emailFinancial: true,
    emailMarketing: false,
    emailReservation: true,
  }).notNull(),
  
  privacySettings: jsonb('privacy_settings').$type<{
    showEmail: boolean;
    showPhone: boolean;
  }>().default({
    showEmail: false,
    showPhone: true,
  }).notNull(),
  
  preferences: jsonb('preferences').$type<{
    theme: 'light' | 'dark' | 'system';
    language: string;
    distanceUnit: 'km' | 'miles';
  }>().default({
    theme: 'system',
    language: 'en',
    distanceUnit: 'km',
  }).notNull(),
  
  consignmentMode: boolean('consignment_mode').default(false).notNull(),
  
  status: text('status').default('active').notNull(),
  
  memberSince: timestamp('member_since').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('user_profile_userId_idx').on(table.userId),
  index('user_profile_phone_idx').on(table.phone),
  index('user_profile_location_idx').on(table.locationCity, table.locationEmirate),
  index('user_profile_kyc_verified_idx').on(table.kycVerified),
  index('user_profile_consignment_mode_idx').on(table.consignmentMode),
]);

export const kycRecord = pgTable('kyc_record', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  
  status: text('status').notNull(),
  type: text('type').notNull(),
  
  documentType: text('document_type'),
  documentNumber: text('document_number'),
  documentFrontUrl: text('document_front_url'),
  documentBackUrl: text('document_back_url'),
  selfieUrl: text('selfie_url'),
  
  verifiedBy: text('verified_by'),
  verifiedAt: timestamp('verified_at'),
  rejectionReason: text('rejection_reason'),
  expiresAt: timestamp('expires_at'),
  
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('kyc_record_userId_idx').on(table.userId),
  index('kyc_record_status_idx').on(table.status),
  index('kyc_record_status_createdAt_idx').on(table.status, table.createdAt.desc()),
]);

export const userFavorite = pgTable('user_favorite', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  listingId: text('listing_id').notNull(), // will reference car_listing table
  
  // For analytics
  addedFrom: text('added_from'), // 'search', 'listing_page', 'feed', etc.
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('user_favorite_userId_createdAt_idx').on(table.userId, table.createdAt.desc()),
  index('user_favorite_listingId_idx').on(table.listingId),
  uniqueIndex('user_favorite_userId_listingId_unique').on(table.userId, table.listingId),
]);

export const userSuperlike = pgTable('user_superlike', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  listingId: text('listing_id').notNull(), // will reference car_listing table
  
  // For analytics
  addedFrom: text('added_from'), // 'search', 'listing_page', 'feed', etc.
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('user_superlike_userId_createdAt_idx').on(table.userId, table.createdAt.desc()),
  index('user_superlike_listingId_idx').on(table.listingId),
  uniqueIndex('user_superlike_userId_listingId_unique').on(table.userId, table.listingId),
]);

export const userSuperlikeQuota = pgTable('user_superlike_quota', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }).unique(),
  
  currentMonthSuperlikesUsed: integer('current_month_superlikes_used').default(0).notNull(),
  maxSuperlikesPerMonth: integer('max_superlikes_per_month').default(5).notNull(),
  
  periodStartDate: timestamp('period_start_date').defaultNow().notNull(),
  periodEndDate: timestamp('period_end_date').notNull(),
  lastResetAt: timestamp('last_reset_at').defaultNow().notNull(),
  
  totalSuperlikesUsed: integer('total_superlikes_used').default(0).notNull(),
  
  isPremium: boolean('is_premium').default(false).notNull(),
  premiumSuperlikesBonus: integer('premium_superlikes_bonus').default(0),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('user_superlike_quota_userId_idx').on(table.userId),
  index('user_superlike_quota_periodEndDate_idx').on(table.periodEndDate),
]);
