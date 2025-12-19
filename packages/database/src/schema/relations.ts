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
  userBookingRestriction,
  partnerBookingSettings,
} from './booking';
import {
  conversation,
  conversationParticipant,
  message,
  messageReaction,
} from './messaging';
import {
  consignmentLead,
  consignmentLeadActivity,
  partnerConsignmentPreference,
} from './consignment';
// Note: analytics, bookingFeedback, consignmentStats, typingIndicator removed in V1

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
  superlikeQuota: one(userSuperlikeQuota, {
    fields: [user.id],
    references: [userSuperlikeQuota.userId],
  }),
  
  // Partner Relationships
  partnerMemberships: many(partnerStaff), // Companies this person works for
  partnerReviews: many(partnerReview), // Reviews this person wrote
  partnerRequests: many(partnerRequest), // Partner applications submitted
  
  // Listings
  listings: many(carListing), // P2P listings created by user
  listingViews: many(listingView), // Listings this user viewed
  
  // Bookings
  bookings: many(booking), // Bookings created by user
  bookingRestriction: one(userBookingRestriction, {
    fields: [user.id],
    references: [userBookingRestriction.userId],
  }),
  
  // Messaging
  conversations: many(conversationParticipant), // Conversations user is part of
  sentMessages: many(message), // Messages sent by user
  messageReactions: many(messageReaction), // Reactions user added
  
  // Consignment
  consignmentLeads: many(consignmentLead), // Consignment leads for user's listings
  consignmentActivities: many(consignmentLeadActivity), // Actions in consignment process
  
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
  staff: many(partnerStaff), // Team members (seats)
  reviews: many(partnerReview), // Customer reviews
  requests: many(partnerRequest), // Original applications (if linked)
  
  // Listings
  listings: many(carListing), // Cars listed by this partner
  
  // Bookings
  bookings: many(booking), // Bookings for this partner's listings
  bookingSlots: many(bookingSlot), // Available time slots
  availability: many(partnerAvailability), // Weekly availability schedule
  bookingSettings: one(partnerBookingSettings, {
    fields: [partner.id],
    references: [partnerBookingSettings.partnerId],
  }),
  
  // Messaging
  conversations: many(conversation), // Conversations with this partner
  
  // Consignment
  consignmentLeads: many(consignmentLead), // Consignment leads for this partner
  consignmentPreference: one(partnerConsignmentPreference, {
    fields: [partner.id],
    references: [partnerConsignmentPreference.partnerId],
  }),
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
  // Ownership & Location Strategy:
  // - listing.emirate and listing.city are denormalized (copied from owner)
  // - For full address/coordinates: join with owner (partner or userProfile)
  // Partner listings → join partner for partner.address, partner.locationLat/Lng
  // User listings → join user → userProfile for userProfile.locationCity/Emirate/Lat/Lng
  partner: one(partner, {
    fields: [carListing.partnerId],
    references: [partner.id],
  }),
  user: one(user, {
    fields: [carListing.userId],
    references: [user.id],
  }),
  
  // Reservation & Sale
  reservedByUser: one(user, {
    fields: [carListing.reservedBy],
    references: [user.id],
    relationName: 'reservedListings',
  }),
  soldToUser: one(user, {
    fields: [carListing.soldTo],
    references: [user.id],
    relationName: 'purchasedListings',
  }),
  
  // Activity
  priceHistory: many(listingPriceHistory),
  views: many(listingView),
  favorites: many(userFavorite),
  
  // Bookings
  bookings: many(booking),
  bookingSlots: many(bookingSlot),
  
  // Messaging
  conversations: many(conversation), // Conversations about this listing
  
  // Consignment
  consignmentLeads: many(consignmentLead), // Consignment leads for this listing
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

// User Booking Restriction relations
export const userBookingRestrictionRelations = relations(userBookingRestriction, ({ one }) => ({
  user: one(user, {
    fields: [userBookingRestriction.userId],
    references: [user.id],
  }),
}));

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
  replyToMessage: one(message, {
    fields: [message.replyToMessageId],
    references: [message.id],
  }),
  reactions: many(messageReaction),
}));

// Message Reaction relations
export const messageReactionRelations = relations(messageReaction, ({ one }) => ({
  message: one(message, {
    fields: [messageReaction.messageId],
    references: [message.id],
  }),
  user: one(user, {
    fields: [messageReaction.userId],
    references: [user.id],
  }),
}));

// ===== CONSIGNMENT RELATIONS =====

// Partner Consignment Preference relations
export const partnerConsignmentPreferenceRelations = relations(partnerConsignmentPreference, ({ one }) => ({
  partner: one(partner, {
    fields: [partnerConsignmentPreference.partnerId],
    references: [partner.id],
  }),
}));

// Consignment Lead relations
export const consignmentLeadRelations = relations(consignmentLead, ({ one, many }) => ({
  partner: one(partner, {
    fields: [consignmentLead.partnerId],
    references: [partner.id],
  }),
  user: one(user, {
    fields: [consignmentLead.userId],
    references: [user.id],
  }),
  listing: one(carListing, {
    fields: [consignmentLead.listingId],
    references: [carListing.id],
  }),
  activities: many(consignmentLeadActivity),
}));

// Consignment Lead Activity relations
export const consignmentLeadActivityRelations = relations(consignmentLeadActivity, ({ one }) => ({
  lead: one(consignmentLead, {
    fields: [consignmentLeadActivity.leadId],
    references: [consignmentLead.id],
  }),
  user: one(user, {
    fields: [consignmentLeadActivity.userId],
    references: [user.id],
  }),
}));
