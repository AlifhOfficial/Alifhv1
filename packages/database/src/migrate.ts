/**
 * Simple Migration Script
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables
config({ path: '../../.env.local' });

async function runMigrations() {
  console.log('⏳ Running migrations...');
  
  try {
    const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
    const db = drizzle(sql);
    
    await migrate(db, { migrationsFolder: './drizzle/migrations' });
    console.log('✅ Migrations completed!');
    
    await sql.end();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();