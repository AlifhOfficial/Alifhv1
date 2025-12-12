/**
 * Database Indexes
 * 
 * Performance indexes for auth tables
 */

import { pgTable, text, timestamp, boolean, pgEnum, index, unique } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const platformRoleEnum = pgEnum('platform_role', ['user', 'staff', 'admin', 'super-admin']);
export const partnerRoleEnum = pgEnum('partner_role', ['staff', 'admin', 'owner']);
export const userStatusEnum = pgEnum('user_status', ['active', 'pending', 'suspended', 'inactive']);
export const partnerStatusEnum = pgEnum('partner_status', ['draft', 'active', 'suspended', 'banned']);
export const requestStatusEnum = pgEnum('request_status', ['pending', 'approved', 'rejected']);

export const account = pgTable('account', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  expiresAt: timestamp('expiresAt'),
  password: text('password'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => {
  return {
    // Better Auth lookups
    userIdIdx: index('account_user_id_idx').on(table.userId),
    providerAccountIdx: index('account_provider_account_idx').on(table.providerId, table.accountId),
    expiresAtIdx: index('account_expires_at_idx').on(table.expiresAt),
  };
});

export const session = pgTable('session', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  expiresAt: timestamp('expiresAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => {
  return {
    // Session management
    userIdIdx: index('session_user_id_idx').on(table.userId),
    expiresAtIdx: index('session_expires_at_idx').on(table.expiresAt),
    tokenIdx: index('session_token_idx').on(table.token), // Already unique but for performance
  };
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => {
  return {
    // Email verification lookups
    identifierIdx: index('verification_identifier_idx').on(table.identifier),
    valueIdx: index('verification_value_idx').on(table.value),
    expiresAtIdx: index('verification_expires_at_idx').on(table.expiresAt),
  };
});

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').default(false),
  image: text('image'),
  platformRole: platformRoleEnum('platformRole').default('user').notNull(),
  status: userStatusEnum('status').default('active').notNull(),
  activePartnerId: text('activePartnerId'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => {
  return {
    // Core user lookups
    emailIdx: index('users_email_idx').on(table.email), // Already unique but for performance
    platformRoleIdx: index('users_platform_role_idx').on(table.platformRole),
    statusIdx: index('users_status_idx').on(table.status),
    activePartnerIdx: index('users_active_partner_idx').on(table.activePartnerId),
    createdAtIdx: index('users_created_at_idx').on(table.createdAt),
    // Composite indexes for common queries
    statusRoleIdx: index('users_status_role_idx').on(table.status, table.platformRole),
    emailVerifiedIdx: index('users_email_verified_idx').on(table.emailVerified),
  };
});

export const partners = pgTable('partners', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  status: partnerStatusEnum('status').default('draft').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  website: text('website'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: text('created_by').notNull(),
}, (table) => {
  return {
    // Partner management
    slugIdx: index('partners_slug_idx').on(table.slug), // Already unique but for performance
    statusIdx: index('partners_status_idx').on(table.status),
    emailIdx: index('partners_email_idx').on(table.email),
    createdByIdx: index('partners_created_by_idx').on(table.createdBy),
    createdAtIdx: index('partners_created_at_idx').on(table.createdAt),
    // Composite for listing active partners
    statusCreatedAtIdx: index('partners_status_created_at_idx').on(table.status, table.createdAt),
  };
});

export const partnerMembers = pgTable('partner_members', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull(),
  partnerId: text('partner_id').notNull(),
  role: partnerRoleEnum('role').default('staff').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  invitedBy: text('invited_by').notNull(),
}, (table) => {
  return {
    // Partner membership lookups
    userIdIdx: index('partner_members_user_id_idx').on(table.userId),
    partnerIdIdx: index('partner_members_partner_id_idx').on(table.partnerId),
    isActiveIdx: index('partner_members_is_active_idx').on(table.isActive),
    roleIdx: index('partner_members_role_idx').on(table.role),
    invitedByIdx: index('partner_members_invited_by_idx').on(table.invitedBy),
    // Composite indexes for common queries
    userPartnerIdx: unique('partner_members_user_partner_unique').on(table.userId, table.partnerId),
    partnerActiveIdx: index('partner_members_partner_active_idx').on(table.partnerId, table.isActive),
    userActiveIdx: index('partner_members_user_active_idx').on(table.userId, table.isActive),
    partnerRoleActiveIdx: index('partner_members_partner_role_active_idx').on(table.partnerId, table.role, table.isActive),
  };
});

export const partnerRequests = pgTable('partner_requests', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull(),
  businessName: text('business_name').notNull(),
  businessEmail: text('business_email').notNull(),
  businessPhone: text('business_phone'),
  businessWebsite: text('business_website'),
  description: text('description'),
  status: requestStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  reviewedBy: text('reviewed_by'),
  reviewedAt: timestamp('reviewed_at'),
  rejectionReason: text('rejection_reason'),
  partnerId: text('partner_id'),
}, (table) => {
  return {
    // Partner request management
    userIdIdx: index('partner_requests_user_id_idx').on(table.userId),
    statusIdx: index('partner_requests_status_idx').on(table.status),
    businessEmailIdx: index('partner_requests_business_email_idx').on(table.businessEmail),
    reviewedByIdx: index('partner_requests_reviewed_by_idx').on(table.reviewedBy),
    partnerIdIdx: index('partner_requests_partner_id_idx').on(table.partnerId),
    createdAtIdx: index('partner_requests_created_at_idx').on(table.createdAt),
    reviewedAtIdx: index('partner_requests_reviewed_at_idx').on(table.reviewedAt),
    // Composite for admin review queues
    statusCreatedAtIdx: index('partner_requests_status_created_at_idx').on(table.status, table.createdAt),
    statusReviewedAtIdx: index('partner_requests_status_reviewed_at_idx').on(table.status, table.reviewedAt),
  };
});

export const auditLog = pgTable('audit_log', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  userId: text('user_id'),
  oldValues: text('old_values'),
  newValues: text('new_values'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    // Audit log queries
    userIdIdx: index('audit_log_user_id_idx').on(table.userId),
    actionIdx: index('audit_log_action_idx').on(table.action),
    entityTypeIdx: index('audit_log_entity_type_idx').on(table.entityType),
    entityIdIdx: index('audit_log_entity_id_idx').on(table.entityId),
    createdAtIdx: index('audit_log_created_at_idx').on(table.createdAt),
    // Composite for entity tracking
    entityIdx: index('audit_log_entity_idx').on(table.entityType, table.entityId),
    userActionIdx: index('audit_log_user_action_idx').on(table.userId, table.action),
    actionCreatedAtIdx: index('audit_log_action_created_at_idx').on(table.action, table.createdAt),
  };
});