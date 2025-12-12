#!/usr/bin/env bun

/**
 * Better Auth API Seed Script
 * 
 * Uses Better Auth server API directly to create users with proper hashing and accounts
 */

import { auth } from '../apps/web/src/lib/auth';
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
  emailVerified: boolean;
}

const testUsers: TestUser[] = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    platformRole: 'user',
    status: 'active',
    emailVerified: true,
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    platformRole: 'staff',
    status: 'active',
    emailVerified: true,
  },
  {
    name: 'Admin User',
    email: 'admin@alifh.ae',
    password: 'admin123',
    platformRole: 'admin',
    status: 'active',
    emailVerified: true,
  },
  {
    name: 'Super Admin',
    email: 'superadmin@alifh.ae',
    password: 'super123',
    platformRole: 'super-admin',
    status: 'active',
    emailVerified: true,
  },
  {
    name: 'Pending User',
    email: 'pending@example.com',
    password: 'password123',
    platformRole: 'user',
    status: 'pending',
    emailVerified: false,
  },
  {
    name: 'Partner Owner',
    email: 'partner@techcorp.com',
    password: 'partner123',
    platformRole: 'user',
    status: 'active',
    emailVerified: true,
  },
  {
    name: 'Test Dashboard User',
    email: 'dashboard@example.com',
    password: 'password123',
    platformRole: 'user',
    status: 'active',
    emailVerified: false,
  },
  {
    name: 'Imran Syed',
    email: 'imran@gmail.com',
    password: 'password123',
    platformRole: 'user',
    status: 'active',
    emailVerified: false,
  },
  {
    name: 'Magic Link Test User',
    email: 'syed.officialx@gmail.com',
    password: 'password123',
    platformRole: 'user',
    status: 'active',
    emailVerified: true,
  },
];

async function createTestUsers() {
  console.log('👥 Creating test users with Better Auth Server API...');
  const createdUsers: any[] = [];
  
  for (const userData of testUsers) {
    try {
      console.log(`\n📝 Creating user: ${userData.email}`);
      
      // Create a mock request object for Better Auth API
      const mockRequest = new Request('http://localhost:3000/api/auth/sign-up/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          name: userData.name,
        }),
      });

      // Use Better Auth server API to create user with email/password
      const signUpResponse = await auth.handler(mockRequest);
      
      if (signUpResponse.ok) {
        const signUpResult = await signUpResponse.json();
        console.log(`✅ Created user: ${userData.name} (${userData.email})`);
        
        if (signUpResult.user?.id) {
          // Now update the user with platform-specific fields using direct database access
          const { neon } = await import('@neondatabase/serverless');
          const sql = neon(process.env.DATABASE_URL!);
          
          await sql`
            UPDATE users 
            SET 
              "platformRole" = ${userData.platformRole},
              status = ${userData.status},
              "emailVerified" = ${userData.emailVerified}
            WHERE id = ${signUpResult.user.id}
          `;
          
          console.log(`✅ Updated platform fields for: ${userData.email}`);
          createdUsers.push({
            id: signUpResult.user.id,
            name: userData.name,
            email: userData.email,
            platformRole: userData.platformRole,
            status: userData.status,
          });
        }
      } else {
        const errorData = await signUpResponse.text();
        console.error(`❌ Failed to create user: ${userData.email} - ${errorData}`);
      }
    } catch (error: any) {
      console.error(`❌ Error creating user ${userData.email}:`, error.message || error);
    }
  }
  
  return createdUsers;
}

async function verifyUsers() {
  console.log('\n📊 Verifying created users...');
  
  try {
    // Use Better Auth to list users (if available) or query database directly
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL!);
    
    const users = await sql`
      SELECT id, name, email, "emailVerified", "platformRole", status 
      FROM users 
      ORDER BY "createdAt"
    `;
    
    console.log('\n👥 All users in database:');
    console.table(users);
    
    const accounts = await sql`
      SELECT "userId", "providerId", "accountId"
      FROM account 
      ORDER BY "createdAt"
    `;
    
    console.log('\n🔐 Associated accounts:');
    console.table(accounts);
    
    console.log(`\n📈 Summary:`);
    console.log(`  Users: ${users.length}`);
    console.log(`  Accounts: ${accounts.length}`);
    console.log(`  Default password: password123 (except admins)`);
    
  } catch (error) {
    console.error('❌ Error verifying users:', error);
  }
}

async function main() {
  try {
    console.log('🚀 Starting Better Auth API seed...\n');
    
    const createdUsers = await createTestUsers();
    
    console.log(`\n✨ Successfully created ${createdUsers.length} users`);
    
    await verifyUsers();
    
    console.log('\n🎉 Database seeded successfully with Better Auth API!');
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

main();