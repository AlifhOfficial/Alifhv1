#!/usr/bin/env bun

/**
 * Simple User Seed Script - New Schema Compatible
 * 
 * Creates test users using Better Auth to ensure proper account creation
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { neon } from '@neondatabase/serverless';

// Load environment variables from root .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const sql = neon(process.env.DATABASE_URL!);

async function createSimpleTestUser() {
  console.log('👤 Creating simple test user...');
  
  try {
    // Insert a test user directly with the new schema
    const userId = 'test-user-' + Date.now();
    
    await sql`
      INSERT INTO users (id, name, email, "emailVerified", "platformRole", status, "createdAt", "updatedAt")
      VALUES (${userId}, 'Test User', 'test@example.com', true, 'user', 'active', NOW(), NOW())
    `;
    
    console.log('✅ Test user created successfully');
    
    // Verify the user was created
    const users = await sql`SELECT id, name, email, "emailVerified", "platformRole", status FROM users`;
    console.log('\n👥 All users in database:');
    console.table(users);
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  }
}

createSimpleTestUser();