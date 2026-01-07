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
import { eq } from 'drizzle-orm';
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
  tags: string[];
  consignmentMode: boolean;
  privacySettings: { showPhone?: boolean };
  preferences: { theme?: string; language?: string; distanceUnit?: string; useGeneratedAvatar?: boolean };
  avatar: string | null;
  status: string; // 'active' | 'pending_deletion' | 'suspended'
}>;

/**
 * Extended user profile with user table fields
 * Combines profile data + verification + basic user info in single query
 * Only includes fields used in UI for optimal performance
 */
export type ExtendedUserProfile = {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  description: string | null;
  tags: string[];
  consignmentMode: boolean;
  privacySettings: { showPhone?: boolean } | null;
  preferences: { theme?: string; language?: string; distanceUnit?: string; useGeneratedAvatar?: boolean } | null;
  avatar: string | null;
  kycVerified: boolean;
  badges: string[];
  platformRating: number | null;
  memberSince: Date | null;
  updatedAt: Date;
  emailVerified: boolean;
  phoneVerified: boolean;
  // User table fields (for fallback in UI)
  userName: string | null;
  userImage: string | null;
};

/**
 * Get profile by user ID with email verification status and basic user info
 * Uses single JOIN query with minimal field selection for optimal performance
 * Only fetches fields used in ProfileView UI
 */
export const getUserProfileByUserId = async (userId: string): Promise<ExtendedUserProfile | null> => {
  const cacheKey = CacheKeys.userProfile(userId);
  
  // Check cache first (disabled - no-op)
  const cached = memoryCache.get<ExtendedUserProfile>(cacheKey);
  if (cached) {
    return cached;
  }

  // Single JOIN query - only select fields used in UI
  const [result] = await db
    .select({
      // Profile fields - only what's displayed/edited in UI
      id: userProfile.id,
      userId: userProfile.userId,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      phone: userProfile.phone,
      description: userProfile.description,
      tags: userProfile.tags,
      consignmentMode: userProfile.consignmentMode,
      privacySettings: userProfile.privacySettings,
      preferences: userProfile.preferences,
      avatar: userProfile.avatar,
      kycVerified: userProfile.kycVerified,
      badges: userProfile.badges,
      platformRating: userProfile.platformRating,
      memberSince: userProfile.memberSince,
      updatedAt: userProfile.updatedAt, // For cache busting on avatar URLs
      // Verification fields from user table
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      // Basic user info (for UI fallbacks - eliminates separate query)
      userName: user.name,
      userImage: user.image,
    })
    .from(userProfile)
    .innerJoin(user, eq(user.id, userProfile.userId))
    .where(eq(userProfile.userId, userId))
    .limit(1);

  if (!result) {
    return null;
  }

  const profile: ExtendedUserProfile = {
    ...result,
    emailVerified: result.emailVerified ?? false,
    phoneVerified: result.phoneVerified ?? false,
  };

  // Cache the result (disabled - no-op)
  memoryCache.set(cacheKey, profile, CacheTTL.userProfile);

  return profile;
};

/**
 * Update profile by user ID
 * Auto-syncs firstName/lastName to user.name
 * Clears phone verification if phone number changes
 */
export const updateUserProfileByUserId = async (
  userId: string,
  updates: UserProfileUpdate
): Promise<ExtendedUserProfile | null> => {
  // Remove undefined values
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined)
  );

  if (Object.keys(cleanUpdates).length === 0) {
    return getUserProfileByUserId(userId);
  }

  // Fetch current profile once if needed for phone check or name sync
  const needsCurrentProfile = 'phone' in cleanUpdates || 'firstName' in cleanUpdates || 'lastName' in cleanUpdates;
  const currentProfile = needsCurrentProfile ? await getUserProfileByUserId(userId) : null;

  // Check if phone changed - clear verification if so
  if ('phone' in cleanUpdates && currentProfile && currentProfile.phone !== cleanUpdates.phone) {
    await db.update(user).set({ phoneVerified: false }).where(eq(user.id, userId));
  }

  // Auto-sync firstName/lastName to user.name
  if ('firstName' in cleanUpdates || 'lastName' in cleanUpdates) {
    const newFirstName = 'firstName' in cleanUpdates ? cleanUpdates.firstName : currentProfile?.firstName;
    const newLastName = 'lastName' in cleanUpdates ? cleanUpdates.lastName : currentProfile?.lastName;
    const computedName = [newFirstName, newLastName].filter(Boolean).join(' ').trim();
    
    if (computedName) {
      await db.update(user).set({ name: computedName, updatedAt: new Date() }).where(eq(user.id, userId));
    }
  }

  // Update profile
  await db
    .update(userProfile)
    .set({ ...cleanUpdates, updatedAt: new Date() })
    .where(eq(userProfile.userId, userId));

  // Invalidate cache once after all updates complete
  memoryCache.delete(CacheKeys.userProfile(userId));

  // Return fresh profile
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
