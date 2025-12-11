import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from './auth/schema';
import * as relations from './auth/relations';

// Get database URL from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

// Create Neon connection pool
const pool = new Pool({ connectionString });

// Initialize Drizzle client with schema and relations
export const db = drizzle(pool, { schema: { ...schema, ...relations } });
