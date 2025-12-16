/**
 * User Profile Queries - Simplified for Profile View
 * Only includes fields actually used in the UI
 */

import { createId } from '@paralleldrive/cuid2';
import { eq } from 'drizzle-orm';
import { db } from '../../dbclient';
import { userProfile } from '../../schema/profile';
import { user } from '../../schema/auth';

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
  status: string;
}>;

/**
 * Get profile by user ID with email verification status
 */
export const getUserProfileByUserId = async (userId: string): Promise<(UserProfileRecord & { emailVerified: boolean; phoneVerified: boolean }) | null> => {
  const [profileResult] = await db
    .select()
    .from(userProfile)
    .where(eq(userProfile.userId, userId))
    .limit(1);

  if (!profileResult) return null;

  // Get email and phone verification status from user table
  const [userResult] = await db
    .select({ 
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return {
    ...profileResult,
    emailVerified: userResult?.emailVerified ?? false,
    phoneVerified: userResult?.phoneVerified ?? false,
  };
};

/**
 * Update profile by user ID
 */
export const updateUserProfileByUserId = async (
  userId: string,
  updates: UserProfileUpdate
): Promise<(UserProfileRecord & { emailVerified: boolean; phoneVerified: boolean }) | null> => {
  // Remove undefined values
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined)
  );

  if (Object.keys(cleanUpdates).length === 0) {
    return getUserProfileByUserId(userId);
  }

  // If phone number is being updated, check if it changed and clear verification
  if (cleanUpdates.phone !== undefined) {
    const currentProfile = await getUserProfileByUserId(userId);
    if (currentProfile && currentProfile.phone !== cleanUpdates.phone) {
      // Phone number changed - clear verification in user table
      await db
        .update(user)
        .set({ phoneVerified: false })
        .where(eq(user.id, userId));
    }
  }

  const [result] = await db
    .update(userProfile)
    .set({
      ...cleanUpdates,
      updatedAt: new Date(),
    })
    .where(eq(userProfile.userId, userId))
    .returning();

  if (!result) return null;

  // Fetch complete profile with verification status
  return getUserProfileByUserId(userId);
};

/**
 * Ensure profile exists (create if doesn't exist)
 */
export const ensureUserProfile = async (userId: string): Promise<UserProfileRecord & { emailVerified: boolean; phoneVerified: boolean }> => {
  const existing = await getUserProfileByUserId(userId);
  if (existing) return existing;

  const [result] = await db
    .insert(userProfile)
    .values({
      id: makeProfileId(),
      userId,
    })
    .returning();

  // Get email and phone verification status for newly created profile
  const [userResult] = await db
    .select({ 
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return {
    ...result,
    emailVerified: userResult?.emailVerified ?? false,
    phoneVerified: userResult?.phoneVerified ?? false,
  };
};
