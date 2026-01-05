/**
 * Database Queries: Feedback
 * User and admin operations for managing feedback
 */

import { db } from '../../dbclient';
import { feedback, user, userProfile } from '../../schema';
import { eq, desc, inArray, and, count } from 'drizzle-orm';

/**
 * Create feedback (user-facing)
 */
export async function createFeedback(userId: string, title: string, content: string): Promise<{ success: boolean; id: string }> {
  const [created] = await db.insert(feedback).values({
    userId,
    title: title.trim(),
    content: content.trim(),
    status: 'new',
  }).returning({ id: feedback.id });

  return { success: true, id: created.id };
}

/**
 * Get user's own feedback submissions
 */
export async function getUserFeedback(userId: string) {
  return db.query.feedback.findMany({
    where: eq(feedback.userId, userId),
    orderBy: [desc(feedback.createdAt)],
  });
}

/**
 * Get all feedback for admin review
 * Uses batched queries instead of N+1 pattern
 */
export async function getAdminFeedback(status?: 'new' | 'reviewed' | 'archived') {
  const whereClause = status ? eq(feedback.status, status) : undefined;

  // Get all feedback
  const feedbackItems = await db.query.feedback.findMany({
    where: whereClause,
    orderBy: [desc(feedback.createdAt)],
  });

  if (feedbackItems.length === 0) return [];

  // Collect all user IDs (feedback users + reviewers)
  const userIds = [...new Set([
    ...feedbackItems.map(f => f.userId),
    ...feedbackItems.filter(f => f.reviewedBy).map(f => f.reviewedBy!),
  ])];

  // Batch fetch all users and profiles in 2 queries
  const [users, profiles] = await Promise.all([
    db.select({
      id: user.id,
      name: user.name,
      email: user.email,
    }).from(user).where(inArray(user.id, userIds)),
    
    db.select({
      userId: userProfile.userId,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
    }).from(userProfile).where(inArray(userProfile.userId, feedbackItems.map(f => f.userId))),
  ]);

  // Create lookup maps
  const userMap = new Map(users.map(u => [u.id, u]));
  const profileMap = new Map(profiles.map(p => [p.userId, p]));

  // Assemble results in memory
  return feedbackItems.map(item => {
    const feedbackUser = userMap.get(item.userId);
    const profile = profileMap.get(item.userId);
    const reviewer = item.reviewedBy ? userMap.get(item.reviewedBy) : null;

    return {
      feedback: item,
      user: feedbackUser ? {
        id: feedbackUser.id,
        name: feedbackUser.name,
        email: feedbackUser.email,
      } : null,
      userProfile: profile ? {
        firstName: profile.firstName,
        lastName: profile.lastName,
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
 * Mark feedback as reviewed
 */
export async function reviewFeedback(
  feedbackId: string, 
  reviewerId: string, 
  status: 'reviewed' | 'archived',
  adminNote?: string
) {
  await db.update(feedback)
    .set({
      status,
      isRead: true,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      adminNote: adminNote?.trim(),
    })
    .where(eq(feedback.id, feedbackId));

  return { success: true };
}

/**
 * Mark feedback as read (without changing status)
 */
export async function markFeedbackRead(feedbackId: string) {
  await db.update(feedback)
    .set({ isRead: true })
    .where(eq(feedback.id, feedbackId));

  return { success: true };
}

/**
 * Get unread feedback count for admin dashboard
 */
export async function getUnreadFeedbackCount() {
  const [result] = await db.select({ count: count() })
    .from(feedback)
    .where(eq(feedback.isRead, false));
  
  return result?.count ?? 0;
}

/**
 * Delete feedback (admin only)
 */
export async function deleteFeedback(feedbackId: string) {
  await db.delete(feedback).where(eq(feedback.id, feedbackId));
  return { success: true };
}
