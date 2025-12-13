/**
 * Auth Schema Relations
 * 
 * Better Auth relations with admin plugin support.
 */

import { relations } from 'drizzle-orm';
import { 
  users,
  account,
  session,
  verification
} from './auth';

// User relations (one-to-many)
export const userRelations = relations(users, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

// Account relations (many-to-one)
export const accountRelations = relations(account, ({ one }) => ({
  user: one(users, { 
    fields: [account.userId], 
    references: [users.id] 
  }),
}));

// Session relations (many-to-one)
export const sessionRelations = relations(session, ({ one }) => ({
  user: one(users, { 
    fields: [session.userId], 
    references: [users.id] 
  }),
}));
