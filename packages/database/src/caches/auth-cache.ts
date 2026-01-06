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
 * Lives in caches/ alongside memory-cache.ts because it directly manipulates
 * the cache layer. Provides domain-specific invalidation functions for auth
 * workflows while keeping cache concerns isolated from query logic.
 * 
 * CACHE STRATEGY:
 * - Session cache TTL: 5 minutes (in Redis for serverless)
 * - Invalidate eagerly on mutations to prevent stale role/permission data
 * - Partner staff changes reflect within 5min without invalidation
 * 
 * NOTE: Redis invalidation is handled by the web app's sessionCache module.
 * This module is kept for backward compatibility but the actual invalidation
 * happens via the exported invalidateSessionCache callback set by the web app.
 * 
 * @module caches/auth-cache
 */

import { CacheKeys } from "./memory-cache";

// Callback to invalidate session in Redis (set by web app at startup)
let invalidateSessionCacheCallback: ((key: string) => Promise<void>) | null = null;

/**
 * Register the Redis cache invalidation callback
 * Called by the web app to connect the database package to Redis
 */
export function setSessionCacheInvalidator(callback: (key: string) => Promise<void>): void {
  invalidateSessionCacheCallback = callback;
}

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
  const key = CacheKeys.userSession(userId);
  
  // Fire and forget - don't block the mutation
  if (invalidateSessionCacheCallback) {
    invalidateSessionCacheCallback(key).catch(err => {
      console.error('[auth-cache] Failed to invalidate session:', err);
    });
  }
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
  userIds.forEach(id => invalidateUserSession(id));
}

/**
 * Invalidate partner staff sessions (NOT IMPLEMENTED)
 * 
 * @param partnerId - Partner ID whose staff sessions to invalidate
 * @deprecated Partner changes reflect within 5min cache TTL naturally.
 * Only implement if immediate invalidation becomes critical.
 */
export async function invalidatePartnerStaffSessions(partnerId: string): Promise<void> {
  // Would require: SELECT userId FROM partnerMembership WHERE partnerId = ?
  // Then: invalidateUserSessions(staffUserIds)
  // Current: Accept 5min delay for partner-level changes
}
