/**
 * Database Queries: Ban Appeals
 * Admin operations for managing ban appeals
 */

import { db } from '../../dbclient';
import { banAppeal, user, userProfile } from '../../schema';
import { eq, desc, inArray } from 'drizzle-orm';

/**
 * Create a ban appeal (user-facing)
 */
export async function createBanAppeal(userId: string, message: string): Promise<{ success: boolean }> {
  await db.insert(banAppeal).values({
    userId,
    message: message.trim(),
    status: 'pending',
  });

  return { success: true };
}

/**
 * Get all ban appeals for admin review
 * Uses batched queries instead of N+1 pattern
 */
export async function getAdminBanAppeals(status?: 'pending' | 'approved' | 'rejected') {
  const whereClause = status ? eq(banAppeal.status, status) : undefined;

  // Get all appeals
  const appeals = await db.query.banAppeal.findMany({
    where: whereClause,
    orderBy: [desc(banAppeal.createdAt)],
  });

  if (appeals.length === 0) return [];

  // Collect all user IDs (appeal users + reviewers)
  const userIds = [...new Set([
    ...appeals.map(a => a.userId),
    ...appeals.filter(a => a.reviewedBy).map(a => a.reviewedBy!),
  ])];

  // Batch fetch all users and profiles in 2 queries instead of N*3
  const [users, profiles] = await Promise.all([
    db.select({
      id: user.id,
      name: user.name,
      email: user.email,
      banned: user.banned,
      banReason: user.banReason,
      banExpires: user.banExpires,
    }).from(user).where(inArray(user.id, userIds)),
    
    db.select({
      userId: userProfile.userId,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      phone: userProfile.phone,
    }).from(userProfile).where(inArray(userProfile.userId, appeals.map(a => a.userId))),
  ]);

  // Create lookup maps
  const userMap = new Map(users.map(u => [u.id, u]));
  const profileMap = new Map(profiles.map(p => [p.userId, p]));

  // Assemble results in memory
  return appeals.map(appeal => {
    const appealUser = userMap.get(appeal.userId);
    const profile = profileMap.get(appeal.userId);
    const reviewer = appeal.reviewedBy ? userMap.get(appeal.reviewedBy) : null;

    return {
      appeal,
      user: appealUser ? {
        id: appealUser.id,
        name: appealUser.name,
        email: appealUser.email,
        banned: appealUser.banned,
        banReason: appealUser.banReason,
        banExpires: appealUser.banExpires,
      } : null,
      userProfile: profile ? {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
      } : null,
      reviewer: reviewer ? {
        id: reviewer.id,
        name: reviewer.name,
        email: reviewer.email,
      } : null,
    };
  });
}

/**
 * Approve a ban appeal (uses transaction for consistency)
 */
export async function approveBanAppeal(appealId: string, reviewerId: string, reviewNote?: string) {
  return await db.transaction(async (tx) => {
    const appeal = await tx.query.banAppeal.findFirst({
      where: eq(banAppeal.id, appealId),
    });

    if (!appeal) {
      throw new Error('Appeal not found');
    }

    // Update appeal status and unban user atomically
    await Promise.all([
      tx.update(banAppeal).set({
        status: 'approved',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        reviewNote: reviewNote || null,
      }).where(eq(banAppeal.id, appealId)),

      tx.update(user).set({
        banned: false,
        banReason: null,
        banExpires: null,
      }).where(eq(user.id, appeal.userId)),
    ]);

    return { success: true };
  });
}

/**
 * Reject a ban appeal
 */
export async function rejectBanAppeal(appealId: string, reviewerId: string, reviewNote?: string) {
  await db
    .update(banAppeal)
    .set({
      status: 'rejected',
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      reviewNote: reviewNote || null,
    })
    .where(eq(banAppeal.id, appealId));

  return { success: true };
}
