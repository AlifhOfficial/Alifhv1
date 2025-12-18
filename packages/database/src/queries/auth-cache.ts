/**
 * Auth Cache Invalidation - Production
 * 
 * Cache invalidation utilities for user session management.
 * 
 * USAGE:
 * - Call after role changes (admin promotions/demotions)
 * - Call after partner membership updates (staff added/removed)
 * - Call after account status changes (banned/unbanned)
 * 
 * PLACEMENT RATIONALE:
 * Located in queries/ instead of utils/ because it directly manipulates
 * database-related cache (memoryCache) and is tightly coupled with
 * session query patterns. Not a general utility - specific to auth workflows.
 * 
 * CACHE STRATEGY:
 * - Session cache TTL: 30 seconds
 * - Invalidate eagerly on mutations to prevent stale role/permission data
 * - Partner staff changes reflect within 30s without invalidation
 * 
 * @module queries/auth-cache
 */

import { memoryCache, CacheKeys } from "../caches";

/**
 * Invalidate user session cache after auth changes
 * 
 * @param userId - User ID whose session cache to invalidate
 * @example
 * // After promoting user to admin
 * await promoteToAdmin(userId);
 * invalidateUserSession(userId);
 */
export function invalidateUserSession(userId: string): void {
  memoryCache.delete(CacheKeys.userSession(userId));
}

/**
 * Batch invalidate multiple user sessions
 * 
 * @param userIds - Array of user IDs
 * @example
 * // After bulk role updates
 * await bulkUpdateRoles(userIds, newRole);
 * invalidateUserSessions(userIds);
 */
export function invalidateUserSessions(userIds: string[]): void {
  const keys = userIds.map(id => CacheKeys.userSession(id));
  memoryCache.delete(...keys);
}

/**
 * Invalidate partner staff sessions (NOT IMPLEMENTED)
 * 
 * @param partnerId - Partner ID whose staff sessions to invalidate
 * @deprecated Partner changes reflect within 30s cache TTL naturally.
 * Only implement if immediate invalidation becomes critical.
 */
export async function invalidatePartnerStaffSessions(partnerId: string): Promise<void> {
  // Would require: SELECT userId FROM partnerMembership WHERE partnerId = ?
  // Then: invalidateUserSessions(staffUserIds)
  // Current: Accept 30s delay for partner-level changes
}
