/**
 * Server-side session context
 * Provides request-scoped session and profile caching
 */

import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import type { ExtendedUser } from "@/lib/auth/types";
import { getUserProfileByUserId } from "@alifh/database";
import { getSignedUrl } from "@/lib/storage";

const SESSION_HEADER_KEY = "x-auth-user";
const PROFILE_HEADER_KEY = "x-user-profile";

/**
 * Get session from middleware cache or fetch
 * Uses React cache() to deduplicate within a single request
 */
export const getSessionUser = cache(async (): Promise<ExtendedUser | null> => {
  try {
    const headersList = await headers();
    
    // Check middleware cache first
    const cachedUser = headersList.get(SESSION_HEADER_KEY);
    if (cachedUser) {
      try {
        return JSON.parse(cachedUser) as ExtendedUser;
      } catch {
        // Fall through to fetch
      }
    }
    
    // Fallback: fetch from Better Auth
    const session = await auth.api.getSession({
      headers: headersList,
    });

    return (session?.user as ExtendedUser) ?? null;
  } catch (error) {
    console.error('[getSessionUser] Error:', error);
    return null;
  }
});

/**
 * Get user profile with caching
 * Uses React cache() to deduplicate within a single request
 */
export const getUserProfile = cache(async () => {
  try {
    const headersList = await headers();
    
    // Check if profile was cached by an earlier call
    const cachedProfile = headersList.get(PROFILE_HEADER_KEY);
    if (cachedProfile) {
      try {
        return JSON.parse(cachedProfile);
      } catch {
        // Fall through to fetch
      }
    }
    
    const user = await getSessionUser();
    if (!user?.id) return null;

    const profile = await getUserProfileByUserId(user.id);
    if (!profile) return null;

    // Attach signed avatar URL if needed
    if (profile.avatar && !profile.avatar.startsWith('http')) {
      try {
        const signedUrl = await getSignedUrl(profile.avatar, { expiresIn: 600 });
        return { ...profile, avatarUrl: signedUrl };
      } catch {
        return { ...profile, avatarUrl: null };
      }
    }

    return { ...profile, avatarUrl: profile.avatar };
  } catch (error) {
    console.error('[getUserProfile] Error:', error);
    return null;
  }
});
