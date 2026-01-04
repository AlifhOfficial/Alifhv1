/**
 * User Profile Queries - Production
 * 
 * User profile management with automatic name syncing and verification tracking.
 * Handles profile CRUD operations with denormalized user data.
 * 
 * Performance optimizations:
 * - Combined profile + verification into single JOIN query (was 2 queries)
 * - Memory cache with 2min TTL for read-heavy operations
 * 
 * @module queries/profile/user-profile-query
 */

import { createId } from '@paralleldrive/cuid2';
import { eq, getTableColumns } from 'drizzle-orm';
import { db } from '../../../dbclient';
import { memoryCache, CacheKeys, CacheTTL } from '../../../caches/memory-cache';
import { userProfile } from '../../../schema/profile';
import { user } from '../../../schema/auth';

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
  preferences: { theme?: string; language?: string; distanceUnit?: string; useGeneratedAvatar?: boolean };
  avatar: string | null;
  status: string;
}>;

/**
 * Extended user profile with user table fields
 * Combines profile data + verification + basic user info in single query
 */
export type ExtendedUserProfile = UserProfileRecord & {
  emailVerified: boolean;
  phoneVerified: boolean;
  // User table fields (for fallback in UI)
  userName: string | null;
  userImage: string | null;
  userCreatedAt: Date;
};

/**
 * Get profile by user ID with email verification status and basic user info
 * Uses single JOIN query + memory cache (2min TTL)
 * Includes user.name, user.image, user.createdAt for UI fallbacks
 */
export const getUserProfileByUserId = async (userId: string): Promise<ExtendedUserProfile | null> => {
  const cacheKey = CacheKeys.userProfile(userId);
  
  // Check cache first
  const cached = memoryCache.get<ExtendedUserProfile>(cacheKey);
  if (cached) {
    console.log(`[getUserProfileByUserId] Cache HIT for ${userId.slice(0, 8)}...`);
    return cached;
  }

  const queryStart = performance.now();
  
  // Single JOIN query - includes all needed user table fields
  const [result] = await db
    .select({
      // All profile fields
      ...getTableColumns(userProfile),
      // Verification fields from user table
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      // Basic user info (for UI fallbacks - eliminates separate query)
      userName: user.name,
      userImage: user.image,
      userCreatedAt: user.createdAt,
    })
    .from(userProfile)
    .innerJoin(user, eq(user.id, userProfile.userId))
    .where(eq(userProfile.userId, userId))
    .limit(1);

  const queryTime = performance.now() - queryStart;

  if (!result) {
    console.log(`[getUserProfileByUserId] Cache MISS for ${userId.slice(0, 8)}... - not found`);
    return null;
  }

  const profile: ExtendedUserProfile = {
    ...result,
    emailVerified: result.emailVerified ?? false,
    phoneVerified: result.phoneVerified ?? false,
    userName: result.userName,
    userImage: result.userImage,
    userCreatedAt: result.userCreatedAt,
  };

  console.log(`[getUserProfileByUserId] Cache MISS for ${userId.slice(0, 8)}... - DB query: ${queryTime.toFixed(2)}ms`);

  // Cache the result
  memoryCache.set(cacheKey, profile, CacheTTL.userProfile);

  return profile;
};

/**
 * Update profile by user ID
 * Auto-syncs firstName/lastName to user.name
 * Invalidates cache after update
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

  // Invalidate cache before making changes
  memoryCache.delete(CacheKeys.userProfile(userId));

  // If phone number is being updated, check if it changed and clear verification
  if (cleanUpdates.phone !== undefined) {
    const currentProfile = await getUserProfileByUserId(userId);
    if (currentProfile && currentProfile.phone !== cleanUpdates.phone) {
      // Phone number changed - clear verification in user table
      await db
        .update(user)
        .set({ phoneVerified: false })
        .where(eq(user.id, userId));
      // Invalidate again after verification change
      memoryCache.delete(CacheKeys.userProfile(userId));
    }
  }

  // Auto-sync: If firstName or lastName are being updated, sync to user.name
  if ('firstName' in cleanUpdates || 'lastName' in cleanUpdates) {
    const currentProfile = await getUserProfileByUserId(userId);
    const newFirstName = 'firstName' in cleanUpdates ? cleanUpdates.firstName : currentProfile?.firstName;
    const newLastName = 'lastName' in cleanUpdates ? cleanUpdates.lastName : currentProfile?.lastName;
    
    // Compute the new name from firstName + lastName
    const computedName = [newFirstName, newLastName].filter(Boolean).join(' ').trim();
    
    if (computedName) {
      // Update user.name to match firstName + lastName
      await db
        .update(user)
        .set({ name: computedName, updatedAt: new Date() })
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

  // Invalidate cache after update
  memoryCache.delete(CacheKeys.userProfile(userId));

  // Fetch complete profile with verification status (will cache fresh data)
  return getUserProfileByUserId(userId);
};

/**
 * Ensure profile exists (create if doesn't exist)
 * Uses single JOIN query for new profiles
 */
export const ensureUserProfile = async (userId: string): Promise<ExtendedUserProfile> => {
  const existing = await getUserProfileByUserId(userId);
  if (existing) return existing;

  // Check if user exists before creating profile
  const userExists = await db.query.user.findFirst({
    where: eq(user.id, userId),
    columns: { id: true },
  });

  if (!userExists) {
    throw new Error(`Cannot create profile: user ${userId} does not exist in user table`);
  }

  // Create new profile
  await db
    .insert(userProfile)
    .values({
      id: makeProfileId(),
      userId,
    });

  // Fetch the complete profile with verification status using single query
  // This will also cache the result
  const profile = await getUserProfileByUserId(userId);
  
  if (!profile) {
    throw new Error(`Failed to create profile for user ${userId}`);
  }
  
  return profile;
};
