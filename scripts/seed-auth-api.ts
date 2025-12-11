/**
 * Better Auth API Seed Script
 * 
 * Creates test users using Better Auth API to ensure proper password hashing
 */

import { config } from 'dotenv';
import { resolve } from 'path';

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

async function createUserWithBetterAuth(user: TestUser) {
  const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
  
  try {
    // Use Better Auth's sign-up API endpoint
    const response = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        password: user.password,
        name: user.name,
        // Custom fields for our schema
        platformRole: user.platformRole,
        status: user.status,
        emailVerified: true, // Auto-verify for test users
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create user ${user.email}: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log(`  ✓ Created ${user.platformRole}: ${user.name} (${user.email})`);
    return result;
  } catch (error) {
    console.error(`  ❌ Failed to create ${user.email}:`, error);
    throw error;
  }
}

async function seedWithBetterAuth() {
  console.log('🌱 Starting Better Auth API seeding...');
  console.log('👥 Creating test users with Better Auth...');

  const createdUsers: any[] = [];

  for (const user of testUsers) {
    try {
      const result = await createUserWithBetterAuth(user);
      createdUsers.push(result);
    } catch (error) {
      console.error(`Failed to create user ${user.email}:`, error);
      // Continue with other users even if one fails
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n🎉 Better Auth seeding completed!');
  console.log('\n📋 Test Users Created:');
  testUsers.forEach(user => {
    console.log(`  • ${user.name} (${user.email}) - ${user.platformRole} [${user.password}]`);
  });
  
  console.log('\n💡 You can now test the auth system with these credentials!');
  console.log('🔑 All passwords are hashed using Better Auth\'s scrypt algorithm.');
}

// Only run if this script is executed directly
if (import.meta.main) {
  seedWithBetterAuth().catch(console.error);
}

export { seedWithBetterAuth, testUsers };