/**
 * Admin User Operations Queries
 * 
 * Direct database operations for admin user management
 * Simple, straightforward operations without hooks
 * Uses atomic PostgreSQL operations for concurrent safety
 * 
 * @module queries/admin/user-operations-query
 */

import { eq, sql } from 'drizzle-orm';
import { db } from '../../dbclient';
import { user } from '../../schema/auth';
import { userProfile } from '../../schema/profile';

// ============================================================================
// Ban/Unban Operations
// ============================================================================

/**
 * Ban a user
 */
export async function banUser(input: {
  userId: string;
  reason: string;
  expiresAt?: Date | null;
  bannedBy: string; // admin user id
}) {
  const [updated] = await db
    .update(user)
    .set({
      banned: true,
      banReason: input.reason,
      banExpires: input.expiresAt,
      updatedAt: new Date(),
    })
    .where(eq(user.id, input.userId))
    .returning();

  return updated;
}

/**
 * Unban a user
 */
export async function unbanUser(userId: string) {
  const [updated] = await db
    .update(user)
    .set({
      banned: false,
      banReason: null,
      banExpires: null,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId))
    .returning();

  return updated;
}

// ============================================================================
// Role Management
// ============================================================================

/**
 * Update user role
 */
export async function updateUserRole(input: {
  userId: string;
  role: 'user' | 'admin' | 'super_admin';
  updatedBy: string; // admin user id
}) {
  const [updated] = await db
    .update(user)
    .set({
      role: input.role,
      updatedAt: new Date(),
    })
    .where(eq(user.id, input.userId))
    .returning();

  return updated;
}

// ============================================================================
// Profile Operations
// ============================================================================

/**
 * Update user tags (for flagging, categorizing)
 */
export async function updateUserTags(userId: string, tags: string[]) {
  const [updated] = await db
    .update(userProfile)
    .set({
      tags,
      updatedAt: new Date(),
    })
    .where(eq(userProfile.userId, userId))
    .returning();

  return updated;
}

/**
 * Add tag to user (atomic - no race condition)
 */
export async function addUserTag(userId: string, tag: string) {
  const [updated] = await db
    .update(userProfile)
    .set({
      tags: sql`array_append(coalesce(${userProfile.tags}, '{}'), ${tag})`,
      updatedAt: new Date(),
    })
    .where(sql`${userProfile.userId} = ${userId} AND NOT (${tag} = ANY(coalesce(${userProfile.tags}, '{}')))`)
    .returning();

  // If no update (tag already exists), fetch current profile
  if (!updated) {
    const [profile] = await db.select().from(userProfile).where(eq(userProfile.userId, userId)).limit(1);
    return profile;
  }

  return updated;
}

/**
 * Remove tag from user (atomic - no race condition)
 */
export async function removeUserTag(userId: string, tag: string) {
  const [updated] = await db
    .update(userProfile)
    .set({
      tags: sql`array_remove(coalesce(${userProfile.tags}, '{}'), ${tag})`,
      updatedAt: new Date(),
    })
    .where(eq(userProfile.userId, userId))
    .returning();

  return updated;
}

// ============================================================================
// Badge Operations
// ============================================================================

/**
 * Add badge to user (atomic - no race condition)
 */
export async function addUserBadge(userId: string, badge: string) {
  const [updated] = await db
    .update(userProfile)
    .set({
      badges: sql`array_append(coalesce(${userProfile.badges}, '{}'), ${badge})`,
      updatedAt: new Date(),
    })
    .where(sql`${userProfile.userId} = ${userId} AND NOT (${badge} = ANY(coalesce(${userProfile.badges}, '{}')))`)
    .returning();

  // If no update (badge already exists), fetch current profile
  if (!updated) {
    const [profile] = await db.select().from(userProfile).where(eq(userProfile.userId, userId)).limit(1);
    return profile;
  }

  return updated;
}

/**
 * Remove badge from user (atomic - no race condition)
 */
export async function removeUserBadge(userId: string, badge: string) {
  const [updated] = await db
    .update(userProfile)
    .set({
      badges: sql`array_remove(coalesce(${userProfile.badges}, '{}'), ${badge})`,
      updatedAt: new Date(),
    })
    .where(eq(userProfile.userId, userId))
    .returning();

  return updated;
}

// ============================================================================
// Email/Phone Verification
// ============================================================================

/**
 * Manually verify user email (admin override)
 */
export async function verifyUserEmail(userId: string) {
  const [updated] = await db
    .update(user)
    .set({
      emailVerified: true,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId))
    .returning();

  return updated;
}

/**
 * Manually verify user phone (admin override)
 */
export async function verifyUserPhone(userId: string) {
  const [updated] = await db
    .update(user)
    .set({
      phoneVerified: true,
      phoneVerifiedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId))
    .returning();

  return updated;
}

// ============================================================================
// Delete User
// ============================================================================

/**
 * Admin delete user (hard delete - use with caution)
 */
export async function adminDeleteUser(userId: string) {
  const [deleted] = await db
    .delete(user)
    .where(eq(user.id, userId))
    .returning();

  return deleted;
}
