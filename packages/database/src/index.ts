/**
 * Database Package - Production
 * 
 * Centralized database access with Drizzle ORM, schemas, queries, and caching.
 * 
 * @module @alifh/database
 */

// Re-export drizzle-orm utilities so consumers don't need direct dependency
export { 
  eq, and, or, ne, gt, gte, lt, lte, 
  like, ilike, notLike, notIlike,
  inArray, notInArray,
  isNull, isNotNull,
  between, notBetween,
  sql, 
  desc, asc,
  exists, notExists,
  count, sum, avg, min, max,
} from 'drizzle-orm';

// Re-export cuid2 for ID generation
export { createId } from '@paralleldrive/cuid2';

export * from './dbclient';
export * from './schema';
export * as googleReviews from './services/google-reviews';
export * from './queries';
export * from './caches';

// Explicit admin query exports (required for proper bundling)
export * from './queries/admin/user-management-query';
export * from './queries/admin/user-operations-query';
export * from './queries/admin/partner-operations-query';
export * from './queries/admin/ban-appeals-query';
export * from './queries/admin/kyc-query';
export * from './queries/admin/listings-admin-query';

// Explicit auth query exports (required for proper bundling)
export * from './queries/auth/user-auth-queries';

// Explicit partner query exports (required for proper bundling)
export * from './queries/partner/car-dealer/partner-profile-comprehensive';
export * from './queries/partner/staff-profile-query';

// ❌ DO NOT export partner-stats here - it causes Edge Runtime errors in middleware
// Stats query uses dbclient which doesn't work in Edge Runtime
// API routes must import directly from the file (see below)

// Explicit booking query exports (required for proper bundling)
export * from './queries/booking/availability-queries';
export * from './queries/booking/booking-queries';
export * from './queries/booking/booking-mutations';

// Explicit listings + consignment query exports (required for proper bundling)
export * from './queries/listings/car-listings/car-listing-context-query';
export * from './queries/listings/car-listings/search-query';
export * from './queries/listings/black-listings-query';
export * from './queries/consignment/partner-consignment-preferences-query';
export * from './queries/consignment/partner-consignment-leads-query';

// Explicit audit query exports (required for proper bundling)
export * from './queries/audit/audit-log-mutations';

// Explicit conversation query exports (required for proper bundling)
export * from './queries/conversation';
