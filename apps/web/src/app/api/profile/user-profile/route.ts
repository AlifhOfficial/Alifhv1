/**
 * User Profile API - Simplified
 * Only returns fields used in ProfileView component
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserProfileByUserId, updateUserProfileByUserId, ensureUserProfile } from "@alifh/database";
import { getSignedUrl } from "@/lib/storage";

export const runtime = "nodejs";
// Allow Next.js to cache this for 30s, revalidate in background
export const revalidate = 30;

async function requireSessionUser(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user ?? null;
}

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
  try {
    const user = await requireSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let profile = await getUserProfileByUserId(user.id);
    
    if (!profile) {
      profile = await ensureUserProfile(user.id);
    }

    const profileWithAvatar = await attachAvatarUrl(profile);

    return NextResponse.json(
      { profile: profileWithAvatar },
      { 
        status: 200,
        headers: {
          // Allow browser to cache for 30s, revalidate after
          'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
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
    const user = await requireSessionUser(req);
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
