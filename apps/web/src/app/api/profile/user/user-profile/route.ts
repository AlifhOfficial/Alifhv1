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
import { getUserProfileByUserId, updateUserProfileByUserId, ensureUserProfile, calculateUserStats, db, passkey, eq } from "@alifh/database";
import { getSessionUser } from "@/lib/auth/session-context";
import { deleteFile } from "@/lib/storage";
import { NO_CACHE_HEADERS } from '@/lib/cdn-cache';
import { createRateLimiter, getIdentifier, rateLimitResponse, RATE_LIMITS_GENERAL } from '@/lib/rate-limit';

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

const profileUpdateLimiter = createRateLimiter(RATE_LIMITS_GENERAL.READ_AUTH);



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
      Object.entries(NO_CACHE_HEADERS).forEach(([key, value]) => 
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

    const response = NextResponse.json(responseData);
    Object.entries(NO_CACHE_HEADERS).forEach(([k, v]) => response.headers.set(k, v));
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
      Object.entries(NO_CACHE_HEADERS).forEach(([k, v]) => response.headers.set(k, v));
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

    const profileWithUrl = await attachAvatarUrl(updated);

    const response = NextResponse.json({ profile: profileWithUrl });
    Object.entries(NO_CACHE_HEADERS).forEach(([k, v]) => response.headers.set(k, v));
    return response;
  } catch (error) {
    console.error("[user-profile] PATCH failed", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
