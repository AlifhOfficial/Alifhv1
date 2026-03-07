import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { partner } from './partner';

/**
 * Consignment Funnel Filters Type
 * 
 * These match the existing listing search filters for consistency.
 * When a funnel is viewed, we query listings with these filters +
 * openToConsignment = true + partnerId IS NULL (user listings only)
 */
export type ConsignmentFunnelFilters = {
  // Vehicle basics
  makes?: string[];           // ["Mercedes-Benz", "BMW", "Porsche"]
  models?: string[];          // ["C-Class", "3 Series", "911"]
  bodyTypes?: string[];       // ["sedan", "suv", "coupe"]
  fuelTypes?: string[];       // ["petrol", "electric", "hybrid"]
  
  // Year range
  minYear?: number;           // 2020
  maxYear?: number;           // 2024
  
  // Price range (in AED)
  minPrice?: number;          // 50000
  maxPrice?: number;          // 500000
  
  // Mileage
  maxMileage?: number;        // 50000 km
  
  // Location
  emirates?: string[];        // ["Dubai", "Abu Dhabi"]
  
  // Specs
  specs?: string[];           // ["gcc", "american"]
};

/**
 * Consignment Funnel Table
 * 
 * A "funnel" is a saved search that partners use to find potential consignment listings.
 * Partners can create multiple funnels (e.g., "Luxury Sedans 2020+", "Budget SUVs").
 * 
 * When viewing a funnel, we query live listings matching the filters:
 * - openToConsignment = true (user opted in)
 * - partnerId IS NULL (exclude dealer listings - no dealer wants to reconsign)
 * - moderationStatus = 'approved', lifecycleStatus = 'active' (public listings)
 * - Apply funnel filters (makes, year range, price range, etc.)
 * 
 * No separate "leads" table needed - leads are just matching listings fetched on-demand.
 */
export const consignmentFunnel = pgTable('consignment_funnel', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partner.id, { onDelete: 'cascade' }),
  staffId: text('staff_id').notNull(), // Staff member who owns this funnel
  
  // Funnel identity
  name: text('name').notNull(),           // "Luxury Sedans 2020+", "Budget SUVs"
  description: text('description'),        // Optional notes about this funnel
  
  // Saved search filters (matches listing search)
  filters: jsonb('filters').$type<ConsignmentFunnelFilters>().notNull(),
  
  // UI ordering
  position: integer('position').default(0).notNull(),
  
  // Is funnel active? (can disable without deleting)
  isActive: boolean('is_active').default(true).notNull(),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('consignment_funnel_partnerId_idx').on(table.partnerId),
  index('consignment_funnel_staffId_idx').on(table.staffId),
  index('consignment_funnel_partnerId_staffId_idx').on(table.partnerId, table.staffId),
  index('consignment_funnel_isActive_idx').on(table.isActive),
]);

/**
 * SIMPLIFIED V1 CONSIGNMENT FLOW
 * 
 * 1. User creates listing with openToConsignment = true (opt-in toggle in settings)
 * 2. Partner creates funnels with filter criteria
 * 3. Partner staff views funnel in dashboard → we query matching listings
 * 4. Partner contacts user through existing messaging system
 * 5. Deal happens offline (or via future escrow flow)
 * 
 * NO lead tracking table - just saved searches + live listing queries.
 * 
 * V2 Additions (if needed):
 * - Track which listings partner has "contacted" or "dismissed"
 * - Analytics on funnel performance (views → contacts → deals)
 * - Notification when new listing matches a funnel
 */
