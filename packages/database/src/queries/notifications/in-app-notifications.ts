/**
 * In-App Notification Queries
 * CRUD operations for the notification center feed
 */

import { eq, and, desc, sql, lt, count } from 'drizzle-orm';
import { db } from '../../dbclient';
import { notification } from '../../schema/notifications';
import { randomUUID } from 'crypto';
import type { NewNotification } from '../../schema/notifications';

// ============================================================================
// CREATE
// ============================================================================

/**
 * Create a new in-app notification
 */
export async function createNotification(data: Omit<NewNotification, 'id' | 'createdAt'>): Promise<string> {
  const id = randomUUID();

  await db.insert(notification).values({
    id,
    ...data,
  });

  return id;
}

/**
 * Create multiple in-app notifications (batch)
 */
export async function createNotifications(items: Omit<NewNotification, 'id' | 'createdAt'>[]): Promise<string[]> {
  if (items.length === 0) return [];

  const records = items.map(item => ({
    id: randomUUID(),
    ...item,
  }));

  await db.insert(notification).values(records);

  return records.map(r => r.id);
}

// ============================================================================
// READ
// ============================================================================

/**
 * Get paginated notifications for a user
 */
export async function getUserNotifications(
  userId: string,
  options: {
    limit?: number;
    cursor?: string; // ISO timestamp for cursor-based pagination
    unreadOnly?: boolean;
  } = {}
): Promise<{
  notifications: typeof notification.$inferSelect[];
  nextCursor: string | null;
  hasMore: boolean;
}> {
  const limit = options.limit || 20;
  
  const conditions = [eq(notification.userId, userId)];
  
  if (options.unreadOnly) {
    conditions.push(eq(notification.isRead, false));
  }
  
  if (options.cursor) {
    conditions.push(lt(notification.createdAt, new Date(options.cursor)));
  }

  const results = await db
    .select()
    .from(notification)
    .where(and(...conditions))
    .orderBy(desc(notification.createdAt))
    .limit(limit + 1); // fetch one extra to check hasMore

  const hasMore = results.length > limit;
  const notifications = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore && notifications.length > 0
    ? notifications[notifications.length - 1].createdAt.toISOString()
    : null;

  return { notifications, nextCursor, hasMore };
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const result = await db
    .select({ count: count() })
    .from(notification)
    .where(and(
      eq(notification.userId, userId),
      eq(notification.isRead, false),
    ));

  return result[0]?.count ?? 0;
}

// ============================================================================
// UPDATE
// ============================================================================

/**
 * Mark a single notification as read
 */
export async function markNotificationRead(notificationId: string, userId: string): Promise<boolean> {
  const result = await db
    .update(notification)
    .set({ isRead: true, readAt: new Date() })
    .where(and(
      eq(notification.id, notificationId),
      eq(notification.userId, userId),
    ));

  return true;
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsRead(userId: string): Promise<number> {
  const result = await db
    .update(notification)
    .set({ isRead: true, readAt: new Date() })
    .where(and(
      eq(notification.userId, userId),
      eq(notification.isRead, false),
    ));

  // Return updated count (drizzle neon-http doesn't return rowCount, so return 0)
  return 0;
}

// ============================================================================
// DELETE
// ============================================================================

/**
 * Delete a single notification
 */
export async function deleteNotification(notificationId: string, userId: string): Promise<boolean> {
  await db
    .delete(notification)
    .where(and(
      eq(notification.id, notificationId),
      eq(notification.userId, userId),
    ));

  return true;
}

/**
 * Delete all notifications for a user
 */
export async function deleteAllNotifications(userId: string): Promise<void> {
  await db
    .delete(notification)
    .where(eq(notification.userId, userId));
}

/**
 * Clean up old read notifications (older than 30 days)
 */
export async function cleanupOldNotifications(daysOld: number = 30): Promise<void> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysOld);

  await db
    .delete(notification)
    .where(and(
      eq(notification.isRead, true),
      lt(notification.createdAt, cutoff),
    ));
}
