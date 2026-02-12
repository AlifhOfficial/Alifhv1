/**
 * Push Token Queries
 * CRUD operations for managing push notification device tokens
 */

import { eq, and, desc, inArray, sql } from 'drizzle-orm';
import { db } from '../../dbclient';
import { pushDeviceToken, pushNotificationPreferences } from '../../schema/notifications';
import { randomUUID } from 'crypto';

// ============================================================================
// PUSH TOKEN OPERATIONS
// ============================================================================

/**
 * Register or update a push device token
 * Upserts based on the token value (one token = one device)
 */
export async function registerPushToken(data: {
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceId?: string;
  deviceName?: string;
}): Promise<{ id: string; created: boolean }> {
  // Check if token already exists
  const existing = await db
    .select({ id: pushDeviceToken.id, userId: pushDeviceToken.userId })
    .from(pushDeviceToken)
    .where(eq(pushDeviceToken.token, data.token))
    .limit(1);

  if (existing.length > 0) {
    // Token exists - update ownership to current user and reactivate
    await db
      .update(pushDeviceToken)
      .set({
        userId: data.userId,
        platform: data.platform,
        deviceId: data.deviceId,
        deviceName: data.deviceName,
        isActive: true,
        lastUsedAt: new Date(),
        failedAttempts: '0',
        lastError: null,
        updatedAt: new Date(),
      })
      .where(eq(pushDeviceToken.id, existing[0].id));

    return { id: existing[0].id, created: false };
  }

  // Create new token
  const id = randomUUID();
  await db.insert(pushDeviceToken).values({
    id,
    userId: data.userId,
    token: data.token,
    platform: data.platform,
    deviceId: data.deviceId,
    deviceName: data.deviceName,
  });

  // Ensure user has notification preferences
  await ensureNotificationPreferences(data.userId);

  return { id, created: true };
}

/**
 * Unregister a push token (device logged out)
 */
export async function unregisterPushToken(token: string): Promise<boolean> {
  const result = await db
    .update(pushDeviceToken)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(pushDeviceToken.token, token));

  return (result.rowCount ?? 0) > 0;
}

/**
 * Get all active push tokens for a user
 */
export async function getUserPushTokens(userId: string): Promise<string[]> {
  const tokens = await db
    .select({ token: pushDeviceToken.token })
    .from(pushDeviceToken)
    .where(and(
      eq(pushDeviceToken.userId, userId),
      eq(pushDeviceToken.isActive, true)
    ));

  return tokens.map(t => t.token);
}

/**
 * Get active push tokens for multiple users
 */
export async function getMultipleUsersPushTokens(userIds: string[]): Promise<Map<string, string[]>> {
  if (userIds.length === 0) return new Map();

  const tokens = await db
    .select({ 
      userId: pushDeviceToken.userId, 
      token: pushDeviceToken.token 
    })
    .from(pushDeviceToken)
    .where(and(
      inArray(pushDeviceToken.userId, userIds),
      eq(pushDeviceToken.isActive, true)
    ));

  const result = new Map<string, string[]>();
  for (const { userId, token } of tokens) {
    const existing = result.get(userId) || [];
    existing.push(token);
    result.set(userId, existing);
  }

  return result;
}

/**
 * Mark a token as failed (delivery error)
 */
export async function markTokenFailed(token: string, error: string): Promise<void> {
  await db
    .update(pushDeviceToken)
    .set({
      failedAttempts: sql`CAST((CAST(failed_attempts AS INTEGER) + 1) AS TEXT)`,
      lastError: error,
      lastErrorAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(pushDeviceToken.token, token));
}

/**
 * Deactivate tokens with too many failures
 */
export async function deactivateFailedTokens(maxAttempts: number = 5): Promise<number> {
  const result = await db
    .update(pushDeviceToken)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(
      eq(pushDeviceToken.isActive, true),
      sql`CAST(${pushDeviceToken.failedAttempts} AS INTEGER) >= ${maxAttempts}`
    ));

  return result.rowCount ?? 0;
}

/**
 * Update token last used timestamp
 */
export async function touchPushToken(token: string): Promise<void> {
  await db
    .update(pushDeviceToken)
    .set({ lastUsedAt: new Date(), failedAttempts: '0' })
    .where(eq(pushDeviceToken.token, token));
}

// ============================================================================
// NOTIFICATION PREFERENCES
// ============================================================================

/**
 * Ensure a user has notification preferences (creates default if missing)
 */
export async function ensureNotificationPreferences(userId: string): Promise<void> {
  const existing = await db
    .select({ id: pushNotificationPreferences.id })
    .from(pushNotificationPreferences)
    .where(eq(pushNotificationPreferences.userId, userId))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(pushNotificationPreferences).values({
      id: randomUUID(),
      userId,
    });
  }
}

/**
 * Get user's notification preferences
 */
export async function getNotificationPreferences(userId: string) {
  const prefs = await db
    .select()
    .from(pushNotificationPreferences)
    .where(eq(pushNotificationPreferences.userId, userId))
    .limit(1);

  if (prefs.length === 0) {
    // Create default preferences
    await ensureNotificationPreferences(userId);
    return getNotificationPreferences(userId);
  }

  return prefs[0];
}

/**
 * Update user's notification preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  updates: Partial<{
    newMessage: boolean;
    listingApproved: boolean;
    listingRejected: boolean;
    listingViewed: boolean;
    listingSaved: boolean;
    newEnquiry: boolean;
    priceDrops: boolean;
    bookingRequest: boolean;
    bookingConfirmed: boolean;
    bookingReminder: boolean;
    promotions: boolean;
  }>
): Promise<void> {
  await db
    .update(pushNotificationPreferences)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(pushNotificationPreferences.userId, userId));
}

/**
 * Check if user wants a specific notification type
 */
export async function shouldSendPushNotification(
  userId: string,
  notificationType: keyof Omit<typeof pushNotificationPreferences.$inferSelect, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<boolean> {
  const prefs = await getNotificationPreferences(userId);
  return prefs[notificationType] ?? true;
}
