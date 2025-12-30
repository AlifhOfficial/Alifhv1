/**
 * API: Delete Account Endpoint
 * POST /api/profile/user/delete-account
 * 
 * Purpose: Soft-delete user account (6-month retention per security policy)
 * Authentication: Required
 * Session Source: getSessionUser() from middleware cache
 * 
 * Flow:
 * 1. Marks profile status as 'pending_deletion'
 * 2. Calculates deletion date (6 months from now)
 * 3. Returns confirmation with deletion date
 * 
 * Standards:
 * - Returns 401 for unauthenticated requests
 * - Returns 500 for server errors
 * - Soft delete only (data retained 6 months)
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from '@/lib/auth/session-context';
import { updateUserProfileByUserId } from "@alifh/database";
import {
  createRateLimiter,
  getIdentifier,
  rateLimitResponse,
} from '@/lib/rate-limit';

// Very restrictive - 1 per day (prevent accidents/abuse)
const deleteAccountLimiter = createRateLimiter({
  windowSeconds: 24 * 60 * 60, // 1 day
  maxRequests: 1,
  keyPrefix: 'delete-account',
  description: 'Account deletion requests',
});

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit by user
    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await deleteAccountLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    const deletionDate = new Date();
    deletionDate.setMonth(deletionDate.getMonth() + 6);

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
    console.error("[delete-account] POST failed", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
