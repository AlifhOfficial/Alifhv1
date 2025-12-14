import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  ensureProfileForUser,
  getProfileForUserId,
  updateProfileForUser,
  type ProfileUpdateInput,
} from "@/lib/profile";

export const runtime = "nodejs";

async function requireSessionUser(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user ?? null;
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getProfileForUserId(user.id);

    if (profile) {
      return NextResponse.json({ profile });
    }

    const ensured = await ensureProfileForUser(user.id);
    return NextResponse.json({ profile: ensured });
  } catch (error) {
    console.error("[profile] GET failed", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload: ProfileUpdateInput;
    try {
      payload = (await req.json()) as ProfileUpdateInput;
    } catch (error) {
      console.error("[profile] Invalid JSON payload", error);
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const updated = await updateProfileForUser(user.id, payload);

    if (updated) {
      return NextResponse.json({ profile: updated });
    }

    const ensured = await ensureProfileForUser(user.id);
    return NextResponse.json({ profile: ensured });
  } catch (error) {
    console.error("[profile] PATCH failed", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
