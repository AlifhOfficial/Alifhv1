/**
 * API: User Profile Endpoint
 * GET /api/profile/user/user-profile - Fetch user profile
 * PATCH /api/profile/user/user-profile - Update user profile
 * 
 * Purpose: Manage user profile data for ProfileView component
 * Authentication: Required
 * Session Source: getSessionUser() from middleware cache
 * 
 * Features:
 * - Public avatar URLs (no signing needed for public bucket)
 * - Auto-creates profile if missing
 * - Only returns UI-needed fields
 * 
 * Cache Strategy:
 * - No browser caching (user-specific data)
 * - Server-side session cache used instead
 * 
 * Standards:
 * - Returns 401 for unauthenticated requests
 * - Returns 500 for server errors
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod';
import { getUserProfileByUserId, updateUserProfileByUserId, ensureUserProfile, invalidateUserSession, memoryCache, invalidateUserProfile, invalidateUserListingsInSearch, calculateUserStats, db, passkey, eq } from "@alifh/database";
import { getSessionUser } from "@/lib/auth/session-context";
import { deleteFile } from "@/lib/storage";
import { createRateLimiter, getIdentifier, rateLimitResponse, RATE_LIMITS_GENERAL } from '@/lib/rate-limit';

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

const profileUpdateLimiter = createRateLimiter(RATE_LIMITS_GENERAL.READ_AUTH);

// Server-side cache TTL: 5 minutes
const USER_PROFILE_CACHE_TTL = 300;

// No browser caching - server handles caching
const CACHE_HEADERS_PRIVATE = {
  'Cache-Control': 'private, no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
  'Vary': 'Cookie, Authorization',
} as const;

const CACHE_HEADERS_FRESH = {
  'Cache-Control': 'private, no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
  'Vary': 'Cookie, Authorization',
} as const;

const UpdateProfileSchema = z.object({
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  consignmentMode: z.boolean().optional(),
  privacySettings: z.object({ showPhone: z.boolean().optional() }).optional(),
  preferences: z.object({ 
    theme: z.string().optional(),
    language: z.string().optional(),
    distanceUnit: z.string().optional(),
    useGeneratedAvatar: z.boolean().optional(),
  }).optional(),
  avatar: z.string().nullable().optional(),
});

async function attachAvatarUrl(profile: any) {
  if (!profile.avatar) {
    return { ...profile, avatarUrl: null };
  }
  
  // Already a full URL - return as-is
  if (profile.avatar.startsWith('http')) {
    return { ...profile, avatarUrl: profile.avatar };
  }

  // Build public URL for avatar (avatars are public, no signing needed)
  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!publicUrl) {
    console.warn("NEXT_PUBLIC_R2_PUBLIC_URL not configured");
    return { ...profile, avatarUrl: null };
  }
  
  // Add cache-busting param based on updatedAt to ensure fresh image after upload
  const cacheBuster = profile.updatedAt ? new Date(profile.updatedAt).getTime() : Date.now();
  const avatarUrl = `${publicUrl.replace(/\/$/, '')}/${profile.avatar}?v=${cacheBuster}`;
  return { ...profile, avatarUrl };
}

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      Object.entries(CACHE_HEADERS_PRIVATE).forEach(([key, value]) => 
        response.headers.set(key, value)
      );
      return response;
    }

    // Check server-side cache
    const cacheKey = `user:profile:${user.id}`;
    const cached = memoryCache.get(cacheKey);
    if (cached) {
      const response = NextResponse.json(cached);
      Object.entries(CACHE_HEADERS_PRIVATE).forEach(([key, value]) => 
        response.headers.set(key, value)
      );
      return response;
    }

    let profile = await getUserProfileByUserId(user.id);
    
    if (!profile) {
      profile = await ensureUserProfile(user.id);
    }

    const profileWithAvatar = await attachAvatarUrl(profile);

    // Fetch stats and passkeys in parallel
    const [stats, passkeys] = await Promise.all([
      calculateUserStats(user.id),
      db.select({
        id: passkey.id,
        name: passkey.name,
        createdAt: passkey.createdAt,
      })
      .from(passkey)
      .where(eq(passkey.userId, user.id))
      .orderBy(passkey.createdAt),
    ]);

    const responseData = {
      profile: profileWithAvatar,
      stats,
      passkeys,
    };

    // Cache the result
    memoryCache.set(cacheKey, responseData, USER_PROFILE_CACHE_TTL);

    const response = NextResponse.json(responseData);
    Object.entries(CACHE_HEADERS_PRIVATE).forEach(([key, value]) => 
      response.headers.set(key, value)
    );
    return response;
  } catch (error) {
    console.error("[user-profile] GET failed", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      Object.entries(CACHE_HEADERS_PRIVATE).forEach(([key, value]) => 
        response.headers.set(key, value)
      );
      return response;
    }

    // Rate limiting: 60 profile operations per minute
    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await profileUpdateLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    const payload = await req.json().catch(() => null);
    const result = UpdateProfileSchema.safeParse(payload);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          details: result.error.format()
        },
        { status: 400 }
      );
    }
    
    // Get current profile to check for old avatar to delete (only needed when removing)
    let oldAvatarKey: string | null = null;
    if ('avatar' in result.data && result.data.avatar === null) {
      const currentProfile = await getUserProfileByUserId(user.id);
      oldAvatarKey = currentProfile?.avatar ?? null;
    }
    
    const updated = await updateUserProfileByUserId(user.id, result.data);
    
    if (!updated) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    // Clean up old avatar from R2 when user removes their avatar
    // Fire-and-forget: don't block response for cleanup
    // Note: When replacing, the new upload uses same key (avatars/{userId}.webp) so it overwrites
    if (oldAvatarKey && !oldAvatarKey.startsWith('http')) {
      deleteFile(oldAvatarKey).catch(e => {
        console.warn('[user-profile] Failed to delete old avatar:', oldAvatarKey, e);
      });
    }

    // Invalidate server-side profile cache
    invalidateUserProfile(user.id);
    
    // Invalidate session cache so sidebar/navbar get fresh data
    if ('avatar' in result.data || 'firstName' in result.data || 'lastName' in result.data || 'preferences' in result.data) {
      invalidateUserSession(user.id);
    }
    
    // Invalidate search caches when seller-visible fields change
    // This ensures car cards show updated seller avatar/name
    if ('avatar' in result.data || 'firstName' in result.data || 'lastName' in result.data) {
      invalidateUserListingsInSearch(user.id);
    }

    const profileWithUrl = await attachAvatarUrl(updated);

    const response = NextResponse.json({ profile: profileWithUrl });
    // Use shorter cache time after updates to ensure fresh data
    Object.entries(CACHE_HEADERS_FRESH).forEach(([key, value]) => 
      response.headers.set(key, value)
    );
    return response;
  } catch (error) {
    console.error("[user-profile] PATCH failed", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
