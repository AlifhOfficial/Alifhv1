/**
 * User Profile Schema
 * 
 * Extended user profile information for the Alifh platform
 * Includes personal details, location, preferences, and activity tracking
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

// Enums
export const favoriteTypeEnum = pgEnum('favorite_type', ['favorite', 'superlike']);

/**
 * User Profile Table
 * Extends the base user table with additional profile information
 * Separate ID allows user to exist without profile (partial signup flows)
 */
export const userProfile = pgTable('user_profile', {
  // Primary identification (separate from user.id)
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .unique() // One profile per user
    .references(() => user.id, { onDelete: 'cascade' }),
  
  // Contact Information
  phone: text('phone'),
  
  // Personal Information
  firstName: text('first_name'),
  lastName: text('last_name'),
  avatar: text('avatar'),
  description: text('description'),
  
  // Account Status
  status: text('status').default('active').notNull(), // active, inactive, suspended
  
  // KYC Verification
  kycVerified: boolean('kyc_verified').default(false).notNull(),
  kycVerifiedAt: timestamp('kyc_verified_at'),
  
  // Badges and Tags (e.g., ["verified_seller", "premium_member"])
  badges: jsonb('badges').$type<string[]>().default([]),
  tags: jsonb('tags').$type<string[]>().default([]),
  
  // Location Information
  locationLat: doublePrecision('location_lat'),
  locationLng: doublePrecision('location_lng'),
  locationCity: text('location_city'),
  locationEmirate: text('location_emirate'),
  
  // Business Metrics
  inventoryCount: integer('inventory_count').default(0).notNull(),
  carsSold: integer('cars_sold').default(0).notNull(),
  
  // Activity Tracking
  avgResponseTime: integer('avg_response_time'), // in minutes
  lastActiveAt: timestamp('last_active_at'),
  
  // Preferences and Settings
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
  
  // Consignment Mode
  consignmentMode: boolean('consignment_mode').default(false).notNull(),
  
  // Timestamps
  memberSince: timestamp('member_since').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('user_profile_userId_idx').on(table.userId),
  index('user_profile_phone_idx').on(table.phone),
  index('user_profile_location_idx').on(table.locationCity, table.locationEmirate),
  index('user_profile_kyc_verified_idx').on(table.kycVerified),
  index('user_profile_status_idx').on(table.status),
]);

/**
 * KYC Records Table
 * Stores KYC verification history and documents
 */
export const kycRecord = pgTable('kyc_record', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  
  // KYC Status
  status: text('status').notNull(), // pending, approved, rejected, expired
  type: text('type').notNull(), // individual, business
  
  // Document Information
  documentType: text('document_type'), // passport, emirates_id, driving_license
  documentNumber: text('document_number'),
  documentFrontUrl: text('document_front_url'),
  documentBackUrl: text('document_back_url'),
  selfieUrl: text('selfie_url'),
  
  // Verification Details
  verifiedBy: text('verified_by'), // admin user id
  verifiedAt: timestamp('verified_at'),
  rejectionReason: text('rejection_reason'),
  expiresAt: timestamp('expires_at'),
  
  // Additional Data
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('kyc_record_userId_idx').on(table.userId),
  index('kyc_record_status_idx').on(table.status),
]);

/**
 * User Favorites Table
 * Tracks user favorites (unlimited)
 * Users can favorite as many listings as they want
 */
export const userFavorite = pgTable('user_favorite', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  listingId: text('listing_id').notNull(), // will reference car_listing table
  
  // For analytics
  addedFrom: text('added_from'), // 'search', 'listing_page', 'feed', etc.
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('user_favorite_userId_idx').on(table.userId),
  index('user_favorite_listingId_idx').on(table.listingId),
  index('user_favorite_userId_listingId_idx').on(table.userId, table.listingId),
  index('user_favorite_createdAt_idx').on(table.createdAt),
]);

/**
 * User Superlikes Table
 * Tracks user superlikes (limited to 5 per month)
 * Users can have both a favorite AND a superlike on the same listing
 */
export const userSuperlike = pgTable('user_superlike', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  listingId: text('listing_id').notNull(), // will reference car_listing table
  
  // For analytics
  addedFrom: text('added_from'), // 'search', 'listing_page', 'feed', etc.
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('user_superlike_userId_idx').on(table.userId),
  index('user_superlike_listingId_idx').on(table.listingId),
  index('user_superlike_userId_listingId_idx').on(table.userId, table.listingId),
  index('user_superlike_createdAt_idx').on(table.createdAt),
]);

/**
 * User Superlike Quota Table
 * Tracks monthly superlike usage and limits
 * Each user gets 5 superlikes per month
 */
export const userSuperlikeQuota = pgTable('user_superlike_quota', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }).unique(),
  
  // Monthly Tracking (rolling 30 days)
  currentMonthSuperlikesUsed: integer('current_month_superlikes_used').default(0).notNull(),
  maxSuperlikesPerMonth: integer('max_superlikes_per_month').default(50).notNull(),
  
  // Current Period
  periodStartDate: timestamp('period_start_date').defaultNow().notNull(),
  periodEndDate: timestamp('period_end_date').notNull(),
  lastResetAt: timestamp('last_reset_at').defaultNow().notNull(),
  
  // Lifetime Stats
  totalSuperlikesUsed: integer('total_superlikes_used').default(0).notNull(),
  
  // Premium Features (future)
  isPremium: boolean('is_premium').default(false).notNull(), // Premium users might get more
  premiumSuperlikesBonus: integer('premium_superlikes_bonus').default(0), // Extra superlikes for premium
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('user_superlike_quota_userId_idx').on(table.userId),
  index('user_superlike_quota_periodEndDate_idx').on(table.periodEndDate),
]);
