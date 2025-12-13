/**
 * Create Test Users with Roles
 * Uses Better Auth API to create users with proper password hashing
 */

import { auth } from "../apps/web/src/lib/auth/index";
import { db } from "../packages/database/src/dbclient";
import { user } from "../packages/database/src/schema/auth";
import { eq } from "drizzle-orm";

async function seedUsers() {
  console.log("🌱 Creating test users with roles...\n");

  const testUsers = [
    // Platform Owner (You - Super Admin)
    {
      email: "alifh.owner@alifh.ae",
      password: "password123",
      name: "Alifh Platform Owner",
      role: "super_admin",
      description: "Platform Owner - Manages everything, approves all dealers",
    },
    
    // Dealer Owners (Company Owners who run dealerships)
    {
      email: "mohammed.dealer@alifh.ae",
      password: "password123",
      name: "Mohammed Al-Hassan",
      role: "user",
      description: "Dealer Owner - Luxury Motors Dubai",
    },
    {
      email: "sarah.dealer@alifh.ae",
      password: "password123",
      name: "Sarah Al-Mansouri",
      role: "user",
      description: "Dealer Owner - Premium Auto Trading",
    },
    
    // Dealer Staff (Employees working under dealer owners)
    {
      email: "fatima.staff@alifh.ae",
      password: "password123",
      name: "Fatima Al-Zahra",
      role: "user",
      description: "Sales Manager at Luxury Motors",
    },
    {
      email: "ahmed.staff@alifh.ae",
      password: "password123",
      name: "Ahmed Al-Maktoum",
      role: "user",
      description: "Sales Executive at Premium Auto",
    },
    {
      email: "omar.staff@alifh.ae",
      password: "password123",
      name: "Omar Khalid",
      role: "user",
      description: "Inventory Manager at Luxury Motors",
    },
    
    // Regular Customers (Anyone using the platform)
    {
      email: "layla.customer@alifh.ae",
      password: "password123",
      name: "Layla Abdullah",
      role: "user",
      description: "Customer - Looking to buy a vehicle",
    },
    {
      email: "aisha.customer@alifh.ae",
      password: "password123",
      name: "Aisha Rahman",
      role: "user",
      description: "Customer - Vehicle valuation",
    },
  ];

  for (const userData of testUsers) {
    try {
      console.log(`\n📝 Creating ${userData.role}: ${userData.name}`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Role: ${userData.description}`);
      
      // Create user via Better Auth API (handles password hashing correctly)
      const result = await auth.api.signUpEmail({
        body: {
          email: userData.email,
          password: userData.password,
          name: userData.name,
        },
      });

      if (result?.user) {
        console.log(`   ✅ User created`);
        
        // Manually verify the email in database
        await db
          .update(user)
          .set({ 
            emailVerified: true,
            role: userData.role,
          })
          .where(eq(user.email, userData.email));
        
        console.log(`   ✅ Email verified and role set to: ${userData.role}`);
      }
    } catch (error: any) {
      console.error(`   ❌ Error creating ${userData.email}:`, error.message);
    }
  }

  console.log("\n\n🎉 Seeding complete!\n");
  console.log("═══════════════════════════════════════════════════════════════════════");
  console.log("              ALIFH PLATFORM - TEST USERS (Password: password123)");
  console.log("═══════════════════════════════════════════════════════════════════════\n");
  
  console.log("� PLATFORM OWNER (Super Admin - YOU)");
  console.log("   Alifh Platform Owner      alifh.owner@alifh.ae");
  console.log("   • Manages entire platform, approves dealers, sees everything\n");
  
  console.log("🏢 DEALER OWNERS (Admin Role - Company Owners)");
  console.log("   Mohammed Al-Hassan        mohammed.dealer@alifh.ae");
  console.log("   • Owns: Luxury Motors Dubai");
  console.log("   • Can manage their dealership & staff\n");
  
  console.log("   Sarah Al-Mansouri         sarah.dealer@alifh.ae");
  console.log("   • Owns: Premium Auto Trading");
  console.log("   • Can manage their dealership & staff\n");
  
  console.log("� DEALER STAFF (Need to be added to PartnerStaff table)");
  console.log("   Fatima Al-Zahra           fatima.staff@alifh.ae");
  console.log("   • Sales Manager at Luxury Motors\n");
  
  console.log("   Ahmed Al-Maktoum          ahmed.staff@alifh.ae");
  console.log("   • Sales Executive at Premium Auto\n");
  
  console.log("   Omar Khalid               omar.staff@alifh.ae");
  console.log("   • Inventory Manager at Luxury Motors\n");
  
  console.log("� CUSTOMERS (Regular Users - Anyone on platform)");
  console.log("   Layla Abdullah            layla.customer@alifh.ae");
  console.log("   Aisha Rahman              aisha.customer@alifh.ae");
  console.log("   • Browse vehicles, get valuations, make purchases\n");
  
  console.log("═══════════════════════════════════════════════════════════════════════");
  console.log("\n📝 Next Steps:");
  console.log("   1. Dealer Owners (admin role) can access /admin-dashboard & /partner-dashboard");
  console.log("   2. Add dealer staff to PartnerStaff table to give them /partner-dashboard access");
  console.log("   3. Customers can access /user-dashboard only\n");
  console.log("═══════════════════════════════════════════════════════════════════════\n");
}

seedUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });