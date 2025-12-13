/**
 * Clear all sessions to force users to re-login
 * This will trigger the new fetchUser() logic with extended partner data
 */

import { db } from "../packages/database/src/dbclient";
import { session } from "../packages/database/src/schema";

async function clearSessions() {
  console.log("🔄 Clearing all sessions to force re-login...\n");

  try {
    await db.delete(session).execute();
    console.log("✅ All sessions cleared successfully!\n");
    console.log("═══════════════════════════════════════════════════════════════════════");
    console.log("                      SESSIONS CLEARED");
    console.log("═══════════════════════════════════════════════════════════════════════\n");
    console.log("📝 All users must sign in again to get extended session data");
    console.log("📝 New sessions will include:");
    console.log("   • hasPartnerAccess");
    console.log("   • isAlifhAdmin");
    console.log("   • partnerMemberships array with full context");
    console.log("   • staffRole for each partnership\n");
    console.log("═══════════════════════════════════════════════════════════════════════\n");
  } catch (error) {
    console.error("❌ Error clearing sessions:", error);
    throw error;
  }
}

clearSessions()
  .then(() => {
    console.log("✅ Session cleanup completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Session cleanup failed:", error);
    process.exit(1);
  });
