import { 
  pgTable, 
  text, 
  timestamp, 
  boolean, 
  integer,
  doublePrecision,
  jsonb,
  index,
  unique,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { user } from './auth';

export const partnerStatusEnum = pgEnum('partner_status', ['pending', 'active', 'suspended', 'cancelled']);
export const partnerTierEnum = pgEnum('partner_tier', ['standard', 'gold', 'platinum', 'black']);
export const partnerTypeEnum = pgEnum('partner_type', ['dealer', 'showroom', 'multi_brand', 'rental', 'broker', 'other']);
export const partnerRequestStatusEnum = pgEnum('partner_request_status', ['pending', 'approved', 'rejected']);
export const staffRoleEnum = pgEnum('staff_role', ['owner', 'admin', 'sales', 'viewer']);
export const staffStatusEnum = pgEnum('staff_status', ['active', 'invited', 'suspended', 'left']);

export const partner = pgTable('partner', {
  id: text('id').primaryKey(),
  companyNameLegal: text('company_name_legal').notNull(),
  brandName: text('brand_name').notNull(),
  tradeLicense: text('trade_license').notNull().unique(),
  vatNumber: text('vat_number'),
  tradeLicenseExpiry: timestamp('trade_license_expiry').notNull(),
  tradeLicenseDocumentUrl: text('trade_license_document_url'),
  status: partnerStatusEnum('status').default('pending').notNull(),
  tier: partnerTierEnum('tier').default('standard').notNull(),
  partnerType: partnerTypeEnum('partner_type').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull(),
  website: text('website'),
  address: text('address'),
  emirate: text('emirate'),
  city: text('city'),
  locationLat: doublePrecision('location_lat'),
  locationLng: doublePrecision('location_lng'),
  showroomCount: integer('showroom_count').default(1).notNull(),
  logo: text('logo'),
  heroImage: text('hero_image'),
  coverImage: text('cover_image'),
  galleryImages: jsonb('gallery_images').$type<string[]>().default([]),
  description: text('description'),
  specialties: jsonb('specialties').$type<string[]>().default([]),
  experienceYears: integer('experience_years'),
  foundedYear: integer('founded_year'),
  googleReviewUrl: text('google_review_url'),
  googleRating: doublePrecision('google_rating'),
  googleReviewCount: integer('google_review_count').default(0),
  platformRating: doublePrecision('platform_rating'),
  platformReviewCount: integer('platform_review_count').default(0),
  customerSatisfaction: doublePrecision('customer_satisfaction'),
  isVerified: boolean('is_verified').default(false).notNull(),
  verifiedAt: timestamp('verified_at'),
  verifiedBy: text('verified_by').references(() => user.id, { onDelete: 'set null' }),
  badges: jsonb('badges').$type<string[]>().default([]),
  tags: jsonb('tags').$type<string[]>().default([]),
  features: jsonb('features').$type<{
    homeDelivery: boolean;
    testDriveAvailable: boolean;
    financing: boolean;
    tradeIn: boolean;
    warranty: boolean;
    insurance: boolean;
    registration: boolean;
    exportAssistance: boolean;
  }>().default({
    homeDelivery: false,
    testDriveAvailable: true,
    financing: false,
    tradeIn: false,
    warranty: false,
    insurance: false,
    registration: false,
    exportAssistance: false,
  }).notNull(),
  businessHours: jsonb('business_hours').$type<{
    [key: string]: { open: string; close: string; closed?: boolean };
  }>().default({
    monday: { open: '09:00', close: '18:00' },
    tuesday: { open: '09:00', close: '18:00' },
    wednesday: { open: '09:00', close: '18:00' },
    thursday: { open: '09:00', close: '18:00' },
    friday: { closed: true, open: '', close: '' },
    saturday: { open: '09:00', close: '18:00' },
    sunday: { open: '09:00', close: '18:00' },
  }),
  commissionRate: doublePrecision('commission_rate').default(0).notNull(),
  subscriptionTier: text('subscription_tier').default('basic'),
  subscriptionExpiresAt: timestamp('subscription_expires_at'),
  paymentTerms: text('payment_terms').default('net30'),
  notificationPreferences: jsonb('notification_preferences').$type<{
    emailNewLead: boolean;
    emailBooking: boolean;
    emailMessage: boolean;
    emailSale: boolean;
    emailReview: boolean;
    emailMarketing: boolean;
    smsNewLead: boolean;
    smsBooking: boolean;
  }>().default({
    emailNewLead: true,
    emailBooking: true,
    emailMessage: true,
    emailSale: true,
    emailReview: true,
    emailMarketing: false,
    smsNewLead: true,
    smsBooking: true,
  }).notNull(),
  accountManagerId: text('account_manager_id').references(() => user.id, { onDelete: 'set null' }),
  primaryContactId: text('primary_contact_id').references(() => partnerStaff.id, { onDelete: 'set null' }),
  lastAuditAt: timestamp('last_audit_at'),
  nextAuditAt: timestamp('next_audit_at'),
  complianceScore: integer('compliance_score'),
  
  // Analytics Cache (updated via background jobs)
  activeListingsCount: integer('active_listings_count').default(0).notNull(),
  totalInventoryValue: integer('total_inventory_value').default(0).notNull(),
  avgListingPrice: integer('avg_listing_price').default(0).notNull(),
  soldThisMonth: integer('sold_this_month').default(0).notNull(),
  revenueThisMonth: integer('revenue_this_month').default(0).notNull(),
  conversionRate: doublePrecision('conversion_rate').default(0).notNull(),
  analyticsLastUpdated: timestamp('analytics_last_updated'),
  
  submittedAt: timestamp('submitted_at'),
  approvedAt: timestamp('approved_at'),
  approvedBy: text('approved_by').references(() => user.id, { onDelete: 'set null' }),
  rejectedAt: timestamp('rejected_at'),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  activatedAt: timestamp('activated_at'), // When partner went live
  suspendedAt: timestamp('suspended_at'),
  cancelledAt: timestamp('cancelled_at'),
}, (table) => [
  index('partner_email_idx').on(table.email),
  index('partner_phone_idx').on(table.phone),
  index('partner_trade_license_idx').on(table.tradeLicense),
  index('partner_status_idx').on(table.status),
  index('partner_tier_idx').on(table.tier),
  index('partner_is_verified_idx').on(table.isVerified),
  index('partner_emirate_idx').on(table.emirate),
  index('partner_city_idx').on(table.city),
  index('partner_location_idx').on(table.locationLat, table.locationLng),
  index('partner_primaryContactId_idx').on(table.primaryContactId),
  index('partner_approvedBy_idx').on(table.approvedBy),
  index('partner_accountManagerId_idx').on(table.accountManagerId),
  index('partner_verifiedBy_idx').on(table.verifiedBy),
]);

export const partnerStaff = pgTable('partner_staff', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partner.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  role: staffRoleEnum('role').notNull(),
  isOwner: boolean('is_owner').default(false).notNull(),
  title: text('title'),
  department: text('department'),
  isPrimaryContact: boolean('is_primary_contact').default(false).notNull(),
  status: staffStatusEnum('status').default('active').notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  invitedAt: timestamp('invited_at'),
  invitedBy: text('invitedBy'),
  acceptedAt: timestamp('accepted_at'),
  leftAt: timestamp('left_at'),
  leftReason: text('left_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('partner_staff_partnerId_idx').on(table.partnerId),
  index('partner_staff_userId_idx').on(table.userId),
  index('partner_staff_status_idx').on(table.status),
  index('partner_staff_role_idx').on(table.role),
  index('partner_staff_userId_status_idx').on(table.userId, table.status),
  unique('partner_staff_partnerId_userId_unique').on(table.partnerId, table.userId), // One person, one seat per company
]);

/**
 * Partner Reviews Table
 * Customer reviews and ratings for Partners (companies, not individual staff)
 */
export const partnerReview = pgTable('partner_review', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partner.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  title: text('title'),
  review: text('review'),
  communicationRating: integer('communication_rating'),
  vehicleConditionRating: integer('vehicle_condition_rating'),
  processRating: integer('process_rating'),
  isVerifiedPurchase: boolean('is_verified_purchase').default(false).notNull(),
  purchaseId: text('purchase_id'),
  partnerResponse: text('partner_response'),
  respondedAt: timestamp('responded_at'),
  status: text('status').default('published').notNull(),
  moderatedBy: text('moderated_by'),
  moderatedAt: timestamp('moderated_at'),
  helpfulCount: integer('helpful_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('partner_review_partnerId_idx').on(table.partnerId),
  index('partner_review_userId_idx').on(table.userId),
  index('partner_review_rating_idx').on(table.rating),
  index('partner_review_status_idx').on(table.status),
]);

/**
 * Partner Request Table
 * Tracks partner applications before approval
 * Separate from Partner table to maintain clean approval workflow
 */
export const partnerRequest = pgTable('partner_request', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  
  // Required for signup - Legal/Business Registration Info
  companyNameLegal: text('company_name_legal').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  tradeLicense: text('trade_license').notNull(),
  tradeLicenseExpiry: timestamp('trade_license_expiry').notNull(),
  partnerType: partnerTypeEnum('partner_type').notNull(),
  vatNumber: text('vat_number'), // Optional - null if not available
  
  // Optional - can be added later in profile after approval
  brandName: text('brand_name'),
  tradeLicenseDocumentUrl: text('trade_license_document_url'),
  website: text('website'),
  address: text('address'),
  emirate: text('emirate'),
  description: text('description'),
  experienceYears: integer('experience_years'),
  specialties: jsonb('specialties').$type<string[]>().default([]),
  status: partnerRequestStatusEnum('status').default('pending').notNull(),
  reviewedBy: text('reviewed_by').references(() => user.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at'),
  rejectionReason: text('rejection_reason'),
  internalNotes: text('internal_notes'),
  partnerId: text('partner_id').references(() => partner.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('partner_request_userId_idx').on(table.userId),
  index('partner_request_status_idx').on(table.status),
  index('partner_request_reviewedBy_idx').on(table.reviewedBy),
  index('partner_request_tradeLicense_idx').on(table.tradeLicense),
  index('partner_request_createdAt_idx').on(table.createdAt),
]);

/**
 * Audit Log Table
 * Comprehensive audit trail for compliance and debugging
 * Tracks all critical actions across the platform
 */
export const auditLog = pgTable('audit_log', {
  id: text('id').primaryKey(),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  oldValues: jsonb('old_values').$type<Record<string, any>>(),
  newValues: jsonb('new_values').$type<Record<string, any>>(),
  severity: text('severity').default('info').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('audit_log_userId_idx').on(table.userId),
  index('audit_log_entityType_idx').on(table.entityType),
  index('audit_log_entityId_idx').on(table.entityId),
  index('audit_log_action_idx').on(table.action),
  index('audit_log_createdAt_idx').on(table.createdAt),
  index('audit_log_severity_idx').on(table.severity),
  index('audit_log_entityType_entityId_idx').on(table.entityType, table.entityId),
]);

