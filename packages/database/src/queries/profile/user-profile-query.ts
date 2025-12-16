/**
 * User Profile Queries - Simplified for Profile View
 * Only includes fields actually used in the UI
 */

import { createId } from '@paralleldrive/cuid2';
import { eq } from 'drizzle-orm';
import { db } from '../../dbclient';
import { userProfile } from '../../schema/profile';

const PROFILE_ID_PREFIX = 'prof_';
const makeProfileId = () => `${PROFILE_ID_PREFIX}${createId()}`;

// Minimal profile type - only UI-used fields
export type UserProfileRecord = typeof userProfile.$inferSelect;
export type UserProfileUpdate = Partial<{
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  description: string | null;
  locationCity: string | null;
  locationEmirate: string | null;
  locationLat: number | null;
  locationLng: number | null;
  tags: string[];
  consignmentMode: boolean;
  privacySettings: { showPhone?: boolean };
  avatar: string | null;
}>;

/**
 * Get profile by user ID
 */
export const getUserProfileByUserId = async (userId: string): Promise<UserProfileRecord | null> => {
  const [result] = await db
    .select()
    .from(userProfile)
    .where(eq(userProfile.userId, userId))
    .limit(1);

  return result ?? null;
};

/**
 * Update profile by user ID
 */
export const updateUserProfileByUserId = async (
  userId: string,
  updates: UserProfileUpdate
): Promise<UserProfileRecord | null> => {
  // Remove undefined values
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined)
  );

  if (Object.keys(cleanUpdates).length === 0) {
    return getUserProfileByUserId(userId);
  }

  const [result] = await db
    .update(userProfile)
    .set({
      ...cleanUpdates,
      updatedAt: new Date(),
    })
    .where(eq(userProfile.userId, userId))
    .returning();

  return result ?? null;
};

/**
 * Ensure profile exists (create if doesn't exist)
 */
export const ensureUserProfile = async (userId: string): Promise<UserProfileRecord> => {
  const existing = await getUserProfileByUserId(userId);
  if (existing) return existing;

  const [result] = await db
    .insert(userProfile)
    .values({
      id: makeProfileId(),
      userId,
    })
    .returning();

  return result;
};
