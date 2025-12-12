#!/usr/bin/env bun

/**
 * Manual Migration Script 
 * Runs migration SQL directly without schema creation
 */

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';

// Load environment variables from root .env.local
config({ path: resolve(process.cwd(), '../../.env.local') });

const manualMigrate = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  console.log('🔍 Manual Migration Process...');
  
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('📖 Reading migration file...');
    const migrationSQL = readFileSync('./drizzle/migrations/0000_dry_maximus.sql', 'utf8');
    
    // Split by statement breakpoint and filter out empty statements
    const statements = migrationSQL
      .split('--> statement-breakpoint')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements`);
    
    console.log('\n⏳ Executing migration statements...');
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`📋 Executing statement ${i + 1}/${statements.length}:`);
      console.log(`   ${statement.substring(0, 80)}${statement.length > 80 ? '...' : ''}`);
      
      try {
        await sql`${sql.unsafe(statement)}`;
        console.log(`✅ Statement ${i + 1} completed`);
      } catch (error) {
        console.error(`❌ Statement ${i + 1} failed:`, error.message);
        // Continue with other statements
      }
    }
    
    console.log('\n📋 Checking created tables:');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('Tables created:', tables.map(t => t.table_name));
    console.log('\n✅ Manual migration completed!');
    
  } catch (error) {
    console.error('❌ Manual migration failed:', error);
  }
};

manualMigrate().catch((err) => {
  console.error('❌ Manual migration script failed:', err);
  process.exit(1);
});