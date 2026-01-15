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
 * 2. Deletes all account credentials (email/password, OAuth) - prevents future sign-in
 * 3. Deletes all sessions (force logout from all devices)
 * 4. Invalidates session cache
 * 5. Returns confirmation with deletion date
 * 
 * Data Retention:
 * - User record is kept for legal purposes (6 months)
 * - User cannot sign in (no credentials) but data is preserved
 * - No "banned" messaging - appears as normal auth failure
 * 
 * Standards:
 * - Returns 401 for unauthenticated requests
 * - Returns 500 for server errors
 * - Soft delete only (data retained 6 months)
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from '@/lib/auth/session-context';
import { updateUserProfileByUserId, db, session, account, eq, invalidateUserSessions } from "@alifh/database";
import {
  createRateLimiter,
  getIdentifier,
  rateLimitResponse,
} from '@/lib/rate-limit';

// Very restrictive - 3 per day in dev, 1 in prod (prevent accidents/abuse)
const deleteAccountLimiter = createRateLimiter({
  windowSeconds: 24 * 60 * 60, // 1 day
  maxRequests: process.env.NODE_ENV === 'development' ? 3 : 1,
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

    // Delete all account credentials (email/password, OAuth) - prevents future sign-in
    // User record is kept for legal/data retention, but can't authenticate
    await db.delete(account).where(eq(account.userId, user.id));

    // Delete all sessions from database (force logout from all devices)
    await db.delete(session).where(eq(session.userId, user.id));
    
    // Invalidate session cache
    invalidateUserSessions(user.id);

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
