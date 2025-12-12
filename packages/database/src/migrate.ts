/**
 * Simple Migration Script
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Load environment variables
config({ path: '../../.env.local' });

async function runMigrations() {
  console.log('⏳ Running migrations...');
  
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql);
    
    await migrate(db, { migrationsFolder: './drizzle/migrations' });
    console.log('✅ Migrations completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();