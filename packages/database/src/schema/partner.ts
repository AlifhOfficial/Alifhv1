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
export const partnerTypeEnum = pgEnum('partner_type', ['car_dealer', 'showroom']);
export const companySizeEnum = pgEnum('company_size', ['small', 'medium', 'large', 'enterprise']);
export const partnerRequestStatusEnum = pgEnum('partner_request_status', ['pending', 'approved', 'rejected']);
export const staffRoleEnum = pgEnum('staff_role', ['owner', 'admin', 'sales', 'viewer', 'staff']);
export const staffStatusEnum = pgEnum('staff_status', ['active', 'invited', 'suspended', 'left']);

export const partner = pgTable('partner', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(), // SEO-friendly URL slug (e.g., 'pox-cars')
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
  
  // Admin contact info (fallback when staff doesn't respond)
  adminName: text('admin_name'),
  adminPhone: text('admin_phone'),
  adminPhoneVerified: boolean('admin_phone_verified').default(false).notNull(),
  tollNumber: text('toll_number'), // Toll-free number, no verification needed
  
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
  
  // Video Support
  showroomVideoUrl: text('showroom_video_url'), // Main showroom tour/promo video
  showroomVideoThumbnail: text('showroom_video_thumbnail'), // Custom thumbnail for video
  
  description: text('description'),
  specialties: jsonb('specialties').$type<string[]>().default([]),
  experienceYears: integer('experience_years'),
  foundedYear: integer('founded_year'),
  googleReviewUrl: text('google_review_url'),
  googlePlaceId: text('google_place_id'), // Extracted from googleReviewUrl
  googleReviewsSyncedAt: timestamp('google_reviews_synced_at'), // Last sync timestamp
  googleRating: doublePrecision('google_rating'),
  googleReviewCount: integer('google_review_count').default(0),
  platformRating: doublePrecision('platform_rating'),
  platformReviewCount: integer('platform_review_count').default(0),
  customerSatisfaction: doublePrecision('customer_satisfaction'),
  isVerified: boolean('is_verified').default(false).notNull(),
  verifiedAt: timestamp('verified_at'),
  verifiedBy: text('verified_by').references(() => user.id, { onDelete: 'set null' }),
  badges: jsonb('badges').$type<string[]>().default([]), // e.g., ["Revvup Certified", "BLK Member", "ISO 9001"]
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
  
  // Black Listings Quota
  // Black tier: max 5 active black listings, Other tiers: max 1
  blackListingQuota: integer('black_listing_quota').default(1).notNull(),
  activeBlackListingsCount: integer('active_black_listings_count').default(0).notNull(),
  
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
  index('partner_slug_idx').on(table.slug),
  index('partner_email_idx').on(table.email),
  index('partner_phone_idx').on(table.phone),
  index('partner_trade_license_idx').on(table.tradeLicense),
  index('partner_status_idx').on(table.status),
  index('partner_status_createdAt_idx').on(table.status, table.createdAt), // Composite for list query
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
  
  // Staff Profile - Work identity (separate from personal)
  displayName: text('display_name'), // Preferred name for client interactions (code names common in UAE)
  workPhone: text('work_phone'), // Dedicated work phone for calls
  usePersonalPhone: boolean('use_personal_phone').default(false).notNull(), // Use personal phone instead of work phone
  workPhoneVerified: boolean('work_phone_verified').default(false).notNull(), // Track if work phone is verified
  
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
  // ⚡ Optimized composite index for auth check: getActivePartnerStaffMembershipByUserIdAndPartnerId
  index('partner_staff_userId_partnerId_status_idx').on(table.userId, table.partnerId, table.status),
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
  tradeLicense: text('trade_license').notNull(),
  tradeLicenseExpiry: timestamp('trade_license_expiry').notNull(),
  tradeLicenseDocumentUrl: text('trade_license_document_url').notNull(),
  vatNumber: text('vat_number').notNull(),
  partnerType: partnerTypeEnum('partner_type').notNull(),
  companySize: companySizeEnum('company_size').notNull(),
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

// ============================================================================
// Partner Showroom (Black Tier Exclusive)
// ============================================================================

export const showroomAmbientStyleEnum = pgEnum('showroom_ambient_style', ['modern', 'classic', 'industrial', 'luxury', 'minimal']);
export const showroomHeroTypeEnum = pgEnum('showroom_hero_type', ['video', 'image', 'gradient']);

/**
 * Team Member Type
 * Key staff members showcased on the showroom page
 */
export interface ShowroomTeamMember {
  id: string;
  name: string;
  role: string;
  image: string | null;
  bio: string | null;
  whatsapp: string | null;
  order: number;
}

/**
 * Achievement Type
 * Awards, milestones, certifications
 */
export interface ShowroomAchievement {
  id: string;
  title: string;
  issuer: string | null;
  year: number | null;
  image: string | null;
  order: number;
}

/**
 * Testimonial Type
 * Featured customer testimonials (curated, not auto-pulled)
 */
export interface ShowroomTestimonial {
  id: string;
  customerName: string;
  customerTitle: string | null;
  customerImage: string | null;
  content: string;
  rating: number;
  vehiclePurchased: string | null;
  videoUrl: string | null;
  order: number;
}

/**
 * Signature Service Type
 * Premium services offered by the showroom
 */
export interface ShowroomService {
  id: string;
  icon: string; // Icon name from predefined set
  title: string;
  description: string | null;
  order: number;
}

/**
 * Press Feature Type
 * Media mentions and press coverage
 */
export interface ShowroomPressFeature {
  id: string;
  publication: string;
  title: string;
  url: string | null;
  logo: string | null;
  date: string | null;
  order: number;
}

/**
 * Partner Showroom Table
 * Premium brand manifesto page for Black tier partners
 * 1:1 relationship with partner table
 */
export const partnerShowroom = pgTable('partner_showroom', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partner.id, { onDelete: 'cascade' }).unique(),
  
  // ========================================
  // Hero Section (First Impression)
  // ========================================
  heroVideoUrl: text('hero_video_url'), // YouTube/Vimeo URL for cinematic intro
  heroVideoFile: text('hero_video_file'), // Uploaded video file key (R2)
  heroVideoThumbnail: text('hero_video_thumbnail'), // Custom poster frame
  heroImage: text('hero_image'), // Fallback/alternative hero image
  heroTagline: text('hero_tagline'), // Bold statement (max ~80 chars): "Where Dreams Meet the Road"
  heroBackgroundType: showroomHeroTypeEnum('hero_background_type').default('image'),
  heroCtaText: text('hero_cta_text').default('Talk to Us'), // CTA button text
  heroCtaLink: text('hero_cta_link'), // Optional: external URL (e.g., website, WhatsApp). If null, links to contact section
  heroCtaSecondaryText: text('hero_cta_secondary_text').default('Browse Collection'), // Secondary CTA
  heroCtaSecondaryLink: text('hero_cta_secondary_link'), // Optional: external URL. If null, links to inventory
  
  // ========================================
  // Brand Story (The Manifesto)
  // ========================================
  brandStoryTitle: text('brand_story_title').default('Our Story'), // Section title
  brandStoryContent: text('brand_story_content'), // Rich narrative (2-3 paragraphs)
  brandStoryVideoUrl: text('brand_story_video_url'), // Optional founder/story video
  brandStoryVideoFile: text('brand_story_video_file'), // Uploaded video file key (R2)
  brandPhilosophy: text('brand_philosophy'), // One-liner philosophy (max ~200 chars)
  
  // Founder Info (Personal Touch)
  founderName: text('founder_name'),
  founderTitle: text('founder_title'), // CEO, Founder, Managing Director
  founderImage: text('founder_image'),
  founderQuote: text('founder_quote'), // Personal quote from founder
  
  // ========================================
  // Visual Gallery (Showroom Experience)
  // ========================================
  showroomImages: jsonb('showroom_images').$type<string[]>().default([]), // High-res interior/exterior (max 12)
  showroomVideoTourUrl: text('showroom_video_tour_url'), // 360° virtual tour link
  showroomVideoTourFile: text('showroom_video_tour_file'), // Uploaded tour video file (R2)
  ambientStyle: showroomAmbientStyleEnum('ambient_style').default('luxury'), // Design theme
  
  // ========================================
  // Signature Collection (Featured Inventory)
  // ========================================
  signatureVehicleIds: jsonb('signature_vehicle_ids').$type<string[]>().default([]), // Hand-picked listing IDs (max 6)
  collectionTitle: text('collection_title').default('The Collection'), // "The Black Collection"
  collectionDescription: text('collection_description'), // Why these cars matter
  
  // ========================================
  // Team Showcase (Human Touch)
  // ========================================
  teamMembers: jsonb('team_members').$type<ShowroomTeamMember[]>().default([]), // Up to 6 key team members
  teamSectionTitle: text('team_section_title').default('Meet the Team'),
  
  // ========================================
  // Achievements & Trust (Social Proof)
  // ========================================
  achievements: jsonb('achievements').$type<ShowroomAchievement[]>().default([]), // Awards, milestones
  totalCarsSold: integer('total_cars_sold'), // Impressive milestone number
  yearsInBusiness: integer('years_in_business'), // Can be calculated from foundedYear
  clientLogos: jsonb('client_logos').$type<string[]>().default([]), // Notable client logos
  achievementsSectionTitle: text('achievements_section_title').default('Our Achievements'),
  
  // ========================================
  // Testimonials (Voice of Customers)
  // ========================================
  featuredTestimonials: jsonb('featured_testimonials').$type<ShowroomTestimonial[]>().default([]), // Curated reviews (max 5)
  testimonialsSectionTitle: text('testimonials_section_title').default('What Our Clients Say'),
  
  // ========================================
  // Services & Experience
  // ========================================
  signatureServices: jsonb('signature_services').$type<ShowroomService[]>().default([]), // Premium services (max 6)
  vipPerks: jsonb('vip_perks').$type<string[]>().default([]), // Bullet points of exclusive perks
  servicesSectionTitle: text('services_section_title').default('Our Services'),
  
  // ========================================
  // Contact & Location (Premium)
  // ========================================
  showroomAddress: text('showroom_address'), // Full formatted address
  showroomMapEmbedUrl: text('showroom_map_embed_url'), // Custom Google Maps embed
  showroomExteriorImages: jsonb('showroom_exterior_images').$type<string[]>().default([]), // Building shots
  parkingInfo: text('parking_info'), // Valet, parking details
  appointmentCtaText: text('appointment_cta_text').default('Book Your Private Viewing'),
  
  // ========================================
  // Social & Media
  // ========================================
  instagramHandle: text('instagram_handle'),
  instagramFeedEnabled: boolean('instagram_feed_enabled').default(false), // Show embedded feed
  youtubeChannelUrl: text('youtube_channel_url'),
  tiktokHandle: text('tiktok_handle'),
  linkedinUrl: text('linkedin_url'),
  pressFeatures: jsonb('press_features').$type<ShowroomPressFeature[]>().default([]), // Media mentions
  
  // ========================================
  // Customization & Theming
  // ========================================
  primaryColor: text('primary_color'), // Brand color override
  accentColor: text('accent_color'), // Secondary brand color
  fontFamily: text('font_family'), // Custom font (from approved list)
  customCss: text('custom_css'), // Advanced: custom CSS overrides (sanitized)
  
  // ========================================
  // SEO & Meta
  // ========================================
  seoTitle: text('seo_title'), // Custom page title
  seoDescription: text('seo_description'), // Meta description
  seoImage: text('seo_image'), // OG image
  slug: text('slug').unique(), // Custom URL: /showroom/luxury-motors
  
  // ========================================
  // Publishing & Status
  // ========================================
  isPublished: boolean('is_published').default(false).notNull(),
  publishedAt: timestamp('published_at'),
  lastEditedAt: timestamp('last_edited_at'),
  lastEditedBy: text('last_edited_by').references(() => user.id, { onDelete: 'set null' }),
  
  // Analytics
  viewCount: integer('view_count').default(0).notNull(),
  uniqueVisitors: integer('unique_visitors').default(0).notNull(),
  avgTimeOnPage: integer('avg_time_on_page').default(0), // Seconds
  lastViewedAt: timestamp('last_viewed_at'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  // Primary lookup - unique constraint already handles this but explicit index for clarity
  index('partner_showroom_partnerId_idx').on(table.partnerId),
  
  // Public page lookup by slug (most critical for low latency)
  index('partner_showroom_slug_idx').on(table.slug),
  
  // Filtering published showrooms
  index('partner_showroom_isPublished_idx').on(table.isPublished),
  
  // Composite: Published showrooms sorted by date (for directory/listing pages)
  index('partner_showroom_published_date_idx').on(table.isPublished, table.publishedAt),
  
  // Analytics queries
  index('partner_showroom_viewCount_idx').on(table.viewCount),
  
  // Editor tracking
  index('partner_showroom_lastEditedBy_idx').on(table.lastEditedBy),
]);

