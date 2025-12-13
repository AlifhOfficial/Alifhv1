/**
 * Create Test Users with Roles
 * Uses Better Auth API to create users with proper password hashing
 */

import { auth } from "@/lib/auth";
import { db, users } from "@alifh/database";
import { eq } from "drizzle-orm";

async function seedUsers() {
  console.log("🌱 Creating test users with roles...\n");

  const testUsers = [
    {
      email: "admin@alifh.ae",
      password: "password123",
      name: "Admin User",
      role: "admin",
    },
    {
      email: "partner@alifh.ae",
      password: "password123",
      name: "Partner User",
      role: "partner",
    },
    {
      email: "staff@alifh.ae",
      password: "password123",
      name: "Staff User",
      role: "staff",
    },
    {
      email: "user@alifh.ae",
      password: "password123",
      name: "Regular User",
      role: "user",
    },
  ];

  for (const userData of testUsers) {
    try {
      console.log(`Creating ${userData.role}: ${userData.email}...`);
      
      // Create user via Better Auth API (handles password hashing correctly)
      const result = await auth.api.signUpEmail({
        body: {
          email: userData.email,
          password: userData.password,
          name: userData.name,
        },
      });

      if (result?.user) {
        console.log(`✅ User created: ${userData.email}`);
        
        // Manually verify the email in database
        await db
          .update(users)
          .set({ 
            emailVerified: true,
            role: userData.role,
          })
          .where(eq(users.email, userData.email));
        
        console.log(`✅ Email verified and role set to: ${userData.role}\n`);
      }
    } catch (error: any) {
      console.error(`❌ Error creating ${userData.email}:`, error.message);
    }
  }

  console.log("\n🎉 Seeding complete!\n");
  console.log("Test Users (Ready to sign in):");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Admin:   admin@alifh.ae   / password123");
  console.log("Partner: partner@alifh.ae / password123");
  console.log("Staff:   staff@alifh.ae   / password123");
  console.log("User:    user@alifh.ae    / password123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

seedUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });