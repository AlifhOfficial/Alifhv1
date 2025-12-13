/**
 * Database Indexes
 * 
 * Performance indexes for auth tables
 */

import { pgTable, text, timestamp, boolean, pgEnum, index, unique } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

// Basic Better Auth required enums only

export const account = pgTable('account', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date()).notNull(),
}, (table) => {
  return {
    // Better Auth lookups
    userIdIdx: index('account_userId_idx').on(table.userId),
  };
});

export const session = pgTable('session', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date()).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  // Better Auth Admin plugin field
  impersonatedBy: text('impersonated_by'),
}, (table) => {
  return {
    // Session management
    userIdIdx: index('session_userId_idx').on(table.userId),
  };
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => {
  return {
    // Email verification lookups
    identifierIdx: index('verification_identifier_idx').on(table.identifier),
  };
});

export const users = pgTable('user', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  // Better Auth Admin plugin fields
  role: text('role'),
  banned: boolean('banned').default(false),
  banReason: text('ban_reason'),
  banExpires: timestamp('ban_expires'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => {
  return {
    // Basic indexes for Better Auth
    emailIdx: index('user_email_idx').on(table.email),
    roleIdx: index('user_role_idx').on(table.role),
    bannedIdx: index('user_banned_idx').on(table.banned),
    createdAtIdx: index('user_created_at_idx').on(table.createdAt),
  };
});

// Custom tables removed - clean slate for Better Auth admin plugin