/**
 * API: User Profile Endpoint
 * GET /api/profile/user-profile - Fetch user profile
 * PATCH /api/profile/user-profile - Update user profile
 * 
 * Purpose: Manage user profile data for ProfileView component
 * Authentication: Required
 * Session Source: getSessionUser() from middleware cache
 * 
 * Features:
 * - Signed avatar URLs (10min expiry)
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
import { getUserProfileByUserId, updateUserProfileByUserId, ensureUserProfile } from "@alifh/database";
import { getSignedUrl } from "@/lib/storage";
import { getSessionUser } from "@/lib/auth/session-context";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

const CACHE_HEADERS_PRIVATE = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
} as const;

async function attachAvatarUrl(profile: any) {
  if (!profile.avatar || profile.avatar.startsWith('http')) {
    return { ...profile, avatarUrl: profile.avatar };
  }

  try {
    const signedUrl = await getSignedUrl(profile.avatar, { expiresIn: 600 });
    return { ...profile, avatarUrl: signedUrl };
  } catch (error) {
    console.warn("Failed to generate signed avatar URL", error);
    return { ...profile, avatarUrl: null };
  }
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

    let profile = await getUserProfileByUserId(user.id);
    
    if (!profile) {
      profile = await ensureUserProfile(user.id);
    }

    const profileWithAvatar = await attachAvatarUrl(profile);

    const response = NextResponse.json({ profile: profileWithAvatar });
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

    const payload = await req.json();
    
    const updated = await updateUserProfileByUserId(user.id, payload);
    
    if (!updated) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    const profileWithUrl = await attachAvatarUrl(updated);

    const response = NextResponse.json({ profile: profileWithUrl });
    Object.entries(CACHE_HEADERS_PRIVATE).forEach(([key, value]) => 
      response.headers.set(key, value)
    );
    return response;
  } catch (error) {
    console.error("[user-profile] PATCH failed", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
