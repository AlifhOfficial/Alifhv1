/**
 * Database Seed Script - Better Auth Compatible
 * 
 * Creates test users using Better Auth API to ensure proper credential accounts are created
 */

import { auth } from '../apps/web/src/lib/auth';
import { db, users, partners, partnerMembers, partnerRequests, auditLog, account } from '../packages/database/src/index';
import { createId } from '@paralleldrive/cuid2';
import { config } from 'dotenv';
import { resolve } from 'path';
import { eq } from 'drizzle-orm';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

interface TestUser {
  name: string;
  email: string;
  password: string;
  platformRole: 'user' | 'staff' | 'admin' | 'super-admin';
  status: 'active' | 'pending' | 'suspended' | 'inactive';
}

const testUsers: TestUser[] = [
  {
    name: 'John Doe',
    email: 'john@example.com', 
    password: 'password123',
    platformRole: 'user',
    status: 'active',
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123', 
    platformRole: 'staff',
    status: 'active',
  },
  {
    name: 'Admin User',
    email: 'admin@alifh.ae',
    password: 'admin123',
    platformRole: 'admin',
    status: 'active',
  },
  {
    name: 'Super Admin',
    email: 'superadmin@alifh.ae',
    password: 'super123',
    platformRole: 'super-admin',
    status: 'active',
  },
  {
    name: 'Pending User',
    email: 'pending@example.com',
    password: 'password123',
    platformRole: 'user',
    status: 'pending',
  },
  {
    name: 'Partner Owner',
    email: 'partner@techcorp.com',
    password: 'partner123',
    platformRole: 'user',
    status: 'active',
  },
];

async function clearExistingData() {
  console.log('🗑️  Clearing existing data...');
  
  try {
    // Clear in dependency order
    await db.delete(auditLog);
    await db.delete(partnerMembers); 
    await db.delete(partnerRequests);
    await db.delete(partners);
    await db.delete(account); // Clear Better Auth accounts
    await db.delete(users);   // Clear users
    
    console.log('  ✓ Cleared all existing data');
  } catch (error) {
    console.error('  ❌ Error clearing data:', error);
  }
}

async function createTestUsers() {
  console.log('👥 Creating test users with Better Auth...');
  const createdUsers: any[] = [];
  
  for (const userData of testUsers) {
    try {
      // Use Better Auth server API to create user
      const signUpResult = await auth.api.signUpEmail({
        body: {
          email: userData.email,
          password: userData.password,
          name: userData.name,
        },
      });

      if (signUpResult?.user) {
        // Update user with custom fields
        const [updatedUser] = await db
          .update(users)
          .set({
            platformRole: userData.platformRole as any,
            status: userData.status as any,
            emailVerified: true, // Mark as verified for testing
          })
          .where(eq(users.id, signUpResult.user.id))
          .returning();

        createdUsers.push(updatedUser);
        console.log(`  ✓ Created user: ${userData.name} (${userData.email}) - ${userData.platformRole}`);
      }
    } catch (error: any) {
      console.error(`  ❌ Failed to create user ${userData.email}:`, error.message || error);
    }
  }
  
  return createdUsers;
}

async function createTestPartners(createdUsers: any[]) {
  console.log('🏢 Creating test partners...');
  
  const adminUser = createdUsers.find(u => u.email === 'admin@alifh.ae');
  const partnerUser = createdUsers.find(u => u.email === 'partner@techcorp.com');
  
  if (!adminUser) {
    console.error('  ❌ Admin user not found for partner creation');
    return [];
  }
  
  const testPartners = [
    {
      id: createId(),
      name: 'TechCorp Solutions',
      slug: 'techcorp',
      email: 'info@techcorp.com',
      phone: '+971-50-123-4567', 
      website: 'https://techcorp.com',
      description: 'Leading technology solutions provider in UAE',
      status: 'active' as const,
      createdBy: adminUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: createId(),
      name: 'Digital Innovations',
      slug: 'digital-innovations',
      email: 'contact@digitalinnovations.ae',
      phone: '+971-50-987-6543',
      website: 'https://digitalinnovations.ae',
      description: 'Digital transformation and innovation consultancy',
      status: 'active' as const,
      createdBy: adminUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const createdPartners = await db.insert(partners).values(testPartners).returning();
  
  for (const partner of createdPartners) {
    console.log(`  ✓ Created partner: ${partner.name} (${partner.slug})`);
  }
  
  // Create partner membership
  if (partnerUser && createdPartners[0]) {
    console.log('🤝 Creating partner memberships...');
    
    await db.insert(partnerMembers).values({
      id: createId(),
      userId: partnerUser.id,
      partnerId: createdPartners[0].id,
      role: 'owner',
      isActive: true,
      invitedBy: adminUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log(`  ✓ Made ${partnerUser.name} owner of ${createdPartners[0].name}`);
  }
  
  return createdPartners;
}

async function createSampleRequests(createdUsers: any[]) {
  console.log('📝 Creating sample partner request...');
  
  const johnDoe = createdUsers.find(u => u.email === 'john@example.com');
  
  if (johnDoe) {
    await db.insert(partnerRequests).values({
      id: createId(),
      userId: johnDoe.id,
      businessName: 'Doe Enterprises',
      businessEmail: 'business@doeenterprises.com',
      businessPhone: '+971-50-555-1234',
      businessWebsite: 'https://doeenterprises.com',
      description: 'Import/export business specializing in electronics and consumer goods',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      reviewedBy: null,
      reviewedAt: null,
      rejectionReason: null,
      partnerId: null,
    });
    
    console.log(`  ✓ Created partner request for ${johnDoe.name}`);
  }
}

async function createAuditEntries() {
  console.log('📊 Creating audit log entries...');
  
  const auditEntries = [
    {
      id: createId(),
      action: 'database.seed',
      entityType: 'system',
      entityId: 'seed-script',
      userId: null,
      oldValues: null,
      newValues: JSON.stringify({ 
        action: 'Database seeding completed',
        timestamp: new Date(),
        usersCreated: testUsers.length,
        partnersCreated: 2
      }),
      ipAddress: '127.0.0.1',
      userAgent: 'seed-script/1.0',
      createdAt: new Date(),
    }
  ];

  await db.insert(auditLog).values(auditEntries);
  console.log('  ✓ Created audit log entries');
}

async function seed() {
  try {
    console.log('🌱 Starting Better Auth compatible database seed...');
    console.log('');
    
    // Clear existing data
    await clearExistingData();
    console.log('');
    
    // Create users with Better Auth
    const createdUsers = await createTestUsers();
    console.log('');
    
    // Create partners
    const createdPartners = await createTestPartners(createdUsers);
    console.log('');
    
    // Create sample requests
    await createSampleRequests(createdUsers);
    console.log('');
    
    // Create audit entries
    await createAuditEntries();
    console.log('');
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📋 Test Users Created:');
    for (const userData of testUsers) {
      console.log(`  • ${userData.name} (${userData.email}) - ${userData.platformRole} [${userData.password}]`);
    }
    console.log('');
    console.log('🏢 Test Partners Created:');
    console.log('  • TechCorp Solutions (techcorp)');
    console.log('  • Digital Innovations (digital-innovations)');
    console.log('');
    console.log('💡 You can now test the auth system with these credentials!');
    console.log('   Sign in at: http://localhost:3000/signin');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed().catch(console.error).finally(() => process.exit(0));