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
  userSuperlikeQuota,
} from './profile';
import {
  partner,
  partnerStaff,
  partnerReview,
  partnerRequest,
  auditLog,
} from './partner';
import {
  carListing,
  listingPriceHistory,
  listingView,
} from './listing';
import {
  booking,
  bookingSlot,
  partnerAvailability,
  partnerBookingSettings,
} from './booking';
import {
  conversation,
  conversationParticipant,
  message,
} from './messaging';
import {
  consignmentFunnel,
} from './consignment';

// Note: Removed tables (not imported):
// - userBookingRestriction (simplified to app logic)
// - messageReaction (not needed for V1)
// - consignmentLeadActivity (use main auditLog)

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
  
  // Favorites & Superlikes
  favorites: many(userFavorite),
  superlikeQuota: one(userSuperlikeQuota, {
    fields: [user.id],
    references: [userSuperlikeQuota.userId],
  }),
  
  // Partner Relationships
  partnerMemberships: many(partnerStaff),
  
  // Listings
  listings: many(carListing),
  
  // Bookings
  bookings: many(booking),
  
  // Messaging
  conversations: many(conversationParticipant),
  sentMessages: many(message),
  
  // ❌ Removed for V1 (unused relations that bloat bundle):
  // - partnerReviews, partnerRequests (not implemented yet)
  // - listingViews (tracked without relation)
  // - consignmentLeads (partner feature, not user-facing)
  // - auditLogs (admin only, not user-facing)
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
  listing: one(carListing, {
    fields: [userFavorite.listingId],
    references: [carListing.id],
  }),
}));

// User Superlike Quota relations (one-to-one)
export const userSuperlikeQuotaRelations = relations(userSuperlikeQuota, ({ one }) => ({
  user: one(user, {
    fields: [userSuperlikeQuota.userId],
    references: [user.id],
  }),
}));

// Partner relations (the company)
export const partnerRelations = relations(partner, ({ many, one }) => ({
  staff: many(partnerStaff),
  
  // Listings
  listings: many(carListing),
  
  // Bookings
  bookings: many(booking),
  bookingSlots: many(bookingSlot),
  availability: many(partnerAvailability),
  bookingSettings: one(partnerBookingSettings, {
    fields: [partner.id],
    references: [partnerBookingSettings.partnerId],
  }),
  
  // Messaging
  conversations: many(conversation),
  
  // Consignment Funnels (saved searches)
  consignmentFunnels: many(consignmentFunnel),
  
  // ❌ Removed for V1:
  // - reviews, requests (not implemented yet)
}));

// Partner Staff relations (the seat/membership)
export const partnerStaffRelations = relations(partnerStaff, ({ one, many }) => ({
  partner: one(partner, {
    fields: [partnerStaff.partnerId],
    references: [partner.id],
  }),
  user: one(user, {
    fields: [partnerStaff.userId],
    references: [user.id],
  }),
  postedListings: many(carListing), // Listings posted by this staff member
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

// ===== LISTING RELATIONS =====

// Car Listing relations
export const carListingRelations = relations(carListing, ({ one, many }) => ({
  // Ownership
  partner: one(partner, {
    fields: [carListing.partnerId],
    references: [partner.id],
  }),
  user: one(user, {
    fields: [carListing.userId],
    references: [user.id],
  }),
  
  // Activity (most used in V1)
  favorites: many(userFavorite),
  views: many(listingView),
  
  // Bookings
  bookings: many(booking),
  bookingSlots: many(bookingSlot),
  
  // Messaging
  conversations: many(conversation),
  
  // ❌ Removed for V1:
  // - reservedByUser, soldToUser (not implemented)
  // - priceHistory (tracked without relation)
}));

// Listing Price History relations
export const listingPriceHistoryRelations = relations(listingPriceHistory, ({ one }) => ({
  listing: one(carListing, {
    fields: [listingPriceHistory.listingId],
    references: [carListing.id],
  }),
  changedBy: one(user, {
    fields: [listingPriceHistory.changedBy],
    references: [user.id],
  }),
}));

// Listing View relations
export const listingViewRelations = relations(listingView, ({ one }) => ({
  listing: one(carListing, {
    fields: [listingView.listingId],
    references: [carListing.id],
  }),
  user: one(user, {
    fields: [listingView.userId],
    references: [user.id],
  }),
}));

// ===== BOOKING RELATIONS =====

// Partner Availability relations
export const partnerAvailabilityRelations = relations(partnerAvailability, ({ one }) => ({
  partner: one(partner, {
    fields: [partnerAvailability.partnerId],
    references: [partner.id],
  }),
}));

// Booking Slot relations
export const bookingSlotRelations = relations(bookingSlot, ({ one, many }) => ({
  partner: one(partner, {
    fields: [bookingSlot.partnerId],
    references: [partner.id],
  }),
  listing: one(carListing, {
    fields: [bookingSlot.listingId],
    references: [carListing.id],
  }),
  bookings: many(booking),
}));

// Booking relations
export const bookingRelations = relations(booking, ({ one }) => ({
  user: one(user, {
    fields: [booking.userId],
    references: [user.id],
  }),
  partner: one(partner, {
    fields: [booking.partnerId],
    references: [partner.id],
  }),
  listing: one(carListing, {
    fields: [booking.listingId],
    references: [carListing.id],
  }),
  slot: one(bookingSlot, {
    fields: [booking.slotId],
    references: [bookingSlot.id],
  }),
}));

// ❌ Removed: userBookingRestrictionRelations (table removed)

// Partner Booking Settings relations
export const partnerBookingSettingsRelations = relations(partnerBookingSettings, ({ one }) => ({
  partner: one(partner, {
    fields: [partnerBookingSettings.partnerId],
    references: [partner.id],
  }),
}));

// ===== MESSAGING RELATIONS =====

// Conversation relations
export const conversationRelations = relations(conversation, ({ one, many }) => ({
  // Context
  listing: one(carListing, {
    fields: [conversation.listingId],
    references: [carListing.id],
  }),
  partner: one(partner, {
    fields: [conversation.partnerId],
    references: [partner.id],
  }),
  
  // Content
  participants: many(conversationParticipant),
  messages: many(message),
}));

// Conversation Participant relations
export const conversationParticipantRelations = relations(conversationParticipant, ({ one }) => ({
  conversation: one(conversation, {
    fields: [conversationParticipant.conversationId],
    references: [conversation.id],
  }),
  user: one(user, {
    fields: [conversationParticipant.userId],
    references: [user.id],
  }),
}));

// Message relations
export const messageRelations = relations(message, ({ one, many }) => ({
  conversation: one(conversation, {
    fields: [message.conversationId],
    references: [conversation.id],
  }),
  sender: one(user, {
    fields: [message.senderId],
    references: [user.id],
  }),
}));

// ===== CONSIGNMENT RELATIONS =====

// Consignment Funnel relations (saved searches)
export const consignmentFunnelRelations = relations(consignmentFunnel, ({ one }) => ({
  partner: one(partner, {
    fields: [consignmentFunnel.partnerId],
    references: [partner.id],
  }),
}));

/**
 * ❌ REMOVED RELATIONS:
 * - userBookingRestriction (table removed - simplified to app logic)
 * - messageReaction (table removed - not needed for V1)
 * - consignmentLeadActivity (table removed - use main auditLog)
 * - User.bookingRestriction
 * - User.messageReactions
 * - User.consignmentActivities
 * - Message.replyToMessage
 * - Message.reactions
 */
