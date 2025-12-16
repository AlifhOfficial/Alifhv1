/**
 * Run the migration to split user_favorite into two tables
 * This allows users to have BOTH favorite AND superlike on same listing
 */

import { Pool } from 'pg';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
config({ path: '../../.env.local' });

async function runMigration() {
  console.log('⏳ Running split favorites/superlikes migration...\n');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  });
  
  try {
    // Read the migration SQL
    const migrationPath = join(process.cwd(), 'drizzle/0000_split_favorites_superlikes.sql');
    console.log(`📂 Reading migration from: ${migrationPath}`);
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    console.log('📄 Migration SQL loaded');
    console.log('🔄 Executing migration...\n');
    
    // Execute the migration
    await pool.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!\n');
    
    // Verify counts
    console.log('📊 Verification:');
    const favResult = await pool.query('SELECT COUNT(*) as count FROM user_favorite');
    const superResult = await pool.query('SELECT COUNT(*) as count FROM user_superlike');
    
    console.log(`  - Favorites: ${favResult.rows[0].count}`);
    console.log(`  - Superlikes: ${superResult.rows[0].count}\n`);
    
    console.log('🎉 Users can now have BOTH favorite AND superlike on same listing!');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
