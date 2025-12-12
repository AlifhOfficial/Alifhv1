/**
 * Auth Schema Relations
 * 
 * Basic Better Auth relations only.
 */

import { relations } from 'drizzle-orm';
import { 
  users,
  account,
  session,
  verification
} from './auth';

// Basic Better Auth relations
export const accountRelations = relations(account, ({ one }) => ({
  user: one(users, { 
    fields: [account.userId], 
    references: [users.id] 
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(users, { 
    fields: [session.userId], 
    references: [users.id] 
  }),
}));
