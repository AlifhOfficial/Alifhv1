/**
 * Partner System Types & Schemas
 * 
 * Zod schemas and TypeScript types for Partner, PartnerStaff, PartnerReview, and PartnerRequest
 * Following the same pattern as profile types for consistency
 */

import { z } from 'zod';

// ==================== ENUMS ====================

export const PartnerStatusSchema = z.enum(['pending', 'active', 'suspended', 'cancelled']);
export type PartnerStatus = z.infer<typeof PartnerStatusSchema>;

export const PartnerTierSchema = z.enum(['standard', 'gold', 'platinum', 'black']);
export type PartnerTier = z.infer<typeof PartnerTierSchema>;

export const PartnerStaffRoleSchema = z.enum(['owner', 'admin', 'sales', 'viewer']);
export type PartnerStaffRole = z.infer<typeof PartnerStaffRoleSchema>;

export const StaffStatusSchema = z.enum(['active', 'invited', 'suspended', 'left']);
export type StaffStatus = z.infer<typeof StaffStatusSchema>;

export const PartnerRequestStatusSchema = z.enum(['pending', 'approved', 'rejected']);
export type PartnerRequestStatus = z.infer<typeof PartnerRequestStatusSchema>;

export const ReviewStatusSchema = z.enum(['pending', 'published', 'hidden', 'flagged']);
export type ReviewStatus = z.infer<typeof ReviewStatusSchema>;

export const AuditSeveritySchema = z.enum(['info', 'warning', 'critical']);
export type AuditSeverity = z.infer<typeof AuditSeveritySchema>;

// ==================== COMPLEX OBJECT SCHEMAS ====================

export const PartnerFeaturesSchema = z.object({
  homeDelivery: z.boolean(),
  testDriveAvailable: z.boolean(),
  financing: z.boolean(),
  tradeIn: z.boolean(),
  warranty: z.boolean(),
  insurance: z.boolean(),
  registration: z.boolean(),
  exportAssistance: z.boolean(),
});
export type PartnerFeatures = z.infer<typeof PartnerFeaturesSchema>;

export const BusinessHoursSchema = z.record(
  z.object({
    open: z.string(),
    close: z.string(),
    closed: z.boolean().optional(),
  })
);
export type BusinessHours = z.infer<typeof BusinessHoursSchema>;

export const NotificationPreferencesSchema = z.object({
  emailNewLead: z.boolean(),
  emailBooking: z.boolean(),
  emailMessage: z.boolean(),
  emailSale: z.boolean(),
  emailReview: z.boolean(),
  emailMarketing: z.boolean(),
  smsNewLead: z.boolean(),
  smsBooking: z.boolean(),
});
export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;

export const StaffPermissionsSchema = z.object({
  manageListings: z.boolean(),
  manageTeam: z.boolean(),
  viewAnalytics: z.boolean(),
  manageBookings: z.boolean(),
  respondToLeads: z.boolean(),
  manageFinancials: z.boolean(),
  manageSettings: z.boolean(),
  exportData: z.boolean(),
});
export type StaffPermissions = z.infer<typeof StaffPermissionsSchema>;

// ==================== PARTNER SCHEMAS ====================

export const PartnerSchema = z.object({
  // Primary identification
  id: z.string(),
  
  // Company Legal Information
  companyNameLegal: z.string().min(1, 'Legal name is required'),
  brandName: z.string().min(1, 'Brand name is required'),
  tradeLicense: z.string().min(1, 'Trade license is required'),
  tradeLicenseExpiry: z.date().nullable().optional(),
  tradeLicenseDocumentUrl: z.string().nullable().optional(),
  
  // Account Status & Tier
  status: PartnerStatusSchema,
  tier: PartnerTierSchema,
  
  // Contact Information
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone is required'),
  website: z.string().url().nullable().optional(),
  
  // Location Information
  address: z.string().nullable().optional(),
  emirate: z.string().nullable().optional(),
  locationLat: z.number().nullable().optional(),
  locationLng: z.number().nullable().optional(),
  showroomCount: z.number().int().default(1),
  
  // Branding & Media
  logo: z.string().nullable().optional(),
  heroImage: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  galleryImages: z.array(z.string()).default([]),
  
  // Business Information
  description: z.string().nullable().optional(),
  specialties: z.array(z.string()).default([]),
  experienceYears: z.number().int().nullable().optional(),
  foundedYear: z.number().int().nullable().optional(),
  
  // External Ratings
  googleReviewUrl: z.string().nullable().optional(),
  googleRating: z.number().min(0).max(5).nullable().optional(),
  googleReviewCount: z.number().int().default(0),
  
  // Platform Performance Metrics
  platformRating: z.number().min(0).max(5).nullable().optional(),
  platformReviewCount: z.number().int().default(0),
  customerSatisfaction: z.number().min(0).max(100).nullable().optional(),
  
  // Inventory & Sales
  totalInventory: z.number().int().default(0),
  activeListings: z.number().int().default(0),
  soldListings: z.number().int().default(0),
  totalSales: z.number().int().default(0),
  totalRevenue: z.number().int().default(0),
  
  // Response Metrics
  avgResponseTime: z.number().int().nullable().optional(),
  responseRate: z.number().min(0).max(100).nullable().optional(),
  
  // Conversion & Retention Metrics
  leadConversionRate: z.number().min(0).max(100).nullable().optional(),
  repeatCustomerRate: z.number().min(0).max(100).nullable().optional(),
  avgDealValue: z.number().int().default(0),
  
  // Monthly Performance
  monthlyViews: z.number().int().default(0),
  monthlyLeads: z.number().int().default(0),
  monthlySales: z.number().int().default(0),
  monthlyRevenue: z.number().int().default(0),
  
  // Team Size
  teamSize: z.number().int().default(0),
  activeStaffCount: z.number().int().default(0),
  
  // Trust & Verification
  isVerified: z.boolean().default(false),
  verifiedAt: z.date().nullable().optional(),
  verifiedBy: z.string().nullable().optional(),
  
  // Badges & Tags
  badges: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  
  // Services & Features
  features: PartnerFeaturesSchema,
  
  // Business Hours
  businessHours: BusinessHoursSchema.nullable().optional(),
  
  // Financial Settings
  commissionRate: z.number().min(0).max(100).default(0),
  subscriptionTier: z.string().default('basic'),
  subscriptionExpiresAt: z.date().nullable().optional(),
  paymentTerms: z.string().default('net30'),
  
  // Notification Preferences
  notificationPreferences: NotificationPreferencesSchema,
  
  // Account Management
  accountManagerId: z.string().nullable().optional(),
  primaryContactId: z.string().nullable().optional(),
  
  // Quality & Compliance
  lastAuditAt: z.date().nullable().optional(),
  nextAuditAt: z.date().nullable().optional(),
  complianceScore: z.number().int().min(0).max(100).nullable().optional(),
  
  // Approval Workflow
  submittedAt: z.date().nullable().optional(),
  approvedAt: z.date().nullable().optional(),
  approvedBy: z.string().nullable().optional(),
  rejectedAt: z.date().nullable().optional(),
  rejectionReason: z.string().nullable().optional(),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  activatedAt: z.date().nullable().optional(),
  suspendedAt: z.date().nullable().optional(),
  cancelledAt: z.date().nullable().optional(),
});

export type Partner = z.infer<typeof PartnerSchema>;

// Partner Update Schema (partial, excluding system fields)
export const PartnerUpdateSchema = PartnerSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PartnerUpdate = z.infer<typeof PartnerUpdateSchema>;

// ==================== PARTNER STAFF SCHEMAS ====================

export const PartnerStaffSchema = z.object({
  id: z.string(),
  partnerId: z.string(),
  userId: z.string(),
  role: PartnerStaffRoleSchema,
  title: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  isPrimaryContact: z.boolean().default(false),
  permissions: StaffPermissionsSchema,
  status: StaffStatusSchema,
  leadsHandled: z.number().int().default(0),
  leadsConverted: z.number().int().default(0),
  dealsClosed: z.number().int().default(0),
  totalSalesValue: z.number().int().default(0),
  avgResponseTime: z.number().int().nullable().optional(),
  lastActiveAt: z.date().nullable().optional(),
  performanceScore: z.number().min(0).max(100).nullable().optional(),
  customerRating: z.number().min(0).max(5).nullable().optional(),
  joinedAt: z.date(),
  invitedAt: z.date().nullable().optional(),
  invitedBy: z.string().nullable().optional(),
  acceptedAt: z.date().nullable().optional(),
  leftAt: z.date().nullable().optional(),
  leftReason: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PartnerStaff = z.infer<typeof PartnerStaffSchema>;

export const PartnerStaffUpdateSchema = PartnerStaffSchema.partial().omit({
  id: true,
  partnerId: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export type PartnerStaffUpdate = z.infer<typeof PartnerStaffUpdateSchema>;

// ==================== PARTNER REVIEW SCHEMAS ====================

export const PartnerReviewSchema = z.object({
  id: z.string(),
  partnerId: z.string(),
  userId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().nullable().optional(),
  review: z.string().nullable().optional(),
  communicationRating: z.number().int().min(1).max(5).nullable().optional(),
  vehicleConditionRating: z.number().int().min(1).max(5).nullable().optional(),
  processRating: z.number().int().min(1).max(5).nullable().optional(),
  isVerifiedPurchase: z.boolean().default(false),
  purchaseId: z.string().nullable().optional(),
  partnerResponse: z.string().nullable().optional(),
  respondedAt: z.date().nullable().optional(),
  status: ReviewStatusSchema,
  moderatedBy: z.string().nullable().optional(),
  moderatedAt: z.date().nullable().optional(),
  helpfulCount: z.number().int().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PartnerReview = z.infer<typeof PartnerReviewSchema>;

export const PartnerReviewUpdateSchema = PartnerReviewSchema.partial().omit({
  id: true,
  partnerId: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export type PartnerReviewUpdate = z.infer<typeof PartnerReviewUpdateSchema>;

// ==================== PARTNER REQUEST SCHEMAS ====================

export const PartnerRequestSchema = z.object({
  id: z.string(),
  userId: z.string(),
  companyNameLegal: z.string().min(1),
  brandName: z.string().min(1),
  tradeLicense: z.string().min(1),
  tradeLicenseDocumentUrl: z.string().nullable().optional(),
  tradeLicenseExpiry: z.date().nullable().optional(),
  email: z.string().email(),
  phone: z.string().min(1),
  website: z.string().url().nullable().optional(),
  address: z.string().nullable().optional(),
  emirate: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  experienceYears: z.number().int().nullable().optional(),
  specialties: z.array(z.string()).default([]),
  status: PartnerRequestStatusSchema,
  reviewedBy: z.string().nullable().optional(),
  reviewedAt: z.date().nullable().optional(),
  rejectionReason: z.string().nullable().optional(),
  internalNotes: z.string().nullable().optional(),
  partnerId: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PartnerRequest = z.infer<typeof PartnerRequestSchema>;

export const PartnerRequestUpdateSchema = PartnerRequestSchema.partial().omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export type PartnerRequestUpdate = z.infer<typeof PartnerRequestUpdateSchema>;

// ==================== AUDIT LOG SCHEMAS ====================

export const AuditLogSchema = z.object({
  id: z.string(),
  action: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  userId: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
  ipAddress: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  oldValues: z.record(z.any()).nullable().optional(),
  newValues: z.record(z.any()).nullable().optional(),
  severity: AuditSeveritySchema,
  createdAt: z.date(),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

// ==================== INPUT SCHEMAS (for API) ====================

export const CreatePartnerInputSchema = PartnerSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  tier: true,
}).extend({
  status: PartnerStatusSchema.optional(),
  tier: PartnerTierSchema.optional(),
});

export type CreatePartnerInput = z.infer<typeof CreatePartnerInputSchema>;

export const CreateStaffInputSchema = PartnerStaffSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  joinedAt: true,
  status: true,
}).extend({
  status: StaffStatusSchema.optional(),
});

export type CreateStaffInput = z.infer<typeof CreateStaffInputSchema>;

export const CreateReviewInputSchema = PartnerReviewSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  helpfulCount: true,
  partnerResponse: true,
  respondedAt: true,
  moderatedBy: true,
  moderatedAt: true,
}).extend({
  status: ReviewStatusSchema.optional(),
});

export type CreateReviewInput = z.infer<typeof CreateReviewInputSchema>;

export const CreateRequestInputSchema = PartnerRequestSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  reviewedBy: true,
  reviewedAt: true,
  rejectionReason: true,
  internalNotes: true,
  partnerId: true,
}).extend({
  status: PartnerRequestStatusSchema.optional(),
});

export type CreateRequestInput = z.infer<typeof CreateRequestInputSchema>;
