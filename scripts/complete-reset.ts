#!/usr/bin/env bun

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function completeReset() {
  try {
    console.log('🗑️ Performing complete database reset...');
    
    // Drop all tables first (if they exist)
    const tables = [
      'account', 'session', 'verification', 'users', 
      'partners', 'partner_members', 'partner_requests', 
      'audit_log', '__drizzle_migrations'
    ];
    
    for (const table of tables) {
      try {
        const query = `DROP TABLE IF EXISTS "${table}" CASCADE`;
        await sql.query(query);
        console.log(`✅ Dropped table: ${table}`);
      } catch (error: any) {
        console.log(`ℹ️ Table ${table} didn't exist or couldn't be dropped`);
      }
    }
    
    // Drop all custom ENUM types
    const enums = [
      'platform_role', 'partner_role', 'user_status', 
      'partner_status', 'request_status'
    ];
    
    for (const enumType of enums) {
      try {
        const query = `DROP TYPE IF EXISTS "${enumType}" CASCADE`;
        await sql.query(query);
        console.log(`✅ Dropped enum: ${enumType}`);
      } catch (error: any) {
        console.log(`ℹ️ Enum ${enumType} didn't exist or couldn't be dropped`);
      }
    }
    
    // Drop any remaining sequences
    try {
      await sql`DROP SEQUENCE IF EXISTS users_id_seq CASCADE`;
      console.log('✅ Dropped sequences');
    } catch (error: any) {
      console.log('ℹ️ No sequences to drop');
    }
    
    console.log('🎉 Database completely reset! Ready for fresh migration.');
    
  } catch (error) {
    console.error('❌ Failed to reset database:', error);
    process.exit(1);
  }
}

completeReset();