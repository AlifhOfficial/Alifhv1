/**
 * Delete Account API
 * Marks account for deletion (soft delete) - keeps data for 6 months per security policy
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateUserProfileByUserId } from "@alifh/database";

export const runtime = "nodejs";

async function requireSessionUser(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user ?? null;
}

/**
 * POST /api/profile/delete-account
 * Marks user account for deletion
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Calculate deletion date (6 months from now)
    const deletionDate = new Date();
    deletionDate.setMonth(deletionDate.getMonth() + 6);

    // Mark profile as pending deletion
    const updated = await updateUserProfileByUserId(user.id, {
      status: 'pending_deletion',
    });

    if (!updated) {
      return NextResponse.json({ error: "Failed to mark account for deletion" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Account marked for deletion",
      deletionDate: deletionDate.toISOString(),
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
