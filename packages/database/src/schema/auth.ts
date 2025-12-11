import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

/**
 * User Identity Schema
 * 
 * Core authentication and identity management table.
 * Follows standard organizational identity patterns.
 * 
 * Better Auth Requirements:
 * - id, email, emailVerified, name, image, createdAt, updatedAt
 * 
 * Extended Fields:
 * - firstName, lastName (split from name for better UX)
 * - deletedAt (soft delete support)
 */
export const user = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  
  // Email & Verification
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  
  // Identity Information
  name: text('name'), // Better Auth uses this for display name
  image: text('image'), // Avatar URL
  
  // Timestamps
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
  deletedAt: timestamp('deletedAt', { mode: 'date' }), // Soft delete
});

/**
 * Session Schema (Required by Better Auth)
 * 
 * Manages user sessions with security tokens.
 */
export const session = pgTable('session', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  
  expiresAt: timestamp('expiresAt', { mode: 'date' }).notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
});

/**
 * Verification Schema (Required by Better Auth)
 * 
 * Handles email verification and password reset tokens.
 */
export const verification = pgTable('verification', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  
  identifier: text('identifier').notNull(), // email or phone
  value: text('value').notNull(), // verification code/token
  expiresAt: timestamp('expiresAt', { mode: 'date' }).notNull(),
  
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
});

/**
 * Account Schema (Required by Better Auth - for OAuth)
 * 
 * Links users to OAuth providers (Google, Apple, etc.)
 */
export const account = pgTable('account', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  
  accountId: text('accountId').notNull(), // Provider's user ID
  providerId: text('providerId').notNull(), // 'credential', 'google', 'apple', etc.
  password: text('password'), // For credential provider (email/password)
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  expiresAt: timestamp('expiresAt', { mode: 'date' }),
  
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
});
