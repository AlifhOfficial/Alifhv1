/**
 * Auth Cache Invalidation Functions
 * Use these when user roles or partner memberships change
 */

import { memoryCache, CacheKeys } from "../memory-cache";

/**
 * Invalidate user session cache after changes
 * Call this when:
 * - User role changes
 * - Partner membership added/removed/updated
 * - User banned/unbanned
 */
export function invalidateUserSession(userId: string): void {
  memoryCache.delete(CacheKeys.userSession(userId));
}

/**
 * Invalidate multiple user sessions at once
 */
export function invalidateUserSessions(userIds: string[]): void {
  const keys = userIds.map(id => CacheKeys.userSession(id));
  memoryCache.delete(...keys);
}

/**
 * Invalidate all partner staff sessions when partner data changes
 * Use when partner is suspended, deleted, or tier changes
 */
export async function invalidatePartnerStaffSessions(partnerId: string): Promise<void> {
  // This would require querying all staff IDs for the partner
  // For now, we can document that partner changes take up to 30s to reflect
}
