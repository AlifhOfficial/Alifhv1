import { pgTable, text, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { user } from './auth';

export const appealStatusEnum = pgEnum('appeal_status', ['pending', 'approved', 'rejected']);

export const banAppeal = pgTable('ban_appeal', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  status: appealStatusEnum('status').notNull().default('pending'),
  reviewedBy: text('reviewed_by').references(() => user.id),
  reviewedAt: timestamp('reviewed_at'),
  reviewNote: text('review_note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('ban_appeal_userId_idx').on(table.userId),
  index('ban_appeal_status_idx').on(table.status),
]);
