/**
 * Verify Test Users Script
 * 
 * Sets email_verified = true for all test users
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { neon } from '@neondatabase/serverless';

// Load environment variables from root .env.local
config({ path: resolve(process.cwd(), '../../.env.local') });

const sql = neon(process.env.DATABASE_URL!);

async function verifyAllTestUsers() {
  console.log('📧 Setting all test users to email verified...');
  
  try {
    // Update all users to have verified emails
    const result = await sql`
      UPDATE users 
      SET "emailVerified" = true, "updatedAt" = now() 
      WHERE "emailVerified" = false
    `;
    
    console.log(`✅ Updated ${result.length} users to email verified`);
    
    // Check the results
    const users = await sql`SELECT id, name, email, "emailVerified" FROM users ORDER BY "createdAt"`;
    console.log('\n👥 Updated users:');
    console.table(users);
    
  } catch (error) {
    console.error('❌ Error updating users:', error);
  }
}

verifyAllTestUsers();