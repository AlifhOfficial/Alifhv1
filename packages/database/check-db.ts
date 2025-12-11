import { config } from 'dotenv';
import { resolve } from 'path';
import { neon } from '@neondatabase/serverless';

// Load environment variables from root .env.local
config({ path: resolve(process.cwd(), '../../.env.local') });

const sql = neon(process.env.DATABASE_URL!);

async function checkDatabase() {
  console.log('🔍 Checking database contents...');
  
  try {
    // Check users
    const users = await sql`SELECT id, name, email, platform_role, status, email_verified FROM users ORDER BY created_at`;
    console.log('\n👥 Users in database:');
    console.table(users);
    
    // Check accounts (Better Auth credential storage)
    const accounts = await sql`SELECT id, user_id, provider_id, account_id, password FROM account WHERE provider_id = 'credential'`;
    console.log('\n🔑 Credential accounts in database:');
    console.table(accounts);
    
    // Check session
    const sessions = await sql`SELECT id, user_id, token FROM session`;
    console.log('\n📋 Sessions in database:');
    console.table(sessions);
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  }
}

checkDatabase();