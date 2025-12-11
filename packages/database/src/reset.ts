import { Pool } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from root .env.local
config({ path: resolve(process.cwd(), '../../.env.local') });

const resetDatabase = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  console.log('🗑️  Dropping all tables...');

  // Drop all tables
  await pool.query(`
    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
    GRANT ALL ON SCHEMA public TO public;
  `);

  console.log('✅ Database reset complete! All tables dropped.');
  console.log('💡 Run "bun run migrate" to create fresh tables.');

  await pool.end();
};

resetDatabase().catch((err) => {
  console.error('❌ Database reset failed!');
  console.error(err);
  process.exit(1);
});
