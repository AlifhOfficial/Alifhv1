/**
 * Clean Auth Schema - Foundation Only
 * 
 * Simple, role-first authentication system.
 * No external dependencies, just core user identity.
 */

import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

/**
 * Core User Identity
 * 
 * Base user table - everyone is a user first
 */
export const user = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  
  // Identity
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  
  // Profile  
  name: text('name'),
  avatar: text('avatar'),
  
  // Security
  passwordHash: text('passwordHash'),
  
  // Timestamps
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
  deletedAt: timestamp('deletedAt', { mode: 'date' }), // Soft delete
});
