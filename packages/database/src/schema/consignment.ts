import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
  unique,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { user } from './auth';
import { partner } from './partner';
import { carListing } from './listing';

// Enums
export const consignmentLeadStatusEnum = pgEnum('consignment_lead_status', [
  'new',              // Just matched, partner hasn't viewed yet
  'viewed',           // Partner viewed the lead
  'interested',       // Partner marked as interested
  'contacted',        // Partner reached out to user
  'in_negotiation',   // Actively discussing terms
  'accepted',         // User agreed to consign with this partner
  'rejected',         // Partner not interested OR user declined
  'expired',          // Lead expired (user sold car or removed listing)
  'lost',             // User chose another partner
]);

/**
 * Partner Consignment Preferences Table
 * Partners define what types of cars they want consignment leads for
 */
export const partnerConsignmentPreference = pgTable('partner_consignment_preference', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partner.id, { onDelete: 'cascade' }),
  
  // Is consignment enabled for this partner?
  isEnabled: boolean('is_enabled').default(false).notNull(),
  
  // Vehicle Filters
  makes: jsonb('makes').$type<string[]>().default([]), // ["Mercedes-Benz", "BMW", "Porsche"]
  models: jsonb('models').$type<string[]>().default([]), // ["C-Class", "E-Class", "X5"]
  bodyTypes: jsonb('body_types').$type<string[]>().default([]), // ["sedan", "suv", "coupe"]
  fuelTypes: jsonb('fuel_types').$type<string[]>().default([]), // ["petrol", "electric", "hybrid"]
  
  // Year Range
  minYear: integer('min_year'), // 2020
  maxYear: integer('max_year'), // 2024
  
  // Price Range (in AED cents)
  minPrice: integer('min_price'), // 5000000 (50,000 AED)
  maxPrice: integer('max_price'), // 50000000 (500,000 AED)
  
  // Mileage Range (in km)
  maxMileage: integer('max_mileage'), // 50000 km
  
  // Location Preferences
  emirates: jsonb('emirates').$type<string[]>().default([]), // ["Dubai", "Abu Dhabi"]
  
  // Specs & Features
  preferredSpecs: jsonb('preferred_specs').$type<string[]>().default([]), // ["gcc", "american"]
  mustHaveFeatures: jsonb('must_have_features').$type<string[]>().default([]), // ["sunroof", "leather_seats"]
  
  // Additional Criteria
  onlyVerifiedSellers: boolean('only_verified_sellers').default(false).notNull(),
  excludeAccidents: boolean('exclude_accidents').default(true).notNull(),
  
  // Lead Priority Scoring
  priorityScore: integer('priority_score').default(50).notNull(), // 0-100: How aggressive to match
  
  // Notification Settings
  notifyOnNewLead: boolean('notify_on_new_lead').default(true).notNull(),
  maxLeadsPerDay: integer('max_leads_per_day').default(10), // Rate limiting
  
  // Performance Tracking
  totalLeadsReceived: integer('total_leads_received').default(0).notNull(),
  totalLeadsContacted: integer('total_leads_contacted').default(0).notNull(),
  totalLeadsAccepted: integer('total_leads_accepted').default(0).notNull(),
  conversionRate: integer('conversion_rate').default(0), // Percentage: leads → accepted
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  lastLeadReceivedAt: timestamp('last_lead_received_at'),
}, (table) => [
  index('partner_consignment_preference_partnerId_idx').on(table.partnerId),
  index('partner_consignment_preference_isEnabled_idx').on(table.isEnabled),
  unique('partner_consignment_preference_partnerId_unique').on(table.partnerId),
]);

/**
 * Consignment Leads Table
 * Tracks when a user listing matches a partner's consignment criteria
 */
export const consignmentLead = pgTable('consignment_lead', {
  id: text('id').primaryKey(),
  
  // The Players
  partnerId: text('partner_id').notNull().references(() => partner.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }), // Listing owner
  listingId: text('listing_id').notNull().references(() => carListing.id, { onDelete: 'cascade' }),
  
  // Match Information (simplified for V1)
  status: consignmentLeadStatusEnum('status').default('new').notNull(),
  
  // Simplified matching - just show all matches, let partner filter manually
  // V2 can add: matchType, matchScore, matchedCriteria if needed
  
  // Partner Actions
  viewedAt: timestamp('viewed_at'),
  viewCount: integer('view_count').default(0).notNull(),
  interestedAt: timestamp('interested_at'),
  contactedAt: timestamp('contacted_at'),
  contactMethod: text('contact_method'), // 'message', 'call', 'whatsapp'
  
  // Partner Notes
  partnerNotes: text('partner_notes'),
  internalNotes: text('internal_notes'), // Internal partner team notes
  
  // Offer Details (if partner made an offer)
  offerAmount: integer('offer_amount'), // In AED cents
  offerTerms: text('offer_terms'),
  offerExpiresAt: timestamp('offer_expires_at'),
  
  // User Response
  userResponsed: boolean('user_responsed').default(false).notNull(),
  userInterestedAt: timestamp('user_interested_at'),
  userRejectedAt: timestamp('user_rejected_at'),
  userRejectionReason: text('user_rejection_reason'),
  
  // Acceptance & Deal
  acceptedAt: timestamp('accepted_at'),
  acceptedByUserId: text('accepted_by_user_id').references(() => user.id, { onDelete: 'set null' }), // Partner staff who closed deal
  dealValue: integer('deal_value'), // Final consignment value (AED cents)
  dealNotes: text('deal_notes'),
  
  // Rejection
  rejectedAt: timestamp('rejected_at'),
  rejectedBy: text('rejected_by'), // 'partner' or 'user'
  rejectionReason: text('rejection_reason'),
  
  // Expiration & Loss
  expiresAt: timestamp('expires_at'),
  lostAt: timestamp('lost_at'),
  lostToPartnerId: text('lost_to_partner_id').references(() => partner.id, { onDelete: 'set null' }), // If user chose different partner
  
  // Priority for Partner
  isPriority: boolean('is_priority').default(false).notNull(), // Partner can flag important leads
  
  // Follow-up Reminders
  followUpAt: timestamp('follow_up_at'),
  followUpCount: integer('follow_up_count').default(0).notNull(),
  
  // Performance tracking removed - calculate when needed:
  // - timeToContact → Calculate: contactedAt - createdAt
  // - timeToAccept → Calculate: acceptedAt - createdAt
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  // Core lookups
  index('consignment_lead_partnerId_idx').on(table.partnerId),
  index('consignment_lead_userId_idx').on(table.userId),
  index('consignment_lead_listingId_idx').on(table.listingId),
  
  // Status queries
  index('consignment_lead_status_idx').on(table.status),
  index('consignment_lead_partnerId_status_idx').on(table.partnerId, table.status),
  
  // Dashboard sorting
  index('consignment_lead_partnerId_createdAt_idx').on(table.partnerId, table.createdAt),
  index('consignment_lead_isPriority_idx').on(table.isPriority),
  
  // Analytics
  index('consignment_lead_viewedAt_idx').on(table.viewedAt),
  index('consignment_lead_contactedAt_idx').on(table.contactedAt),
  
  // Follow-ups
  index('consignment_lead_followUpAt_idx').on(table.followUpAt),
  
  // Prevent duplicate leads (one partner, one listing)
  unique('consignment_lead_partnerId_listingId_unique').on(table.partnerId, table.listingId),
]);

/**
 * ❌ REMOVED: Consignment Lead Activity, Match Scoring, Filter Match Types
 * 
 * @reason V1 keeps consignment simple - show leads, let partners contact users
 * @removed:
 *   - consignmentLeadActivity table (detailed audit trail)
 *   - matchScore, matchType, matchedCriteria (complex matching algorithm)
 *   - consignmentFilterMatchTypeEnum (exact/partial/broad matching)
 *   - timeToContact, timeToAccept (analytics metrics)
 * 
 * @v1_solution:
 *   - Partner sets simple filters (makes, price range, year)
 *   - System shows ALL matching leads
 *   - Partner manually reviews and contacts
 *   - Use main auditLog for critical actions
 * 
 * @v2_solution:
 *   Add back when you need:
 *   - Complex matching algorithms with scores
 *   - Detailed activity tracking per lead
 *   - Advanced analytics on lead conversion
 *   - AI-powered lead quality scoring
 */

/**
 * ❌ REMOVED IN V1: Consignment Stats Table
 * 
 * @reason Can be calculated on-demand from consignmentLead table (same as analytics)
 * @impact Removed: 1 table, 20 fields, periodic aggregation job requirement
 * @v1_solution Calculate stats when partner views their consignment dashboard
 * @v2_solution Add back if querying stats across all partners becomes slow
 * 
 * V1 Implementation Example:
 * ```typescript
 * // apps/web/src/lib/consignment/get-partner-stats.ts
 * export async function getPartnerConsignmentStats(partnerId: string, period: 'week' | 'month') {
 *   const startDate = period === 'week' ? subDays(new Date(), 7) : subDays(new Date(), 30);
 *   
 *   const stats = await db
 *     .select({
 *       totalLeads: count(),
 *       viewed: sum(case().when(eq(consignmentLead.status, 'viewed'), 1).else(0)),
 *       contacted: sum(case().when(eq(consignmentLead.status, 'contacted'), 1).else(0)),
 *       accepted: sum(case().when(eq(consignmentLead.status, 'accepted'), 1).else(0)),
 *       avgMatchScore: avg(consignmentLead.matchScore),
 *       totalOfferValue: sum(consignmentLead.offerAmount),
 *     })
 *     .from(consignmentLead)
 *     .where(and(
 *       eq(consignmentLead.partnerId, partnerId),
 *       gte(consignmentLead.createdAt, startDate)
 *     ));
 *   
 *   return stats[0];
 * }
 * ```
 * 
 * Query Performance at V1 Scale:
 * - <1000 leads: ~50ms
 * - <10000 leads: ~200ms
 * - Add Redis cache (5min TTL) for dashboard view
 * 
 * When to add back (V2):
 * - >50k consignment leads
 * - Need historical trend analysis (year-over-year)
 * - Running comparative reports across all partners
 */
