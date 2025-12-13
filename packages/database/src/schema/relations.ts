/**
 * Schema Relations
 * 
 * Defines relationships between all database tables
 * Clean separation: User (person) → PartnerStaff (seat) → Partner (company)
 */

import { relations } from 'drizzle-orm';
import { 
  user,
  account,
  session,
  verification
} from './auth';
import {
  userProfile,
  kycRecord,
  userFavorite,
} from './profile';
import {
  partner,
  partnerStaff,
  partnerReview,
  partnerRequest,
  auditLog,
} from './partner';

// User relations (one-to-many and one-to-one)
export const userRelations = relations(user, ({ many, one }) => ({
  // Auth
  sessions: many(session),
  accounts: many(account),
  
  // Profile
  profile: one(userProfile, {
    fields: [user.id],
    references: [userProfile.userId],
  }),
  kycRecords: many(kycRecord),
  
  // User Activity
  favorites: many(userFavorite),
  
  // Partner Relationships
  partnerMemberships: many(partnerStaff), // Companies this person works for
  partnerReviews: many(partnerReview), // Reviews this person wrote
  partnerRequests: many(partnerRequest), // Partner applications submitted
  
  // Audit Trail
  auditLogs: many(auditLog), // Actions performed by this user
}));

// User Profile relations (one-to-one)
export const userProfileRelations = relations(userProfile, ({ one }) => ({
  user: one(user, {
    fields: [userProfile.userId],
    references: [user.id],
  }),
}));

// KYC Record relations (many-to-one)
export const kycRecordRelations = relations(kycRecord, ({ one }) => ({
  user: one(user, {
    fields: [kycRecord.userId],
    references: [user.id],
  }),
}));

// User Favorite relations (many-to-one)
export const userFavoriteRelations = relations(userFavorite, ({ one }) => ({
  user: one(user, {
    fields: [userFavorite.userId],
    references: [user.id],
  }),
  // listing relation will be added when car listing schema is created
}));

// Partner relations (the company)
export const partnerRelations = relations(partner, ({ many }) => ({
  staff: many(partnerStaff), // Team members (seats)
  reviews: many(partnerReview), // Customer reviews
  requests: many(partnerRequest), // Original applications (if linked)
  // listings and bookings will be added when those schemas are created
}));

// Partner Staff relations (the seat/membership)
export const partnerStaffRelations = relations(partnerStaff, ({ one }) => ({
  partner: one(partner, {
    fields: [partnerStaff.partnerId],
    references: [partner.id],
  }),
  user: one(user, {
    fields: [partnerStaff.userId],
    references: [user.id],
  }),
}));

// Partner Review relations
export const partnerReviewRelations = relations(partnerReview, ({ one }) => ({
  partner: one(partner, {
    fields: [partnerReview.partnerId],
    references: [partner.id],
  }),
  user: one(user, {
    fields: [partnerReview.userId],
    references: [user.id],
  }),
}));

// Partner Request relations
export const partnerRequestRelations = relations(partnerRequest, ({ one }) => ({
  applicant: one(user, {
    fields: [partnerRequest.userId],
    references: [user.id],
  }),
  reviewer: one(user, {
    fields: [partnerRequest.reviewedBy],
    references: [user.id],
  }),
  createdPartner: one(partner, {
    fields: [partnerRequest.partnerId],
    references: [partner.id],
  }),
}));

// Audit Log relations
export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(user, {
    fields: [auditLog.userId],
    references: [user.id],
  }),
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
