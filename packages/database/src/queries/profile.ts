/**
 * User Profile Queries
 *
 * Base CRUD helpers around the `user_profile` table. Keep the surface thin so
 * API and service layers can compose higher-order behaviours without leaking
 * Drizzle details to the rest of the app.
 */

import { createId } from '@paralleldrive/cuid2';
import { eq } from 'drizzle-orm';
import { db } from '../dbclient';
import { userProfile } from '../schema/profile';

const PROFILE_ID_PREFIX = 'prof_';

const makeProfileId = () => `${PROFILE_ID_PREFIX}${createId()}`;

export type UserProfileRecord = typeof userProfile.$inferSelect;
export type UserProfileInsert = typeof userProfile.$inferInsert;
export type UserProfileUpdate = Partial<
  Omit<UserProfileInsert, 'id' | 'userId' | 'memberSince' | 'createdAt'>
>;

const pruneUndefined = <T extends Record<string, unknown>>(payload: T) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  ) as Partial<T>;

export const getUserProfileById = async (
  id: string
): Promise<UserProfileRecord | null> => {
  const [result] = await db
    .select()
    .from(userProfile)
    .where(eq(userProfile.id, id))
    .limit(1);

  return result ?? null;
};

export const getUserProfileByUserId = async (
  userId: string
): Promise<UserProfileRecord | null> => {
  const [result] = await db
    .select()
    .from(userProfile)
    .where(eq(userProfile.userId, userId))
    .limit(1);

  return result ?? null;
};

export const createUserProfile = async (
  input: Omit<UserProfileInsert, 'id'> & { id?: string }
): Promise<UserProfileRecord> => {
  const [result] = await db
    .insert(userProfile)
    .values({
      ...input,
      id: input.id ?? makeProfileId(),
    })
    .returning();

  return result;
};

export const updateUserProfileByUserId = async (
  userId: string,
  changes: UserProfileUpdate
): Promise<UserProfileRecord | null> => {
  const updates = pruneUndefined({
    ...changes,
    updatedAt: new Date(),
  });

  if (Object.keys(updates).length === 0) {
    return getUserProfileByUserId(userId);
  }

  const [result] = await db
    .update(userProfile)
    .set(updates)
    .where(eq(userProfile.userId, userId))
    .returning();

  return result ?? null;
};

export const upsertUserProfileByUserId = async (
  userId: string,
  payload: UserProfileUpdate & { createDefaults?: UserProfileInsert }
): Promise<UserProfileRecord> => {
  const existing = await getUserProfileByUserId(userId);

  if (existing) {
    const { createDefaults, ...updates } = payload;
    const updated = await updateUserProfileByUserId(userId, updates);
    return updated ?? existing;
  }

  const { createDefaults, ...initial } = payload;
  const baseInsert: Omit<UserProfileInsert, 'id'> = {
    userId,
    ...(createDefaults ?? {}),
  };

  const mergedInsert = {
    ...baseInsert,
    ...pruneUndefined(initial),
  } satisfies Omit<UserProfileInsert, 'id'>;

  return createUserProfile(mergedInsert);
};

export const deleteUserProfileByUserId = async (userId: string): Promise<void> => {
  await db
    .delete(userProfile)
    .where(eq(userProfile.userId, userId));
};

export const ensureUserProfile = async (
  userId: string,
  defaults?: UserProfileInsert
): Promise<UserProfileRecord> => {
  const existing = await getUserProfileByUserId(userId);
  if (existing) {
    return existing;
  }

  const insertPayload: Omit<UserProfileInsert, 'id'> = {
    userId,
    ...(defaults ?? {}),
  };

  return createUserProfile(insertPayload);
};
