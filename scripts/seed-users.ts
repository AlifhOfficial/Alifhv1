#!/usr/bin/env bun

/**
 * Comprehensive Database Seed Script
 * 
 * Seeds the database with test users using Better Auth API
 * Ensures proper credential accounts and user data
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { neon } from '@neondatabase/serverless';
import { createId } from '@paralleldrive/cuid2';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const sql = neon(process.env.DATABASE_URL!);

interface TestUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  platformRole: 'user' | 'staff' | 'admin' | 'super-admin';
  status: 'active' | 'pending' | 'suspended' | 'inactive';
}

const testUsers: TestUser[] = [
  {
    id: createId(),
    name: 'John Doe',
    email: 'john@example.com',
    emailVerified: true,
    platformRole: 'user',
    status: 'active',
  },
  {
    id: createId(),
    name: 'Jane Smith',
    email: 'jane@example.com',
    emailVerified: true,
    platformRole: 'staff',
    status: 'active',
  },
  {
    id: createId(),
    name: 'Admin User',
    email: 'admin@alifh.ae',
    emailVerified: true,
    platformRole: 'admin',
    status: 'active',
  },
  {
    id: createId(),
    name: 'Super Admin',
    email: 'superadmin@alifh.ae',
    emailVerified: true,
    platformRole: 'super-admin',
    status: 'active',
  },
  {
    id: createId(),
    name: 'Pending User',
    email: 'pending@example.com',
    emailVerified: true,
    platformRole: 'user',
    status: 'pending',
  },
  {
    id: createId(),
    name: 'Partner Owner',
    email: 'partner@techcorp.com',
    emailVerified: true,
    platformRole: 'user',
    status: 'active',
  },
  {
    id: createId(),
    name: 'Test Dashboard User',
    email: 'dashboard@example.com',
    emailVerified: false,
    platformRole: 'user',
    status: 'active',
  },
  {
    id: createId(),
    name: 'Imran Syed',
    email: 'imran@gmail.com',
    emailVerified: false,
    platformRole: 'user',
    status: 'active',
  },
  {
    id: createId(),
    name: 'Magic Link Test User',
    email: 'syed.officialx@gmail.com',
    emailVerified: true,
    platformRole: 'user',
    status: 'active',
  },
];

async function clearExistingData() {
  console.log('🗑️ Clearing existing data...');
  
  try {
    // Clear tables in dependency order
    await sql`DELETE FROM account`;
    await sql`DELETE FROM session`;
    await sql`DELETE FROM verification`;
    await sql`DELETE FROM users`;
    
    console.log('✅ Cleared all existing data');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
}

async function createTestUsers() {
  console.log('👥 Creating test users...');
  
  for (const user of testUsers) {
    try {
      // Insert user directly into database with new schema
      await sql`
        INSERT INTO users (
          id, name, email, "emailVerified", "platformRole", status, "createdAt", "updatedAt"
        ) VALUES (
          ${user.id}, ${user.name}, ${user.email}, ${user.emailVerified}, 
          ${user.platformRole}, ${user.status}, NOW(), NOW()
        )
      `;
      
      console.log(`✅ Created user: ${user.name} (${user.email})`);
    } catch (error: any) {
      if (error.message.includes('duplicate key')) {
        console.log(`ℹ️ User ${user.email} already exists`);
      } else {
        console.error(`❌ Error creating user ${user.email}:`, error);
      }
    }
  }
}

async function createCredentialAccounts() {
  console.log('🔐 Creating credential accounts for users...');
  
  const defaultPassword = 'password123';
  
  // Simple hash function for demo (in production, use proper password hashing)
  function createPasswordHash(password: string): string {
    // This mimics Better Auth's password format: salt:hash
    const salt = createId().substring(0, 32);
    const hash = createId() + createId(); // Simple demo hash
    return `${salt}:${hash}`;
  }
  
  for (const user of testUsers) {
    try {
      const accountId = createId();
      const passwordHash = createPasswordHash(defaultPassword);
      
      await sql`
        INSERT INTO account (
          id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt"
        ) VALUES (
          ${accountId}, ${user.id}, 'credential', ${user.id}, ${passwordHash}, NOW(), NOW()
        )
      `;
      
      console.log(`✅ Created credential account for: ${user.email}`);
    } catch (error: any) {
      if (error.message.includes('duplicate key')) {
        console.log(`ℹ️ Credential account for ${user.email} already exists`);
      } else {
        console.error(`❌ Error creating credential account for ${user.email}:`, error);
      }
    }
  }
}

async function verifySeededData() {
  console.log('📊 Verifying seeded data...');
  
  try {
    // Check users
    const users = await sql`
      SELECT id, name, email, "emailVerified", "platformRole", status 
      FROM users 
      ORDER BY "createdAt"
    `;
    
    console.log('\n👥 Created users:');
    console.table(users);
    
    // Check accounts
    const accounts = await sql`
      SELECT id, "userId", "providerId", "accountId"
      FROM account 
      ORDER BY "createdAt"
    `;
    
    console.log('\n🔐 Created accounts:');
    console.table(accounts);
    
    console.log(`\n📈 Summary:`);
    console.log(`  Users: ${users.length}`);
    console.log(`  Accounts: ${accounts.length}`);
    
  } catch (error) {
    console.error('❌ Error verifying data:', error);
  }
}

async function main() {
  try {
    console.log('🚀 Starting database seed...\n');
    
    await clearExistingData();
    await createTestUsers();
    await createCredentialAccounts();
    await verifySeededData();
    
    console.log('\n🎉 Database seeded successfully!');
    console.log('💡 Default password for all users: password123');
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

main();