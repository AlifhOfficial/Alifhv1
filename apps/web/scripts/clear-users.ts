/**
 * Clear All Users
 * Deletes all users from the database
 */

import { db } from "@alifh/database";
import { users, session, account, verification } from "@alifh/database";

async function clearUsers() {
  console.log("🗑️  Clearing all users from database...\n");

  try {
    // Delete in order due to foreign key constraints
    console.log("Deleting sessions...");
    await db.delete(session);
    
    console.log("Deleting accounts...");
    await db.delete(account);
    
    console.log("Deleting verification records...");
    await db.delete(verification);
    
    console.log("Deleting users...");
    await db.delete(users);

    console.log("\n✅ All users deleted successfully!\n");
  } catch (error: any) {
    console.error("❌ Error clearing users:", error.message);
    process.exit(1);
  }
}

clearUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
