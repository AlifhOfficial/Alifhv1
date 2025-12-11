/**
 * Auth Schema Relations
 * 
 * Clean relations for the auth schema.
 * Matches your existing patterns.
 */

import { relations } from 'drizzle-orm';
import { 
  users, 
  partners, 
  partnerMembers, 
  partnerRequests, 
  auditLog,
  account,
  session 
} from './schema';

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(account),
  sessions: many(session),
  partnerMemberships: many(partnerMembers),
  partnerRequests: many(partnerRequests),
  auditLogs: many(auditLog),
}));

// Partner relations
export const partnersRelations = relations(partners, ({ one, many }) => ({
  members: many(partnerMembers),
  requests: many(partnerRequests),
  creator: one(users, { 
    fields: [partners.createdBy], 
    references: [users.id] 
  }),
}));

// Partner member relations
export const partnerMembersRelations = relations(partnerMembers, ({ one }) => ({
  user: one(users, { 
    fields: [partnerMembers.userId], 
    references: [users.id] 
  }),
  partner: one(partners, { 
    fields: [partnerMembers.partnerId], 
    references: [partners.id] 
  }),
  inviter: one(users, { 
    fields: [partnerMembers.invitedBy], 
    references: [users.id] 
  }),
}));

// Partner request relations
export const partnerRequestsRelations = relations(partnerRequests, ({ one }) => ({
  user: one(users, { 
    fields: [partnerRequests.userId], 
    references: [users.id] 
  }),
  reviewer: one(users, { 
    fields: [partnerRequests.reviewedBy], 
    references: [users.id] 
  }),
  partner: one(partners, { 
    fields: [partnerRequests.partnerId], 
    references: [partners.id] 
  }),
}));

// Better Auth relations
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

// Audit log relations
export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(users, { 
    fields: [auditLog.userId], 
    references: [users.id] 
  }),
}));