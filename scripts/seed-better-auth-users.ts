#!/usr/bin/env bun

/**
 * Better Auth User Seeding Script
 * Based on GitHub discussion: https://github.com/better-auth/better-auth/discussions/xxx
 * 
 * This creates users through Better Auth API for proper account management
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createId } from '@paralleldrive/cuid2';
import { neon } from '@neondatabase/serverless';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

// Import the auth instance
import { auth } from '../apps/web/src/lib/auth';

const sql = neon(process.env.DATABASE_URL!);

// Define test users with their roles and partner assignments
const testUsers = [
  // Alifh team members
  {
    name: 'Super Admin',
    email: 'superadmin@alifh.ae',
    password: 'Test123!',
    platformRole: 'super-admin',
    isAlifhTeam: true,
  },
  {
    name: 'Admin User',
    email: 'admin@alifh.ae',
    password: 'Test123!',
    platformRole: 'admin',
    isAlifhTeam: true,
  },
  {
    name: 'Jane Smith',
    email: 'jane@alifh.ae',
    password: 'Test123!',
    platformRole: 'staff',
    isAlifhTeam: true,
  },
  
  // Partner A users (TechCorp)
  {
    name: 'Alice Johnson',
    email: 'alice@techcorp.com',
    password: 'Test123!',
    platformRole: 'user',
    partnerRole: 'owner',
    partnerName: 'TechCorp Solutions',
    partnerSlug: 'techcorp',
  },
  {
    name: 'Bob Wilson',
    email: 'bob@techcorp.com',
    password: 'Test123!',
    platformRole: 'user',
    partnerRole: 'admin',
    partnerName: 'TechCorp Solutions',
    partnerSlug: 'techcorp',
  },
  {
    name: 'Carol Brown',
    email: 'carol@techcorp.com',
    password: 'Test123!',
    platformRole: 'user',
    partnerRole: 'staff',
    partnerName: 'TechCorp Solutions',
    partnerSlug: 'techcorp',
  },
  
  // Partner B users (RestaurantCorp)
  {
    name: 'David Chen',
    email: 'david@restaurantcorp.com',
    password: 'Test123!',
    platformRole: 'user',
    partnerRole: 'owner',
    partnerName: 'RestaurantCorp',
    partnerSlug: 'restaurantcorp',
  },
  {
    name: 'Eva Martinez',
    email: 'eva@restaurantcorp.com',
    password: 'Test123!',
    platformRole: 'user',
    partnerRole: 'admin',
    partnerName: 'RestaurantCorp',
    partnerSlug: 'restaurantcorp',
  },
  
  // Regular users
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'Test123!',
    platformRole: 'user',
  },
  {
    name: 'Test Dashboard User',
    email: 'dashboard@example.com',
    password: 'Test123!',
    platformRole: 'user',
  },
];

async function clearExistingData() {
  console.log('🗑️ Clearing existing data...');
  
  try {
    await sql`DELETE FROM partner_members`;
    await sql`DELETE FROM partners`;
    await sql`DELETE FROM account`;
    await sql`DELETE FROM session`;
    await sql`DELETE FROM verification`;
    await sql`DELETE FROM users`;
    
    console.log('✅ Cleared all existing data');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
}

async function createUsersWithBetterAuth() {
  console.log('👥 Creating users with Better Auth API...');
  
  const createdUsers: Array<{ user: any; partnerInfo?: any }> = [];
  
  for (const userData of testUsers) {
    try {
      console.log(`Creating user: ${userData.name} (${userData.email})`);
      
      const result = await auth.api.signUpEmail({
        body: {
          name: userData.name,
          email: userData.email,
          password: userData.password,
        },
      });
      
      if (result?.user) {
        console.log(`✅ Created user: ${userData.name}`);
        
        createdUsers.push({
          user: result.user,
          partnerInfo: userData.partnerRole ? {
            role: userData.partnerRole,
            partnerName: userData.partnerName,
            partnerSlug: userData.partnerSlug,
          } : undefined,
        });
      }
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error: any) {
      if (error.message?.includes('User already exists')) {
        console.log(`ℹ️ User ${userData.email} already exists`);
      } else {
        console.error(`❌ Error creating user ${userData.email}:`, error);
      }
    }
  }
  
  return createdUsers;
}

async function updateUserPlatformRoles(createdUsers: Array<{ user: any; partnerInfo?: any }>) {
  console.log('🔄 Updating platform roles...');
  
  for (const { user } of createdUsers) {
    try {
      const userData = testUsers.find(u => u.email === user.email);
      if (!userData) continue;
      
      await sql`
        UPDATE users 
        SET "platformRole" = ${userData.platformRole}, "emailVerified" = true, "updatedAt" = NOW()
        WHERE email = ${user.email}
      `;
      
      console.log(`✅ Updated platform role for ${user.email}: ${userData.platformRole}`);
    } catch (error: any) {
      console.error(`❌ Error updating platform role for ${user.email}:`, error);
    }
  }
}

async function createPartnerOrganizations(createdUsers: Array<{ user: any; partnerInfo?: any }>) {
  console.log('🏢 Creating partner organizations...');
  
  const partnersMap = new Map<string, string>();
  const partnerUsers = createdUsers.filter(u => u.partnerInfo);
  
  // Create unique partners
  const uniquePartners = new Map<string, any>();
  for (const { user, partnerInfo } of partnerUsers) {
    if (!partnerInfo || uniquePartners.has(partnerInfo.partnerSlug)) continue;
    
    uniquePartners.set(partnerInfo.partnerSlug, {
      name: partnerInfo.partnerName,
      slug: partnerInfo.partnerSlug,
      ownerId: partnerInfo.role === 'owner' ? user.id : null,
    });
  }
  
  for (const [slug, partnerData] of uniquePartners) {
    try {
      const partnerId = createId();
      const ownerUser = partnerUsers.find(u => 
        u.partnerInfo?.partnerSlug === slug && u.partnerInfo?.role === 'owner'
      );
      
      await sql`
        INSERT INTO partners (
          id, name, slug, description, status, email, phone, website, 
          created_at, updated_at, created_by
        ) VALUES (
          ${partnerId}, ${partnerData.name}, ${slug}, 
          ${'Partner organization for ' + partnerData.name}, 'active',
          ${'contact@' + slug + '.com'}, '+1-555-0123', 
          ${'https://' + slug + '.com'}, NOW(), NOW(), ${ownerUser?.user.id || null}
        )
      `;
      
      partnersMap.set(slug, partnerId);
      console.log(`✅ Created partner: ${partnerData.name}`);
    } catch (error: any) {
      console.error(`❌ Error creating partner ${partnerData.name}:`, error);
    }
  }
  
  return partnersMap;
}

async function createPartnerMemberships(
  createdUsers: Array<{ user: any; partnerInfo?: any }>, 
  partnersMap: Map<string, string>
) {
  console.log('👥 Creating partner memberships...');
  
  for (const { user, partnerInfo } of createdUsers) {
    if (!partnerInfo) continue;
    
    const partnerId = partnersMap.get(partnerInfo.partnerSlug);
    if (!partnerId) continue;
    
    try {
      const membershipId = createId();
      const ownerUser = createdUsers.find(u => 
        u.partnerInfo?.partnerSlug === partnerInfo.partnerSlug && 
        u.partnerInfo?.role === 'owner'
      );
      
      await sql`
        INSERT INTO partner_members (
          id, user_id, partner_id, role, is_active, created_at, updated_at, invited_by
        ) VALUES (
          ${membershipId}, ${user.id}, ${partnerId}, ${partnerInfo.role},
          true, NOW(), NOW(), ${ownerUser?.user.id || user.id}
        )
      `;
      
      // Update user's active partner
      await sql`
        UPDATE users 
        SET "activePartnerId" = ${partnerId}, "updatedAt" = NOW()
        WHERE id = ${user.id}
      `;
      
      console.log(`✅ Created ${partnerInfo.role} membership for ${user.email}`);
    } catch (error: any) {
      console.error(`❌ Error creating membership for ${user.email}:`, error);
    }
  }
}

async function main() {
  try {
    console.log('🚀 Starting Better Auth compatible database seed...\n');
    
    await clearExistingData();
    const createdUsers = await createUsersWithBetterAuth();
    await updateUserPlatformRoles(createdUsers);
    const partnersMap = await createPartnerOrganizations(createdUsers);
    await createPartnerMemberships(createdUsers, partnersMap);
    
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Test Users Created (can now sign in directly):');
    console.log('🔵 Super Admin: superadmin@alifh.ae / Test123!');
    console.log('🔵 Admin: admin@alifh.ae / Test123!');
    console.log('🔵 Staff: jane@alifh.ae / Test123!');
    console.log('🟢 Partner Owner (TechCorp): alice@techcorp.com / Test123!');
    console.log('🟡 Partner Admin (TechCorp): bob@techcorp.com / Test123!');
    console.log('🩷 Partner Staff (TechCorp): carol@techcorp.com / Test123!');
    console.log('🟢 Partner Owner (RestaurantCorp): david@restaurantcorp.com / Test123!');
    console.log('🟡 Partner Admin (RestaurantCorp): eva@restaurantcorp.com / Test123!');
    console.log('⚫ Regular Users: john@example.com, dashboard@example.com / Test123!');
    
    console.log('\n🔑 All users can now sign in directly with their credentials!');
    console.log('   Go to http://localhost:3000 and test the portal routing system');
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

main();