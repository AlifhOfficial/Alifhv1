/**
 * Communications Schema
 * For public contact/support/inquiry messages from anyone
 */

import { pgTable, text, timestamp, pgEnum, index, boolean } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { generateId } from '../utils/uuid';

// Type of communication
export const communicationTypeEnum = pgEnum('communication_type', [
  'inquiry',      // General inquiry
  'support',      // Help/support request
  'partnership',  // Business/partnership inquiries
  'feedback',     // General feedback
  'other'         // Catch-all
]);

// Status of the communication
export const communicationStatusEnum = pgEnum('communication_status', [
  'new',          // Just received
  'in_progress',  // Being handled
  'resolved',     // Issue resolved/replied
  'archived'      // Archived/closed
]);

export const communications = pgTable('communications', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  
  // Sender info (not linked to user - anyone can submit)
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'), // Optional
  
  // Message content
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  type: communicationTypeEnum('type').notNull().default('inquiry'),
  
  // Admin management
  status: communicationStatusEnum('status').notNull().default('new'),
  isRead: boolean('is_read').notNull().default(false),
  adminNote: text('admin_note'),
  assignedTo: text('assigned_to').references(() => user.id, { onDelete: 'set null' }),
  resolvedAt: timestamp('resolved_at'),
  resolvedBy: text('resolved_by').references(() => user.id, { onDelete: 'set null' }),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('communications_status_idx').on(table.status),
  index('communications_type_idx').on(table.type),
  index('communications_email_idx').on(table.email),
  index('communications_createdAt_idx').on(table.createdAt),
  index('communications_isRead_idx').on(table.isRead),
]);

// Type exports for convenience
export type Communication = typeof communications.$inferSelect;
export type NewCommunication = typeof communications.$inferInsert;
