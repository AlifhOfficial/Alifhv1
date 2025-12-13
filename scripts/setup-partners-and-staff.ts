/**
 * Setup Partners and Staff
 * Creates partner companies and assigns staff members with correct roles
 */

import { db } from "../packages/database/src/dbclient";
import { partner, partnerStaff, user } from "../packages/database/src/schema";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

async function setupPartnersAndStaff() {
  console.log("🏢 Setting up partner companies and staff...\n");

  try {
    // Get all users by email
    const mohammed = await db.query.user.findFirst({
      where: eq(user.email, "mohammed.dealer@alifh.ae"),
    });

    const sarah = await db.query.user.findFirst({
      where: eq(user.email, "sarah.dealer@alifh.ae"),
    });

    const fatima = await db.query.user.findFirst({
      where: eq(user.email, "fatima.staff@alifh.ae"),
    });

    const ahmed = await db.query.user.findFirst({
      where: eq(user.email, "ahmed.staff@alifh.ae"),
    });

    const omar = await db.query.user.findFirst({
      where: eq(user.email, "omar.staff@alifh.ae"),
    });

    if (!mohammed || !sarah || !fatima || !ahmed || !omar) {
      console.error("❌ Could not find all required users");
      return;
    }

    // Create Partner 1: Luxury Motors Dubai (owned by Mohammed)
    const partnerId1 = createId();
    console.log("📝 Creating Partner: Luxury Motors Dubai");
    
    await db.insert(partner).values({
      id: partnerId1,
      companyNameLegal: "Luxury Motors LLC",
      brandName: "Luxury Motors Dubai",
      tradeLicense: "TL-" + createId().slice(0, 10),
      email: "info@luxurymotorsdubai.ae",
      phone: "+971-4-123-4567",
      status: "active",
      tier: "platinum",
      emirate: "Dubai",
      address: "Sheikh Zayed Road, Dubai",
      description: "Premium luxury vehicle dealership in Dubai",
      specialties: ["luxury", "sports", "supercars"],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("   ✅ Partner created");

    // Add Mohammed as owner
    await db.insert(partnerStaff).values({
      id: createId(),
      partnerId: partnerId1,
      userId: mohammed.id,
      role: "owner",
      title: "CEO & Founder",
      department: "Management",
      isPrimaryContact: true,
      status: "active",
      permissions: {
        manageListings: true,
        manageTeam: true,
        viewAnalytics: true,
        manageBookings: true,
        respondToLeads: true,
        manageFinancials: true,
        manageSettings: true,
        exportData: true,
      },
      joinedAt: new Date(),
      acceptedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("   ✅ Mohammed added as Owner");

    // Add Fatima as admin (Sales Manager)
    await db.insert(partnerStaff).values({
      id: createId(),
      partnerId: partnerId1,
      userId: fatima.id,
      role: "admin",
      title: "Sales Manager",
      department: "Sales",
      isPrimaryContact: false,
      status: "active",
      permissions: {
        manageListings: true,
        manageTeam: true,
        viewAnalytics: true,
        manageBookings: true,
        respondToLeads: true,
        manageFinancials: false,
        manageSettings: false,
        exportData: true,
      },
      joinedAt: new Date(),
      acceptedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("   ✅ Fatima added as Sales Manager (admin)");

    // Add Omar as sales (Inventory Manager)
    await db.insert(partnerStaff).values({
      id: createId(),
      partnerId: partnerId1,
      userId: omar.id,
      role: "sales",
      title: "Inventory Manager",
      department: "Operations",
      isPrimaryContact: false,
      status: "active",
      permissions: {
        manageListings: true,
        manageTeam: false,
        viewAnalytics: false,
        manageBookings: true,
        respondToLeads: true,
        manageFinancials: false,
        manageSettings: false,
        exportData: false,
      },
      joinedAt: new Date(),
      acceptedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("   ✅ Omar added as Inventory Manager (sales)");

    // Create Partner 2: Premium Auto Trading (owned by Sarah)
    const partnerId2 = createId();
    console.log("\n📝 Creating Partner: Premium Auto Trading");
    
    await db.insert(partner).values({
      id: partnerId2,
      companyNameLegal: "Premium Auto Trading LLC",
      brandName: "Premium Auto Trading",
      tradeLicense: "TL-" + createId().slice(0, 10),
      email: "info@premiumautotrading.ae",
      phone: "+971-4-987-6543",
      status: "active",
      tier: "gold",
      emirate: "Dubai",
      address: "Al Quoz Industrial Area, Dubai",
      description: "Trusted dealer for quality pre-owned vehicles",
      specialties: ["certified", "warranty", "financing"],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("   ✅ Partner created");

    // Add Sarah as owner
    await db.insert(partnerStaff).values({
      id: createId(),
      partnerId: partnerId2,
      userId: sarah.id,
      role: "owner",
      title: "Managing Director",
      department: "Management",
      isPrimaryContact: true,
      status: "active",
      permissions: {
        manageListings: true,
        manageTeam: true,
        viewAnalytics: true,
        manageBookings: true,
        respondToLeads: true,
        manageFinancials: true,
        manageSettings: true,
        exportData: true,
      },
      joinedAt: new Date(),
      acceptedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("   ✅ Sarah added as Owner");

    // Add Ahmed as sales (Sales Executive)
    await db.insert(partnerStaff).values({
      id: createId(),
      partnerId: partnerId2,
      userId: ahmed.id,
      role: "sales",
      title: "Sales Executive",
      department: "Sales",
      isPrimaryContact: false,
      status: "active",
      permissions: {
        manageListings: true,
        manageTeam: false,
        viewAnalytics: false,
        manageBookings: true,
        respondToLeads: true,
        manageFinancials: false,
        manageSettings: false,
        exportData: false,
      },
      joinedAt: new Date(),
      acceptedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("   ✅ Ahmed added as Sales Executive (sales)");

    console.log("\n\n🎉 Setup complete!\n");
    console.log("═══════════════════════════════════════════════════════════════════════");
    console.log("                        PARTNER COMPANIES CREATED");
    console.log("═══════════════════════════════════════════════════════════════════════\n");
    
    console.log("🏢 Luxury Motors Dubai");
    console.log("   Owner: Mohammed Al-Hassan (mohammed.dealer@alifh.ae)");
    console.log("   Staff:");
    console.log("   • Fatima Al-Zahra (Sales Manager - admin role) - fatima.staff@alifh.ae");
    console.log("   • Omar Khalid (Inventory Manager - sales role) - omar.staff@alifh.ae\n");
    
    console.log("🏢 Premium Auto Trading");
    console.log("   Owner: Sarah Al-Mansouri (sarah.dealer@alifh.ae)");
    console.log("   Staff:");
    console.log("   • Ahmed Al-Maktoum (Sales Executive - sales role) - ahmed.staff@alifh.ae\n");
    
    console.log("═══════════════════════════════════════════════════════════════════════\n");
    console.log("✅ All users now have proper partner memberships");
    console.log("✅ Owners can access /partner-dashboard");
    console.log("✅ Staff can access /staff-dashboard\n");

  } catch (error) {
    console.error("❌ Error setting up partners:", error);
    throw error;
  }
}

setupPartnersAndStaff()
  .then(() => {
    console.log("✅ Setup completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  });
