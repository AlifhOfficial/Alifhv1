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
import { getCurrentUserProfileByUserId, updateUserProfileByUserId } from "@alifh/database";
import { getSessionUser } from "@/lib/auth/session-context";
import { getCurrentUserProfileBundle } from "@/lib/current-user-profile";
import { deleteFile } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';


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

export async function GET(_req: NextRequest) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const responseData = await getCurrentUserProfileBundle(user);
    const response = NextResponse.json(responseData);
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
      return response;
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
      const currentProfile = await getCurrentUserProfileByUserId(user.id);
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
    return response;
  } catch (error) {
    console.error("[user-profile] PATCH failed", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
