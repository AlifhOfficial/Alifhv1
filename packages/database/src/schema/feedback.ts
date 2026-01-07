import { pgTable, text, timestamp, pgEnum, index, boolean } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { generateId } from '../utils/uuid';

export const feedbackStatusEnum = pgEnum('feedback_status', ['new', 'reviewed', 'archived']);

export const feedback = pgTable('feedback', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  status: feedbackStatusEnum('status').notNull().default('new'),
  isRead: boolean('is_read').notNull().default(false),
  reviewedBy: text('reviewed_by').references(() => user.id),
  reviewedAt: timestamp('reviewed_at'),
  adminNote: text('admin_note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('feedback_userId_idx').on(table.userId),
  index('feedback_status_idx').on(table.status),
  index('feedback_createdAt_idx').on(table.createdAt),
]);
