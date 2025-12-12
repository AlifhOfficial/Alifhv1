#!/usr/bin/env bun

/**
 * Debug Migration Script
 */

import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from root .env.local
config({ path: resolve(process.cwd(), '../../.env.local') });

const debugMigrations = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  console.log('🔍 Debug Migration Process...');
  console.log('📂 Working directory:', process.cwd());
  console.log('🗄️ DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

  // Check connection
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('\n🔗 Testing database connection...');
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Connection successful:', result);
  } catch (error) {
    console.error('❌ Connection failed:', error);
    return;
  }

  // Check existing tables before migration
  console.log('\n📋 Tables before migration:');
  try {
    const tablesBefore = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log('Tables found:', tablesBefore.map(t => t.table_name));
  } catch (error) {
    console.log('No tables found or error:', error.message);
  }

  // Create Drizzle DB instance
  const db = drizzle(sql);

  try {
    console.log('\n⏳ Running migrations...');
    console.log('📁 Migration folder: ./drizzle/migrations');
    
    await migrate(db, { migrationsFolder: './drizzle/migrations' });
    
    console.log('✅ Migrations completed!');
  } catch (error) {
    console.error('❌ Migration error:', error);
  }

  // Check tables after migration
  console.log('\n📋 Tables after migration:');
  try {
    const tablesAfter = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log('Tables found:', tablesAfter.map(t => t.table_name));
  } catch (error) {
    console.log('Error checking tables:', error.message);
  }
};

debugMigrations().catch((err) => {
  console.error('❌ Debug migration failed:', err);
  process.exit(1);
});