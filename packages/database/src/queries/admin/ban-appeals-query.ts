/**
 * Database Queries: Ban Appeals
 * Admin operations for managing ban appeals
 */

import { db } from '../../dbclient';
import { banAppeal, user, userProfile } from '../../schema';
import { eq, desc, and } from 'drizzle-orm';

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
 */
export async function getAdminBanAppeals(status?: 'pending' | 'approved' | 'rejected') {
  const whereClause = status ? eq(banAppeal.status, status) : undefined;

  const appeals = await db.query.banAppeal.findMany({
    where: whereClause,
    orderBy: [desc(banAppeal.createdAt)],
    with: {
      // This will need relations defined in schema
    }
  });

  // Manual join for now - we'll add relations later
  const appealsWithDetails = await Promise.all(
    appeals.map(async (appeal) => {
      const appealUser = await db.query.user.findFirst({
        where: eq(user.id, appeal.userId),
      });
      
      const profile = await db.query.userProfile.findFirst({
        where: eq(userProfile.userId, appeal.userId),
      });

      let reviewer = null;
      if (appeal.reviewedBy) {
        reviewer = await db.query.user.findFirst({
          where: eq(user.id, appeal.reviewedBy),
        });
      }

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
    })
  );

  return appealsWithDetails;
}

/**
 * Approve a ban appeal
 */
export async function approveBanAppeal(appealId: string, reviewerId: string, reviewNote?: string) {
  const appeal = await db.query.banAppeal.findFirst({
    where: eq(banAppeal.id, appealId),
  });

  if (!appeal) {
    throw new Error('Appeal not found');
  }

  // Update appeal status
  await db
    .update(banAppeal)
    .set({
      status: 'approved',
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      reviewNote: reviewNote || null,
    })
    .where(eq(banAppeal.id, appealId));

  // Unban the user
  await db
    .update(user)
    .set({
      banned: false,
      banReason: null,
      banExpires: null,
    })
    .where(eq(user.id, appeal.userId));

  return { success: true };
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
