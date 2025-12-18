/**
 * User Profile API - Simplified
 * Only returns fields used in ProfileView component
 */

import { NextRequest, NextResponse } from "next/server";
import { getUserProfileByUserId, updateUserProfileByUserId, ensureUserProfile } from "@alifh/database";
import { getSignedUrl } from "@/lib/storage";
import { getSessionUser } from "@/lib/auth/session-context";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

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

/**
 * GET /api/profile/user-profile
 * Returns minimal profile with only UI-needed fields
 */
export async function GET(req: NextRequest) {
  const startTime = performance.now();
  try {
    const sessionStart = performance.now();
    const user = await getSessionUser();
    const sessionTime = performance.now() - sessionStart;
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profileStart = performance.now();
    let profile = await getUserProfileByUserId(user.id);
    
    if (!profile) {
      profile = await ensureUserProfile(user.id);
    }
    const profileTime = performance.now() - profileStart;

    const avatarStart = performance.now();
    const profileWithAvatar = await attachAvatarUrl(profile);
    const avatarTime = performance.now() - avatarStart;

    const totalTime = performance.now() - startTime;

    return NextResponse.json(
      { profile: profileWithAvatar },
      { 
        status: 200,
        headers: {
          // SECURITY: Prevent browser caching to avoid profile leaks between users
          // Use server-side caching (session cache) instead for performance
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error("[user-profile] GET failed", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

/**
 * PATCH /api/profile/user-profile
 * Updates profile fields
 */
export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();
    
    const updated = await updateUserProfileByUserId(user.id, payload);
    
    if (!updated) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    const profileWithUrl = await attachAvatarUrl(updated);

    return NextResponse.json({ profile: profileWithUrl });
  } catch (error) {
    console.error("[user-profile] PATCH failed", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
