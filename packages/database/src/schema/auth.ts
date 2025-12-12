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
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => {
  return {
    // Basic indexes for Better Auth
    emailIdx: index('users_email_idx').on(table.email),
    createdAtIdx: index('users_created_at_idx').on(table.createdAt),
  };
});

// Custom tables removed - clean slate for Better Auth admin plugin