/**
 * API: Delete Account Endpoint
 * POST /api/profile/user/delete-account
 * 
 * Purpose: Full account deletion - removes all user data from platform
 * Authentication: Required
 * Session Source: getSessionUser() from middleware cache
 * 
 * Flow:
 * 1. Marks all user listings as 'deleted' 
 * 2. Removes user from all conversations (deletes conversation participants)
 * 3. Deletes all user messages
 * 4. Deletes all user bookings
 * 5. Deletes all user favorites and superlikes
 * 6. Deletes all user notifications and push tokens
 * 7. Deletes all user feedback
 * 8. Deletes all account credentials (email/password, OAuth)
 * 9. Deletes all sessions (force logout from all devices)
 * 10. Marks profile status as 'pending_deletion'
 * 11. Invalidates session cache
 * 
 * Data Retention:
 * - User record and profile kept for legal purposes (6 months)
 * - All visible user content is removed from platform immediately
 * - Other users cannot see deleted user's listings, messages, or data
 * 
 * Standards:
 * - Returns 401 for unauthenticated requests
 * - Returns 500 for server errors
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from '@/lib/auth/session-context';
import { 
  updateUserProfileByUserId, 
  db, 
  session, 
  account, 
  eq, 
  // Listings
  carListing,
  // Messaging
  conversationParticipant,
  message,
  // Bookings
  booking,
  // Favorites & Superlikes
  userFavorite,
  userSuperlike,
  userSuperlikeQuota,
  // Notifications
  notification,
  pushDeviceToken,
  pushNotificationPreferences,
  // Feedback
  feedback,
  // KYC
  kycRecord,
  // Auth
  passkey,
} from "@alifh/database";


export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    const deletionDate = new Date();
    deletionDate.setMonth(deletionDate.getMonth() + 6);

    const now = new Date();

    // =========================================================================
    // STEP 1: Mark all user listings as 'deleted' (removes from platform)
    // =========================================================================
    await db
      .update(carListing)
      .set({ 
        lifecycleStatus: 'deleted',
        deletedAt: now,
      })
      .where(eq(carListing.userId, user.id));

    // =========================================================================
    // STEP 2: Remove user from all conversations
    // Delete conversation participants (user leaves all conversations)
    // =========================================================================
    await db.delete(conversationParticipant).where(eq(conversationParticipant.userId, user.id));

    // =========================================================================
    // STEP 3: Delete all messages sent by user
    // =========================================================================
    await db.delete(message).where(eq(message.senderId, user.id));

    // =========================================================================
    // STEP 4: Delete all user bookings
    // =========================================================================
    await db.delete(booking).where(eq(booking.userId, user.id));

    // =========================================================================
    // STEP 5: Delete all user favorites and superlikes
    // =========================================================================
    await db.delete(userFavorite).where(eq(userFavorite.userId, user.id));
    await db.delete(userSuperlike).where(eq(userSuperlike.userId, user.id));
    await db.delete(userSuperlikeQuota).where(eq(userSuperlikeQuota.userId, user.id));

    // =========================================================================
    // STEP 6: Delete all user notifications and push tokens
    // =========================================================================
    await db.delete(notification).where(eq(notification.userId, user.id));
    await db.delete(pushDeviceToken).where(eq(pushDeviceToken.userId, user.id));
    await db.delete(pushNotificationPreferences).where(eq(pushNotificationPreferences.userId, user.id));

    // =========================================================================
    // STEP 7: Delete all user feedback
    // =========================================================================
    await db.delete(feedback).where(eq(feedback.userId, user.id));

    // =========================================================================
    // STEP 8: Delete KYC records
    // =========================================================================
    await db.delete(kycRecord).where(eq(kycRecord.userId, user.id));

    // =========================================================================
    // STEP 9: Delete all account credentials and passkeys
    // =========================================================================
    await db.delete(account).where(eq(account.userId, user.id));
    await db.delete(passkey).where(eq(passkey.userId, user.id));

    // =========================================================================
    // STEP 10: Delete all sessions (force logout from all devices)
    // =========================================================================
    await db.delete(session).where(eq(session.userId, user.id));

    // =========================================================================
    // STEP 11: Mark profile as pending_deletion
    // =========================================================================
    const updated = await updateUserProfileByUserId(user.id, {
      status: 'pending_deletion',
    });

    if (!updated) {
      return NextResponse.json({ error: "Failed to mark account for deletion" }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
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
