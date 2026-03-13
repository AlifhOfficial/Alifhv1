/**
 * Simple Migration Script
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { getDatabaseUrl } from './env';

// Load environment variables
config({ path: '../../.env.local' });

async function runMigrations() {
  console.log('⏳ Running migrations...');
  
  try {
    const connectionString = getDatabaseUrl();
    if (!connectionString) {
      throw new Error('DATABASE_URL or STAGING_DATABASE_URL environment variable is required');
    }

    const sql = neon(connectionString);
    const db = drizzle(sql);
    
    await migrate(db, { migrationsFolder: './drizzle/migrations' });
    console.log('✅ Migrations completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
