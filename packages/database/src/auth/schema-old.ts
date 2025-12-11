import { pgTable, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const platformRoleEnum = pgEnum('platform_role', ['user', 'staff', 'admin', 'super-admin']);
export const partnerRoleEnum = pgEnum('partner_role', ['staff', 'admin', 'owner']);
export const userStatusEnum = pgEnum('user_status', ['active', 'pending', 'suspended', 'inactive']);
export const partnerStatusEnum = pgEnum('partner_status', ['draft', 'active', 'suspended', 'banned']);
export const requestStatusEnum = pgEnum('request_status', ['pending', 'approved', 'rejected']);

export const account = pgTable('account', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  expiresAt: timestamp('expires_at'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false),
  image: text('image'),
  platformRole: platformRoleEnum('platform_role').default('user').notNull(),
  status: userStatusEnum('status').default('active').notNull(),
  activePartnerId: text('active_partner_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
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
});