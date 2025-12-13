/**
 * Partner Schema
 * 
 * ===== ARCHITECTURE =====
 * Clean 3-layer separation:
 * 
 * 1. USER (Person)
 *    - A human being with email, phone, password, avatar, etc.
 *    - Lives in: `user` + `user_profile` tables
 *    - Examples: buyer, seller, partner owner, staff member, admin
 * 
 * 2. PARTNER (Company)
 *    - A business entity (showroom/dealership)
 *    - Has: trade license, logo, brand name, emirate, ratings, etc.
 *    - This is what buyers see publicly + internal business metrics
 *    - Lives in: `partner` table
 * 
 * 3. PARTNER_STAFF (Seat/Membership)
 *    - Connects a User to a Partner with a role
 *    - Has: role (OWNER/ADMIN/SALES), permissions, performance metrics
 *    - Lives in: `partner_staff` table
 * 
 * ===== FLOW =====
 * - Partner fills form → Admin approves → Partner status = 'active'
 * - Partner can add staff → Creates PartnerStaff rows
 * - Each staff is just a User with a PartnerStaff relationship
 * - NO separate "staff profile" table needed
 * 
 * ===== EXAMPLE =====
 * Company: "Luxury Motors LLC" (Partner)
 *   ├─ Ahmed (User) → PartnerStaff(role=OWNER, isPrimaryContact=true)
 *   ├─ Sarah (User) → PartnerStaff(role=ADMIN, canManageTeam=true)
 *   └─ Mohammed (User) → PartnerStaff(role=SALES, respondToLeads=true)
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
  unique,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { user } from './auth';

// Enums
export const partnerStatusEnum = pgEnum('partner_status', ['pending', 'active', 'suspended', 'cancelled']);
export const partnerTierEnum = pgEnum('partner_tier', ['standard', 'gold', 'platinum', 'black']);
export const partnerRequestStatusEnum = pgEnum('partner_request_status', ['pending', 'approved', 'rejected']);
export const staffRoleEnum = pgEnum('staff_role', ['owner', 'admin', 'sales', 'viewer']);
export const staffStatusEnum = pgEnum('staff_status', ['active', 'invited', 'suspended', 'left']);

/**
 * Partner Table (Company/Business Entity)
 * This is what buyers see publicly + internal business metrics
 */
export const partner = pgTable('partner', {
  // Primary identification
  id: text('id').primaryKey(),
  
  // Company Legal Information
  companyNameLegal: text('company_name_legal').notNull(), // Registered legal name
  brandName: text('brand_name').notNull(), // Public display name
  tradeLicense: text('trade_license').notNull().unique(), // UAE trade license number
  tradeLicenseExpiry: timestamp('trade_license_expiry'),
  tradeLicenseDocumentUrl: text('trade_license_document_url'),
  
  // Account Status & Tier
  status: partnerStatusEnum('status').default('pending').notNull(),
  tier: partnerTierEnum('tier').default('standard').notNull(),
  
  // Contact Information (Company-level, not personal)
  email: text('email').notNull().unique(), // Company email
  phone: text('phone').notNull(), // Company phone
  website: text('website'),
  
  // Location Information
  address: text('address'),
  emirate: text('emirate'), // Dubai, Abu Dhabi, Sharjah, etc.
  locationLat: doublePrecision('location_lat'),
  locationLng: doublePrecision('location_lng'),
  showroomCount: integer('showroom_count').default(1).notNull(),
  
  // Branding & Media
  logo: text('logo'),
  heroImage: text('hero_image'),
  coverImage: text('cover_image'),
  galleryImages: jsonb('gallery_images').$type<string[]>().default([]),
  
  // Business Information
  description: text('description'),
  specialties: jsonb('specialties').$type<string[]>().default([]), // ["luxury", "sports", "electric"]
  experienceYears: integer('experience_years'),
  foundedYear: integer('founded_year'),
  
  // External Ratings (Google, etc.)
  googleReviewUrl: text('google_review_url'),
  googleRating: doublePrecision('google_rating'), // 0-5
  googleReviewCount: integer('google_review_count').default(0),
  
  // Platform Performance Metrics (Company-level, not individual staff)
  platformRating: doublePrecision('platform_rating'), // Average 0-5 from platform reviews
  platformReviewCount: integer('platform_review_count').default(0),
  customerSatisfaction: doublePrecision('customer_satisfaction'), // 0-100 internal score
  
  // Inventory & Sales (Company totals)
  totalInventory: integer('total_inventory').default(0).notNull(),
  activeListings: integer('active_listings').default(0).notNull(),
  soldListings: integer('sold_listings').default(0).notNull(),
  totalSales: integer('total_sales').default(0).notNull(), // Total count of sales
  totalRevenue: integer('total_revenue').default(0).notNull(), // In AED cents
  
  // Response Metrics (Company average across all staff)
  avgResponseTime: integer('avg_response_time'), // Minutes
  responseRate: doublePrecision('response_rate'), // Percentage 0-100
  
  // Conversion & Retention Metrics
  leadConversionRate: doublePrecision('lead_conversion_rate'), // % of leads → sales
  repeatCustomerRate: doublePrecision('repeat_customer_rate'), // % repeat buyers
  avgDealValue: integer('avg_deal_value').default(0), // Average sale price in AED cents
  
  // Monthly Performance Tracking (Rolling 30 days)
  monthlyViews: integer('monthly_views').default(0),
  monthlyLeads: integer('monthly_leads').default(0),
  monthlySales: integer('monthly_sales').default(0),
  monthlyRevenue: integer('monthly_revenue').default(0),
  
  // Team Size (automatically calculated from PartnerStaff)
  teamSize: integer('team_size').default(0),
  activeStaffCount: integer('active_staff_count').default(0),
  
  // Trust & Verification
  isVerified: boolean('is_verified').default(false).notNull(),
  verifiedAt: timestamp('verified_at'),
  verifiedBy: text('verified_by')
    .references(() => user.id, { onDelete: 'set null' }), // Admin user ID
  
  // Badges & Tags
  badges: jsonb('badges').$type<string[]>().default([]), // ["verified_dealer", "top_rated", "fast_responder"]
  tags: jsonb('tags').$type<string[]>().default([]), // ["luxury_specialist", "electric_vehicles"]
  
  // Services & Features Offered
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
  
  // Business Hours
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
  
  // Financial Settings
  commissionRate: doublePrecision('commission_rate').default(0).notNull(), // Platform commission %
  subscriptionTier: text('subscription_tier').default('basic'), // basic, pro, enterprise
  subscriptionExpiresAt: timestamp('subscription_expires_at'),
  paymentTerms: text('payment_terms').default('net30'), // Payment schedule
  
  // Notification Preferences (Company-level)
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
  
  // Account Management
  accountManagerId: text('account_manager_id')
    .references(() => user.id, { onDelete: 'set null' }), // Alifh account manager assigned
  primaryContactId: text('primary_contact_id')
    .references(() => partnerStaff.id, { onDelete: 'set null' }), // PartnerStaff ID of main contact
  
  // Quality & Compliance
  lastAuditAt: timestamp('last_audit_at'),
  nextAuditAt: timestamp('next_audit_at'),
  complianceScore: integer('compliance_score'), // 0-100 internal quality score
  
  // Approval Workflow
  submittedAt: timestamp('submitted_at'),
  approvedAt: timestamp('approved_at'),
  approvedBy: text('approved_by')
    .references(() => user.id, { onDelete: 'set null' }), // Admin user ID who approved
  rejectedAt: timestamp('rejected_at'),
  rejectionReason: text('rejection_reason'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  activatedAt: timestamp('activated_at'), // When partner went live
  suspendedAt: timestamp('suspended_at'),
  cancelledAt: timestamp('cancelled_at'),
}, (table) => [
  // Contact & Identity
  index('partner_email_idx').on(table.email),
  index('partner_phone_idx').on(table.phone),
  index('partner_trade_license_idx').on(table.tradeLicense),
  
  // Status & Classification
  index('partner_status_idx').on(table.status),
  index('partner_tier_idx').on(table.tier),
  index('partner_is_verified_idx').on(table.isVerified),
  
  // Location
  index('partner_emirate_idx').on(table.emirate),
  index('partner_location_idx').on(table.locationLat, table.locationLng),
  
  // Foreign Keys (Critical for performance)
  index('partner_primaryContactId_idx').on(table.primaryContactId),
  index('partner_approvedBy_idx').on(table.approvedBy),
  index('partner_accountManagerId_idx').on(table.accountManagerId),
  index('partner_verifiedBy_idx').on(table.verifiedBy),
]);

/**
 * Partner Staff Table (The "Seat" / Membership)
 * Connects a User (person) to a Partner (company) with a role
 * 
 * This is NOT a profile - it's the relationship between person and company
 * The person's profile data lives in User + UserProfile tables
 */
export const partnerStaff = pgTable('partner_staff', {
  id: text('id').primaryKey(),
  
  // The Relationship
  partnerId: text('partner_id').notNull().references(() => partner.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  
  // Role & Position
  role: staffRoleEnum('role').notNull(), // owner, admin, sales, viewer
  title: text('title'), // "Sales Executive", "Showroom Manager", "Senior Advisor", etc.
  department: text('department'), // "Sales", "Marketing", "Operations", etc.
  
  // Primary Contact Flag
  isPrimaryContact: boolean('is_primary_contact').default(false).notNull(), // Main point of contact for Alifh
  
  // Permissions (Granular access control)
  permissions: jsonb('permissions').$type<{
    manageListings: boolean;      // Can create/edit/delete listings
    manageTeam: boolean;           // Can invite/remove staff
    viewAnalytics: boolean;        // Can see business metrics
    manageBookings: boolean;       // Can handle test drives/viewings
    respondToLeads: boolean;       // Can respond to inquiries
    manageFinancials: boolean;     // Can see revenue/commission data
    manageSettings: boolean;       // Can change company settings
    exportData: boolean;           // Can export reports
  }>().default({
    manageListings: true,
    manageTeam: false,
    viewAnalytics: false,
    manageBookings: true,
    respondToLeads: true,
    manageFinancials: false,
    manageSettings: false,
    exportData: false,
  }).notNull(),
  
  // Status
  status: staffStatusEnum('status').default('active').notNull(),
  
  // Activity Tracking (Staff-specific metrics)
  leadsHandled: integer('leads_handled').default(0).notNull(),
  leadsConverted: integer('leads_converted').default(0).notNull(),
  dealsClosed: integer('deals_closed').default(0).notNull(),
  totalSalesValue: integer('total_sales_value').default(0).notNull(), // In AED cents
  avgResponseTime: integer('avg_response_time'), // Minutes for this specific staff
  lastActiveAt: timestamp('last_active_at'),
  
  // Performance Ratings (Optional: for internal use)
  performanceScore: doublePrecision('performance_score'), // 0-100 internal rating
  customerRating: doublePrecision('customer_rating'), // 0-5 from customer feedback
  
  // Employment Timeline
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  invitedAt: timestamp('invited_at'),
  invitedBy: text('invited_by'), // User ID who sent invitation
  acceptedAt: timestamp('accepted_at'),
  leftAt: timestamp('left_at'),
  leftReason: text('left_reason'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('partner_staff_partnerId_idx').on(table.partnerId),
  index('partner_staff_userId_idx').on(table.userId),
  index('partner_staff_status_idx').on(table.status),
  index('partner_staff_role_idx').on(table.role),
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
  
  // Review Content
  rating: integer('rating').notNull(), // 1-5 stars
  title: text('title'),
  review: text('review'),
  
  // Review Categories (optional detailed ratings)
  communicationRating: integer('communication_rating'), // 1-5
  vehicleConditionRating: integer('vehicle_condition_rating'), // 1-5
  processRating: integer('process_rating'), // 1-5
  
  // Verification
  isVerifiedPurchase: boolean('is_verified_purchase').default(false).notNull(),
  purchaseId: text('purchase_id'), // Reference to actual transaction
  
  // Response
  partnerResponse: text('partner_response'),
  respondedAt: timestamp('responded_at'),
  
  // Moderation
  status: text('status').default('published').notNull(), // pending, published, hidden, flagged
  moderatedBy: text('moderated_by'),
  moderatedAt: timestamp('moderated_at'),
  
  // Helpful votes
  helpfulCount: integer('helpful_count').default(0).notNull(),
  
  // Timestamps
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
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  
  // Application Data (what the applicant submits)
  companyNameLegal: text('company_name_legal').notNull(),
  brandName: text('brand_name').notNull(),
  tradeLicense: text('trade_license').notNull(),
  tradeLicenseDocumentUrl: text('trade_license_document_url'),
  tradeLicenseExpiry: timestamp('trade_license_expiry'),
  
  // Contact Information
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  website: text('website'),
  address: text('address'),
  emirate: text('emirate'),
  
  // Business Details
  description: text('description'),
  experienceYears: integer('experience_years'),
  specialties: jsonb('specialties').$type<string[]>().default([]),
  
  // Status & Review
  status: partnerRequestStatusEnum('status').default('pending').notNull(),
  reviewedBy: text('reviewed_by')
    .references(() => user.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at'),
  rejectionReason: text('rejection_reason'),
  internalNotes: text('internal_notes'), // Admin notes during review
  
  // If approved, link to created partner
  partnerId: text('partner_id')
    .references(() => partner.id, { onDelete: 'set null' }),
  
  // Timestamps
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
  
  // What happened
  action: text('action').notNull(), // 'user.created', 'partner.approved', 'listing.deleted', etc.
  entityType: text('entity_type').notNull(), // 'user', 'partner', 'listing', 'booking', etc.
  entityId: text('entity_id').notNull(),
  
  // Who did it
  userId: text('user_id')
    .references(() => user.id, { onDelete: 'set null' }),
  
  // Context
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  
  // Changes (for update actions)
  oldValues: jsonb('old_values').$type<Record<string, any>>(),
  newValues: jsonb('new_values').$type<Record<string, any>>(),
  
  // Severity for filtering
  severity: text('severity').default('info').notNull(), // info, warning, critical
  
  // Timestamp
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('audit_log_userId_idx').on(table.userId),
  index('audit_log_entityType_idx').on(table.entityType),
  index('audit_log_entityId_idx').on(table.entityId),
  index('audit_log_action_idx').on(table.action),
  index('audit_log_createdAt_idx').on(table.createdAt),
  index('audit_log_severity_idx').on(table.severity),
  // Composite index for common query pattern
  index('audit_log_entityType_entityId_idx').on(table.entityType, table.entityId),
]);

