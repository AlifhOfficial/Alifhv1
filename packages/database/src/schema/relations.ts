/**
 * Auth Schema Relations
 * 
 * Better Auth relations with admin plugin support.
 */

import { relations } from 'drizzle-orm';
import { 
  user,
  account,
  session,
  verification
} from './auth';

// User relations (one-to-many)
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

// Account relations (many-to-one)
export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { 
    fields: [account.userId], 
    references: [user.id] 
  }),
}));

// Session relations (many-to-one)
export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { 
    fields: [session.userId], 
    references: [user.id] 
  }),
}));
