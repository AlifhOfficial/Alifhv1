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
  kycExpiryDate: timestamp('kyc_expiry_date'), // When KYC verification expires (1 year from verification)
  kycStatus: text('kyc_status').$type<'none' | 'pending' | 'approved' | 'rejected'>().default('none').notNull(),
  
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
  trustScore: integer('trust_score').default(0),
  
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
  
  consignmentMode: boolean('consignment_mode').default(true).notNull(),
  
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
  
  status: text('status').notNull(), // 'pending' | 'approved' | 'rejected' | 'expired'
  type: text('type').notNull(), // 'manual' | 'didit'
  
  // Didit integration fields
  diditSessionId: text('didit_session_id'),
  diditSessionUrl: text('didit_session_url'),
  diditSessionNumber: integer('didit_session_number'),
  diditDecision: jsonb('didit_decision').$type<Record<string, any>>(),
  rawResponse: text('raw_response'), // Full webhook payload for debugging
  
  // Document info (from Didit id_verification)
  documentType: text('document_type'), // 'Driver\'s License', 'Passport', 'Identity Card'
  documentNumber: text('document_number'),
  documentHash: text('document_hash'), // SHA-256 hash of normalized doc number for O(1) duplicate lookup
  documentCountry: text('document_country'), // issuing_state_name
  documentCountryCode: text('document_country_code'), // issuing_state (ARE, USA, etc.)
  documentExpiryDate: text('document_expiry_date'),
  documentIssueDate: text('document_issue_date'),
  documentFrontUrl: text('document_front_url'),
  documentBackUrl: text('document_back_url'),
  selfieUrl: text('selfie_url'), // portrait_image
  
  // Extracted personal data from document
  extractedFirstName: text('extracted_first_name'),
  extractedLastName: text('extracted_last_name'),
  extractedFullName: text('extracted_full_name'),
  extractedDateOfBirth: text('extracted_date_of_birth'),
  extractedAge: integer('extracted_age'),
  extractedGender: text('extracted_gender'),
  extractedNationality: text('extracted_nationality'),
  extractedNationalityCode: text('extracted_nationality_code'),
  
  // Face match verification (from Didit face_match)
  faceMatchScore: doublePrecision('face_match_score'),
  faceMatchStatus: text('face_match_status'),
  faceSourceImage: text('face_source_image'),
  faceTargetImage: text('face_target_image'),
  
  // Liveness check (from Didit liveness)
  livenessScore: doublePrecision('liveness_score'),
  livenessStatus: text('liveness_status'),
  livenessMethod: text('liveness_method'), // 'PASSIVE' | 'ACTIVE'
  livenessAgeEstimation: doublePrecision('liveness_age_estimation'),
  livenessReferenceImage: text('liveness_reference_image'),
  
  // IP Analysis (from Didit ip_analysis)
  ipAddress: text('ip_address'),
  ipCity: text('ip_city'),
  ipCountry: text('ip_country'),
  ipCountryCode: text('ip_country_code'),
  ipLatitude: doublePrecision('ip_latitude'),
  ipLongitude: doublePrecision('ip_longitude'),
  isVpnOrTor: boolean('is_vpn_or_tor'),
  isDataCenter: boolean('is_data_center'),
  devicePlatform: text('device_platform'), // 'desktop' | 'mobile'
  deviceBrand: text('device_brand'),
  deviceBrowser: text('device_browser'),
  
  // Verification status
  verifiedBy: text('verified_by'), // 'didit-automated' | admin user id
  verifiedAt: timestamp('verified_at'),
  rejectionReason: text('rejection_reason'),
  warnings: jsonb('warnings').$type<Array<{ risk: string; description: string }>>(),
  expiresAt: timestamp('expires_at'),
  
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('kyc_record_userId_idx').on(table.userId),
  index('kyc_record_status_idx').on(table.status),
  index('kyc_record_status_createdAt_idx').on(table.status, table.createdAt.desc()),
  index('kyc_record_diditSessionId_idx').on(table.diditSessionId),
  index('kyc_record_documentHash_idx').on(table.documentHash), // O(1) duplicate lookup
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
